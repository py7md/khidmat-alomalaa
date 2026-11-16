import Fastify from 'fastify';
import { z } from 'zod';
import { AgentService } from './ai/agent.service.js';
import { HandoffService } from './handoff/handoff.service.js';
import { safeLog } from './security/pii-redactor.js';
import { MessageDeduplicator, parseMessage } from './whatsapp/webhook.js';
import { createWhatsAppProvider } from './whatsapp/whatsapp.factory.js';
import { MessageSender } from './whatsapp/message-sender.js';
import type { WhatsAppProvider } from './whatsapp/whatsapp-provider.interface.js';

const configSchema = z.object({ verifyToken: z.string().min(1) });

type BuildAppOptions = { verifyToken?: string; whatsappProvider?: WhatsAppProvider };

export async function buildApp(input: BuildAppOptions = {}) {
  const config = configSchema.parse({ verifyToken: input.verifyToken ?? process.env.WEBHOOK_VERIFY_TOKEN ?? 'change-me' });
  const app = Fastify({ logger: false });
  const agent = new AgentService();
  const handoff = new HandoffService();
  const dedupe = new MessageDeduplicator();
  const sender = new MessageSender(input.whatsappProvider ?? createWhatsAppProvider());

  app.get('/health', async () => ({ ok: true, service: 'خدمة العملاء' }));
  app.get('/webhooks/whatsapp', async (request, reply) => {
    const query = request.query as Record<string, string>;
    if (query['hub.verify_token'] !== config.verifyToken) return reply.code(403).send('Forbidden');
    return reply.type('text/plain').send(query['hub.challenge'] ?? '');
  });
  app.post('/webhooks/whatsapp', async (request, reply) => {
    const message = parseMessage(request.body);
    if (!message) {
      if ((request.body as { object?: unknown })?.object === 'whatsapp_business_account') return { ok: true, ignored: true };
      return reply.code(400).send({ error: 'INVALID_MESSAGE' });
    }
    if (!message.text?.body) return { ok: true, ignored: true };
    const state = dedupe.begin(message.id);
    if (state !== 'new') return { ok: true, duplicate: true, processing: state === 'processing' };
    const result = agent.reply(message.text?.body ?? '');
    if (result.handoff) handoff.open(message.from, 'طلب غير معروف أو يحتاج موظف');
    safeLog('incoming_message', message.from);

    try {
      const sent = await sender.send(message.from, result.text);
      dedupe.markSent(message.id);
      return { ok: true, reply: result.text, handoff: result.handoff, sent: sent.accepted, providerMessageId: sent.providerMessageId };
    } catch (error) {
      dedupe.release(message.id);
      safeLog('outgoing_message_failed', message.from);
      request.log.error({ error }, 'WhatsApp reply failed');
      return reply.code(502).send({ ok: false, error: 'WHATSAPP_SEND_FAILED' });
    }
  });
  app.get('/admin/handoffs', async (request, reply) => {
    const token = process.env.ADMIN_TOKEN;
    if (!token || token === 'local-admin' || request.headers.authorization !== `Bearer ${token}`) return reply.code(401).send({ error: 'UNAUTHORIZED' });
    return { items: handoff.list() };
  });
  return app;
}

import { AgentService } from '../src/ai/agent.service.js';
import { HandoffService } from '../src/handoff/handoff.service.js';
import { MessageDeduplicator, parseMessage } from '../src/whatsapp/webhook.js';
import { createWhatsAppProvider } from '../src/whatsapp/whatsapp.factory.js';
import { MessageSender } from '../src/whatsapp/message-sender.js';

const agent = new AgentService();
const handoff = new HandoffService();
const dedupe = new MessageDeduplicator();
const sender = new MessageSender(createWhatsAppProvider());

function json(data: unknown, status = 200) { return Response.json(data, { status }); }

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname.endsWith('/health')) return json({ ok: true, service: 'خدمة العملاء', runtime: 'vercel' });

    if (url.pathname.endsWith('/webhooks/whatsapp')) {
      if (request.method === 'GET') {
        const token = url.searchParams.get('hub.verify_token');
        if (token !== (process.env.WEBHOOK_VERIFY_TOKEN ?? 'change-me')) return new Response('Forbidden', { status: 403 });
        return new Response(url.searchParams.get('hub.challenge') ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } });
      }
      if (request.method === 'POST') {
        const message = parseMessage(await request.json());
        if (!message?.id || !message.from) return json({ error: 'INVALID_MESSAGE' }, 400);
        if (dedupe.has(message.id)) return json({ ok: true, duplicate: true });
        dedupe.add(message.id);
        const result = agent.reply(message.text?.body ?? '');
        if (result.handoff) handoff.open(message.from, 'طلب غير معروف أو يحتاج موظف');
        try {
          const sent = await sender.send(message.from, result.text);
          return json({ ok: true, reply: result.text, handoff: result.handoff, sent: sent.accepted, providerMessageId: sent.providerMessageId });
        } catch { return json({ ok: false, error: 'WHATSAPP_SEND_FAILED' }, 502); }
      }
    }

    if (request.method === 'GET' && url.pathname.endsWith('/handoffs')) return json({ items: handoff.list() });
    return json({ error: 'NOT_FOUND' }, 404);
  },
};

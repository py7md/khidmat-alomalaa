import { AgentService } from '../src/ai/agent.service.js';
import { HandoffService } from '../src/handoff/handoff.service.js';
import { detectIntent } from '../src/ai/intent-detector.js';
import knowledge from '../src/config/knowledge-base.json' with { type: 'json' };
import { MessageDeduplicator, parseMessage } from '../src/whatsapp/webhook.js';
import { createWhatsAppProvider } from '../src/whatsapp/whatsapp.factory.js';
import { MessageSender } from '../src/whatsapp/message-sender.js';
import { verifyMetaSignature } from '../src/whatsapp/webhook-signature.js';

const agent = new AgentService();
const handoff = new HandoffService();
const dedupe = new MessageDeduplicator();
const sender = new MessageSender(createWhatsAppProvider());
const simulationHits = new Map<string, { count: number; resetAt: number }>();
const MAX_BODY_BYTES = 256 * 1024;
const SIMULATION_LIMIT = 30;

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

function clientKey(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
}

function allowedSimulation(request: Request): boolean {
  const now = Date.now();
  const key = clientKey(request);
  const current = simulationHits.get(key);
  if (!current || current.resetAt <= now) {
    simulationHits.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= SIMULATION_LIMIT) return false;
  current.count += 1;
  return true;
}

async function readJson(request: Request): Promise<{ value?: unknown; error?: Response }> {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) return { error: json({ error: 'PAYLOAD_TOO_LARGE' }, 413) };
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return { error: json({ error: 'PAYLOAD_TOO_LARGE' }, 413) };
  try { return { value: JSON.parse(raw) }; } catch { return { error: json({ error: 'INVALID_JSON' }, 400) }; }
}

function isMetaProvider(): boolean { return process.env.WHATSAPP_PROVIDER === 'meta'; }

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname.endsWith('/health')) {
      return json({ ok: true, service: 'خدمة العملاء', runtime: 'vercel', agent: 'rules+knowledge', provider: process.env.WHATSAPP_PROVIDER ?? 'mock' });
    }

    if (request.method === 'POST' && url.pathname.endsWith('/agent/simulate')) {
      if (!allowedSimulation(request)) return json({ error: 'RATE_LIMITED' }, 429, { 'Retry-After': '60' });
      const parsed = await readJson(request);
      if (parsed.error) return parsed.error;
      const message = (parsed.value as { message?: unknown })?.message;
      if (typeof message !== 'string' || !message.trim() || message.length > 4_000) return json({ error: 'MESSAGE_INVALID' }, 400);
      const result = agent.reply(message.trim());
      const intent = detectIntent(message);
      return json({ intent, reply: result.text, handoff: result.handoff, explanation: result.handoff ? 'لم يجد الوكيل إجابة آمنة أو طلب العميل موظفًا؛ لذلك اختار التحويل البشري.' : 'وجد الوكيل تطابقًا في قاعدة المعرفة وأرسل ردًا مباشرًا دون تحويل.', knowledgeVersion: knowledge.version });
    }

    if (url.pathname.endsWith('/webhooks/whatsapp')) {
      if (request.method === 'GET') {
        const expected = process.env.WEBHOOK_VERIFY_TOKEN;
        if (!expected || expected === 'change-me') return new Response('Webhook is not configured', { status: 503 });
        if (url.searchParams.get('hub.verify_token') !== expected) return new Response('Forbidden', { status: 403 });
        return new Response(url.searchParams.get('hub.challenge') ?? '', { status: 200, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });
      }
      if (request.method === 'POST') {
        const rawBody = await request.text();
        if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return json({ error: 'PAYLOAD_TOO_LARGE' }, 413);
        if (isMetaProvider() && !verifyMetaSignature(rawBody, request.headers.get('x-hub-signature-256'), process.env.META_APP_SECRET)) return json({ error: 'INVALID_WEBHOOK_SIGNATURE' }, 401);
        let payload: unknown;
        try { payload = JSON.parse(rawBody); } catch { return json({ error: 'INVALID_JSON' }, 400); }
        const message = parseMessage(payload);
        if (!message) {
          if ((payload as { object?: unknown })?.object === 'whatsapp_business_account') return json({ ok: true, ignored: true });
          return json({ error: 'INVALID_MESSAGE' }, 400);
        }
        if (!message.text?.body) return json({ ok: true, ignored: true });
        const state = dedupe.begin(message.id);
        if (state !== 'new') return json({ ok: true, duplicate: true, processing: state === 'processing' });
        const result = agent.reply(message.text?.body ?? '');
        if (result.handoff) handoff.open(message.from, 'طلب غير معروف أو يحتاج موظف');
        try {
          const sent = await sender.send(message.from, result.text);
          dedupe.markSent(message.id);
          return json({ ok: true, reply: result.text, handoff: result.handoff, sent: sent.accepted, providerMessageId: sent.providerMessageId });
        } catch { dedupe.release(message.id); return json({ ok: false, error: 'WHATSAPP_SEND_FAILED' }, 502); }
      }
    }

    if (request.method === 'GET' && url.pathname.endsWith('/handoffs')) {
      const expected = process.env.ADMIN_TOKEN;
      if (!expected || expected === 'local-admin') return json({ error: 'ADMIN_NOT_CONFIGURED' }, 503);
      if (request.headers.get('authorization') !== `Bearer ${expected}`) return json({ error: 'UNAUTHORIZED' }, 401);
      return json({ items: handoff.list() });
    }
    return json({ error: 'NOT_FOUND' }, 404);
  },
};

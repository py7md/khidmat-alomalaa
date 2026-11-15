import { describe, expect, it } from 'vitest';
import handler from '../../api/index.js';

describe('Vercel web handler', () => {
  it('serves a real health endpoint', async () => {
    const response = await handler.fetch(new Request('https://example.test/api/health'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, runtime: 'vercel' });
  });

  it('verifies the WhatsApp challenge', async () => {
    process.env.WEBHOOK_VERIFY_TOKEN = 'test-token';
    const response = await handler.fetch(new Request('https://example.test/api/webhooks/whatsapp?hub.verify_token=test-token&hub.challenge=abc'));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('abc');
  });
});

it('simulates the agent without sending a WhatsApp message', async () => {
  const response = await handler.fetch(new Request('https://example.test/api/agent/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'ما هي ساعات العمل؟' }),
  }));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ intent: 'faq', handoff: false, knowledgeVersion: '1.0.0' });
});

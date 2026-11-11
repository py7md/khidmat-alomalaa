import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('WhatsApp webhook', () => {
  it('verifies GET and processes one incoming message only once', async () => {
    const app = await buildApp({ verifyToken: 'test-token' });
    const verify = await app.inject({ method:'GET', url:'/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test-token&hub.challenge=abc' });
    expect(verify.statusCode).toBe(200); expect(verify.body).toBe('abc');
    const payload = { entry:[{ changes:[{ value:{ messages:[{ id:'m1', from:'966700000001', text:{ body:'ما هي ساعات العمل؟' } }] } }] }] };
    const response = await app.inject({ method:'POST', url:'/webhooks/whatsapp', payload });
    expect(response.statusCode).toBe(200); expect(response.json().reply).toContain('09:00');
    const duplicate = await app.inject({ method:'POST', url:'/webhooks/whatsapp', payload });
    expect(duplicate.json().duplicate).toBe(true); await app.close();
  });
});

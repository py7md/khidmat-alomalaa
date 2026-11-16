import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyMetaSignature } from '../../src/whatsapp/webhook-signature.js';

describe('Meta webhook signature verification', () => {
  it('accepts the correct HMAC signature and rejects tampering', () => {
    const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
    const secret = 'meta-app-secret';
    const digest = createHmac('sha256', secret).update(body).digest('hex');
    expect(verifyMetaSignature(body, `sha256=${digest}`, secret)).toBe(true);
    expect(verifyMetaSignature(`${body}x`, `sha256=${digest}`, secret)).toBe(false);
    expect(verifyMetaSignature(body, undefined, secret)).toBe(false);
  });
});

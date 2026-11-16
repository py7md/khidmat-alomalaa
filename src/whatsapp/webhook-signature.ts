import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyMetaSignature(rawBody: string, signature: string | null | undefined, appSecret: string | undefined): boolean {
  if (!signature || !appSecret || !signature.startsWith('sha256=')) return false;
  const received = Buffer.from(signature.slice('sha256='.length), 'hex');
  const expected = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest();
  return received.length === expected.length && timingSafeEqual(received, expected);
}

import { describe, expect, it } from 'vitest';
import { MessageDeduplicator, parseMessage } from '../../src/whatsapp/webhook.js';

describe('WhatsApp webhook parser', () => {
  it('accepts a valid text message and rejects malformed or oversized values', () => {
    expect(parseMessage({ entry: [{ changes: [{ value: { messages: [{ id: 'm1', from: '967700000000', text: { body: 'مرحبا' } }] } }] }] })).toMatchObject({ id: 'm1', from: '967700000000' });
    expect(parseMessage({ entry: [{ changes: [{ value: { messages: [{ id: '', from: '967700000000' }] } }] }] })).toBeUndefined();
    expect(parseMessage({ entry: [{ changes: [{ value: { messages: [{ id: 'm2', from: '967700000000', text: { body: 'x'.repeat(4097) } }] } }] }] })).toBeUndefined();
  });

  it('expires duplicate ids', () => {
    const dedupe = new MessageDeduplicator(1);
    dedupe.add('m1');
    expect(dedupe.has('m1')).toBe(true);
    return new Promise<void>((resolve) => setTimeout(() => { expect(dedupe.has('m1')).toBe(false); resolve(); }, 5));
  });
});

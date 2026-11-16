export type IncomingMessage = { id: string; from: string; text?: { body?: string } };

export function parseMessage(payload: unknown): IncomingMessage | undefined {
  const message = (payload as { entry?: Array<{ changes?: Array<{ value?: { messages?: unknown[] } }> }> })?.entry?.[0]?.changes?.[0]?.value?.messages?.[0] as { id?: unknown; from?: unknown; text?: { body?: unknown } } | undefined;
  if (typeof message?.id !== 'string' || message.id.length < 1 || message.id.length > 256) return undefined;
  if (typeof message.from !== 'string' || message.from.length < 3 || message.from.length > 128) return undefined;
  if (message.text?.body !== undefined && (typeof message.text.body !== 'string' || message.text.body.length > 4096)) return undefined;
  return { id: message.id, from: message.from, text: typeof message.text?.body === 'string' ? { body: message.text.body } : undefined };
}

export type MessageState = 'new' | 'processing' | 'sent';

export class MessageDeduplicator {
  private readonly ids = new Map<string, { state: Exclude<MessageState, 'new'>; expiresAt: number }>();
  constructor(private readonly ttlMs = 24 * 60 * 60 * 1000, private readonly maxEntries = 10_000) {}
  begin(id: string): MessageState {
    this.cleanup();
    const existing = this.ids.get(id);
    if (existing && existing.expiresAt > Date.now()) return existing.state;
    if (this.ids.size >= this.maxEntries) this.ids.delete(this.ids.keys().next().value as string);
    this.ids.set(id, { state: 'processing', expiresAt: Date.now() + this.ttlMs });
    return 'new';
  }
  markSent(id: string): void { const item = this.ids.get(id); if (item) item.state = 'sent'; }
  release(id: string): void { const item = this.ids.get(id); if (item?.state === 'processing') this.ids.delete(id); }
  has(id: string): boolean { return this.begin(id) !== 'new'; }
  add(id: string): void { if (this.begin(id) === 'new') this.markSent(id); }
  private cleanup(): void { const now = Date.now(); for (const [id, item] of this.ids) if (item.expiresAt <= now) this.ids.delete(id); }
}

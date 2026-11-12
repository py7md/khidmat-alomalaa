import type { WhatsAppProvider } from './whatsapp-provider.interface.js';
import type { WhatsAppSendResult } from '../types/whatsapp.types.js';

type MetaSendResponse = { messages?: Array<{ id?: string }> };
type MetaErrorResponse = { error?: { message?: string; code?: number; error_subcode?: number } };

export class MetaWhatsAppProvider implements WhatsAppProvider {
  private readonly graphBaseUrl = 'https://graph.facebook.com';

  constructor(
    private readonly token = process.env.WHATSAPP_ACCESS_TOKEN,
    private readonly phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID,
    private readonly graphApiVersion = process.env.META_GRAPH_API_VERSION ?? 'v23.0',
    private readonly timeoutMs = 10_000,
  ) {}

  async sendText(to: string, text: string): Promise<WhatsAppSendResult> {
    const token = this.token;
    const phoneId = this.phoneId;
    if (!token || !phoneId) throw new Error('META_CREDENTIALS_MISSING');
    if (!/^v\d+\.\d+$/.test(this.graphApiVersion)) throw new Error('META_GRAPH_API_VERSION_INVALID');

    const recipient = this.normalizeRecipient(to);
    if (!recipient) throw new Error('META_RECIPIENT_INVALID');
    if (!text.trim()) throw new Error('META_MESSAGE_EMPTY');
    if (text.length > 4096) throw new Error('META_MESSAGE_TOO_LONG');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.graphBaseUrl}/${this.graphApiVersion}/${phoneId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'text',
          text: { body: text },
        }),
        signal: controller.signal,
      });

      const body = await this.readJson<MetaSendResponse & MetaErrorResponse>(response);
      if (!response.ok) {
        const message = body.error?.message ?? 'Unknown Meta Graph API error';
        throw new Error(`META_API_ERROR:${response.status}:${message}`);
      }

      const providerMessageId = body.messages?.[0]?.id;
      if (!providerMessageId) throw new Error('META_API_RESPONSE_INVALID');
      return { providerMessageId, accepted: true };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw new Error('META_API_TIMEOUT');
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private normalizeRecipient(value: string): string {
    const trimmed = value.trim();
    if (/^\+?[0-9][0-9\s().-]{5,24}$/.test(trimmed)) return trimmed.replace(/\D/g, '');
    return trimmed;
  }

  private async readJson<T>(response: Response): Promise<T> {
    const raw = await response.text();
    if (!raw) return {} as T;
    try { return JSON.parse(raw) as T; } catch { throw new Error(`META_API_RESPONSE_INVALID:${response.status}`); }
  }
}

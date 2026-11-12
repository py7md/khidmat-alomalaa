import { afterEach, describe, expect, it, vi } from 'vitest';
import { MetaWhatsAppProvider } from '../../src/whatsapp/meta-whatsapp.provider.js';

describe('MetaWhatsAppProvider', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends a text message to Graph API and returns the WhatsApp message id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ messages: [{ id: 'wamid.TEST-1' }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = new MetaWhatsAppProvider('secret-token', '123456789', 'v23.0', 5000);

    const result = await provider.sendText('+967 773 086 403', 'مرحبًا');

    expect(result).toEqual({ providerMessageId: 'wamid.TEST-1', accepted: true });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://graph.facebook.com/v23.0/123456789/messages',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer secret-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: '967773086403', type: 'text', text: { body: 'مرحبًا' } }),
      }),
    );
  });

  it('does not expose the access token when Graph API rejects the request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'Invalid OAuth access token' } }), { status: 401 })));
    const provider = new MetaWhatsAppProvider('super-secret-token', '123456789');

    await expect(provider.sendText('967773086403', 'اختبار')).rejects.toThrow('META_API_ERROR:401:Invalid OAuth access token');
    await expect(provider.sendText('967773086403', 'اختبار')).rejects.not.toThrow('super-secret-token');
  });

  it('fails before making a request when credentials or message data are invalid', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(new MetaWhatsAppProvider('', '123').sendText('967773086403', 'اختبار')).rejects.toThrow('META_CREDENTIALS_MISSING');
    await expect(new MetaWhatsAppProvider('token', '123').sendText('', 'اختبار')).rejects.toThrow('META_RECIPIENT_INVALID');
    await expect(new MetaWhatsAppProvider('token', '123').sendText('967773086403', '')).rejects.toThrow('META_MESSAGE_EMPTY');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

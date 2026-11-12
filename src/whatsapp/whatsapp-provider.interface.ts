import type { WhatsAppSendResult } from '../types/whatsapp.types.js'; export interface WhatsAppProvider { sendText(to:string,text:string):Promise<WhatsAppSendResult>; }

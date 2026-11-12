import {verifySignature} from '../../whatsapp/webhook-verifier.js'; export function verifyMeta(raw:string,signature:string,secret:string){return verifySignature(raw,signature,secret);}

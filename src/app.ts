import Fastify from 'fastify';
import { z } from 'zod';
import { AgentService } from './ai/agent.service.js';
import { HandoffService } from './handoff/handoff.service.js';
import { safeLog } from './security/pii-redactor.js';
import { MessageDeduplicator, parseMessage } from './whatsapp/webhook.js';

const configSchema=z.object({verifyToken:z.string().min(1)});
export async function buildApp(input:{verifyToken?:string}={}){
  const config=configSchema.parse({verifyToken:input.verifyToken??process.env.WEBHOOK_VERIFY_TOKEN??'change-me'});
  const app=Fastify({logger:false}); const agent=new AgentService(); const handoff=new HandoffService(); const dedupe=new MessageDeduplicator();
  app.get('/health',async()=>({ok:true,service:'خدمة العملاء'}));
  app.get('/webhooks/whatsapp',async(request,reply)=>{const q=request.query as Record<string,string>; if(q['hub.verify_token']!==config.verifyToken) return reply.code(403).send('Forbidden'); return reply.type('text/plain').send(q['hub.challenge']??'');});
  app.post('/webhooks/whatsapp',async(request,reply)=>{const message=parseMessage(request.body); if(!message?.id||!message.from) return reply.code(400).send({error:'INVALID_MESSAGE'}); if(dedupe.has(message.id)) return {ok:true,duplicate:true}; dedupe.add(message.id); const result=agent.reply(message.text?.body??''); if(result.handoff) handoff.open(message.from,'طلب غير معروف أو يحتاج موظف'); safeLog('incoming_message',message.from); return {ok:true,reply:result.text,handoff:result.handoff};});
  app.get('/admin/handoffs',async()=>({items:handoff.list()}));
  return app;
}

import knowledge from '../config/knowledge-base.json' with { type:'json' };
export type AgentResult={text:string; handoff:boolean};
export class AgentService {
  reply(input:string):AgentResult {
    const text=input.trim().toLowerCase();
    if(text.includes('موظف')||text.includes('بشر')) return {text:'سأحوّل محادثتك إلى موظف لمساعدتك.',handoff:true};
    if(text.includes('غير موجود')||text.includes('لا تقدم')) return {text:'لا أملك معلومة موثوقة عن هذا الطلب. سأحوّل المحادثة إلى موظف.',handoff:true};
    if(text.includes('ساعات')||text.includes('دوام')||text.includes('مفتوح')) return {text:`ساعات العمل: ${knowledge.hours}.`,handoff:false};
    if(text.includes('خدم')||text.includes('استشار')) return {text:'الخدمة المتاحة حاليًا: استشارة (30 دقيقة). اكتب «حجز» للبدء.',handoff:false};
    if(text.includes('سعر')||text.includes('تكلف')) return {text:`السعر: ${knowledge.services[0].price}.`,handoff:false};
    if(text.includes('تواصل')||text.includes('رقم')) return {text:`للتواصل عبر واتساب أو اتصال: ${knowledge.contact}.`,handoff:false};
    if(text.includes('حجز')) return {text:'لإتمام الحجز أرسل الخدمة والتاريخ والوقت والاسم.',handoff:false};
    return {text:'لا أملك معلومة موثوقة عن هذا الطلب. سأحوّل المحادثة إلى موظف.',handoff:true};
  }
}

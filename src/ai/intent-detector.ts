import type { Intent } from '../types/ai.types.js';

export function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (t.includes('موظف') || t.includes('بشر')) return 'human_handoff';
  if (t.includes('حجز') || t.includes('احجز')) return 'booking';
  if (t.includes('إلغاء') || t.includes('الغاء')) return 'cancellation';
  if (t.includes('ساعة') || t.includes('ساعات') || t.includes('دوام') || t.includes('سعر') || t.includes('تكلف') || t.includes('خدمة') || t.includes('استشار')) return 'faq';
  return 'unknown';
}

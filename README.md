# خدمة العملاء

نظام شامل خاص لوكيل خدمة العملاء عبر WhatsApp، باللغة العربية، باسم المشروع **خدمة العملاء**. المبرمج: **أحمد المصنتر**، التواصل: **773086403 — واتساب واتصال**.

## مكونات النظام

يضم النظام طبقات مستقلة لـ API وWhatsApp وAI وقاعدة المعرفة والمحادثات والحجوزات والتحويل البشري وقاعدة البيانات والمهام والأمان والمراقبة. يوجد مزود Mock افتراضي للاختبار، وموفرا Meta وKapso خلف interface قابل للتبديل.

## التشغيل المحلي

```bash
npm install
cp .env.example .env
npm run check
npm run dev
```

للتشغيل بالحاويات: `docker compose -f deployment/docker-compose.yml up --build`.

## التحقق

`npm run check` يبني TypeScript ويشغل الاختبارات. كما توجد اختبارات منفصلة عبر `npm run test:unit` و`npm run test:integration`.

## ربط الإنتاج

لا يتم تفعيل رقم WhatsApp الحقيقي تلقائيًا. قبل الإنتاج، أضف أسرار Meta أو Kapso، رابط HTTPS للـ Webhook، PostgreSQL وRedis، مصادقة الإدارة، النسخ الاحتياطي، وسياسات الاحتفاظ. راجع مجلد `docs`.

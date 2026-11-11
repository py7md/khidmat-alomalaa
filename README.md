# خدمة العملاء

وكيل خدمة عملاء عربي خاص عبر WhatsApp، مبني بـ Node.js وTypeScript وFastify. النسخة الحالية MVP محلي آمن للتجربة، وتستخدم طبقة Mock بدل الاتصال الحقيقي بـ Meta حتى يتم إدخال الأسرار الخاصة.

## التشغيل

```bash
npm install
cp .env.example .env
npm run check
npm run dev
```

يفتح الخادم على `http://localhost:3000`. فحص الجاهزية: `GET /health`.

## Webhook

- `GET /webhooks/whatsapp` للتحقق من `hub.verify_token` وإرجاع `hub.challenge`.
- `POST /webhooks/whatsapp` لاستقبال رسالة WhatsApp نصية بصيغة Meta الأساسية.
- `GET /admin/handoffs` لعرض التحويلات المفتوحة في النسخة المحلية.

## البيانات

اسم المشروع: **خدمة العملاء**. المبرمج: **أحمد المصنتر**. التواصل: **773086403 — واتساب واتصال**. عدّل قاعدة المعرفة من `src/config/knowledge-base.json` وتعليمات الوكيل من `src/config/agent-prompt.md`.

## الإنتاج

قبل ربط رقم حقيقي، يجب إضافة Meta Cloud API والتحقق من توقيع Meta، ثم تخزين PostgreSQL وRedis، وتفعيل مصادقة لوحة الإدارة، وتحديد سياسات الاحتفاظ بالبيانات. لا تضع أي Access Token داخل Git.

# نشر المشروع على Vercel

هذا المشروع ليس Backend فقط؛ يحتوي على صفحة ويب في `public/index.html` وVercel Function في `api/index.ts`. ملف `vercel.json` يوجه كل `/api/*` إلى Function واحدة.

في Vercel اختر المستودع `py7md/khidmat-alomalaa`، استخدم Framework Preset: Other، واترك Build Command كما هو في `vercel.json`. أضف `WEBHOOK_VERIFY_TOKEN` و`WHATSAPP_PROVIDER` وبقية متغيرات Meta من `.env.example`. لا ترفع ملف `.env` إلى GitHub.

بعد النشر، اختبر:

```bash
curl https://YOUR_DOMAIN.vercel.app/
curl https://YOUR_DOMAIN.vercel.app/api/health
curl "https://YOUR_DOMAIN.vercel.app/api/webhooks/whatsapp?hub.verify_token=VALUE&hub.challenge=123"
```

في Meta استخدم:

```text
https://YOUR_DOMAIN.vercel.app/api/webhooks/whatsapp
```

ملاحظة: الذاكرة داخل Vercel Function مؤقتة؛ يجب استخدام قاعدة بيانات وRedis خارجيين لمنع التكرار وحفظ الجلسات في الإنتاج.

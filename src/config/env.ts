import { z } from 'zod';
export const envSchema=z.object({PORT:z.coerce.number().default(3000),WEBHOOK_VERIFY_TOKEN:z.string().default('change-me'),WHATSAPP_PROVIDER:z.enum(['mock','meta','kapso']).default('mock'),META_APP_SECRET:z.string().optional(),WHATSAPP_PHONE_NUMBER_ID:z.string().optional(),WHATSAPP_ACCESS_TOKEN:z.string().optional(),DATABASE_URL:z.string().optional(),REDIS_URL:z.string().optional(),ADMIN_TOKEN:z.string().default('local-admin')});
export const env=envSchema.parse(process.env);

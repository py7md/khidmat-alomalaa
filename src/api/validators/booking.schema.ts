import {z} from 'zod'; export const bookingSchema=z.object({service:z.string().optional(),date:z.string().optional(),time:z.string().optional(),name:z.string().optional()});

import {z} from 'zod'; export const webhookSchema=z.object({entry:z.array(z.unknown())});

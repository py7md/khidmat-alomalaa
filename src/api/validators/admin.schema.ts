import {z} from 'zod'; export const adminSchema=z.object({token:z.string().min(1)});

import {isAdmin} from '../../security/access-control.js'; export function requireAdmin(token?:string){if(!isAdmin(token))throw new Error('ADMIN_UNAUTHORIZED');}

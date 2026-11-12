export function isAdmin(token:string|undefined){return Boolean(token&&token===process.env.ADMIN_TOKEN); }

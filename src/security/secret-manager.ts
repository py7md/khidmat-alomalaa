export function requireSecret(name:string){const value=process.env[name];if(!value)throw new Error(`SECRET_MISSING:${name}`);return value;}

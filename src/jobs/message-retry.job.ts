export function retryMessage(id:string){return {id,attemptedAt:new Date().toISOString()};}

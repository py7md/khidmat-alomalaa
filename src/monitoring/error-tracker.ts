export function trackError(error:unknown){return {message:error instanceof Error?error.message:String(error),at:new Date().toISOString()};}

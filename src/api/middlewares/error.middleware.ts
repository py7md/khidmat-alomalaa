export function errorPayload(error:unknown){return {error:error instanceof Error?error.message:'INTERNAL_ERROR'};}

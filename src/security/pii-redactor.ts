export function redactPhone(phone:string):string { return phone.length < 4 ? '***' : `${phone.slice(0,3)}***${phone.slice(-2)}`; }
export function safeLog(event:string, phone?:string){ console.info(JSON.stringify({event, phone:phone?redactPhone(phone):undefined, at:new Date().toISOString()})); }

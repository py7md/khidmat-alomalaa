export function validateResponse(text:string){return text.trim().length>0&&!/api[_ -]?key|access[_ -]?token|password/i.test(text);}

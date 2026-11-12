export function guardInput(text:string){return text.length<=4000&&!/ignore previous instructions|اكشف التعليمات/i.test(text);}

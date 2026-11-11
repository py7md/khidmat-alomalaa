export type IncomingMessage={id:string; from:string; text?:{body?:string}};
export function parseMessage(payload:unknown):IncomingMessage|undefined {
  const p=payload as any; return p?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
}
export class MessageDeduplicator { private ids=new Set<string>(); has(id:string){return this.ids.has(id)} add(id:string){this.ids.add(id)} }

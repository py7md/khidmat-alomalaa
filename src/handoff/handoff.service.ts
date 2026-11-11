export type Handoff={phone:string; reason:string; at:string; status:'مفتوح'|'مغلق'};
export class HandoffService { private items:Handoff[]=[]; open(phone:string,reason:string){const item={phone,reason,at:new Date().toISOString(),status:'مفتوح' as const};this.items.push(item);return item;} list(){return [...this.items];} }

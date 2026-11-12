export type Intent='faq'|'booking'|'cancellation'|'human_handoff'|'unknown'; export type AIReply={text:string;intent:Intent;confidence:number;handoff:boolean};

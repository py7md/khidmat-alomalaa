export type ConversationMessage={role:'user'|'assistant'|'system';text:string;at:string}; export type Conversation={phone:string;messages:ConversationMessage[];humanMode:boolean};

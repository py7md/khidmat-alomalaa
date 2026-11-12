import type {ConversationMessage} from './conversation.types.js'; export function recentContext(messages:ConversationMessage[],limit=10){return messages.slice(-limit);}

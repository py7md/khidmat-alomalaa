import type { AIProvider } from './ai-provider.interface.js'; export class OpenAIProvider implements AIProvider { async complete(_system:string,user:string){return `وضع Mock: ${user}`;} }

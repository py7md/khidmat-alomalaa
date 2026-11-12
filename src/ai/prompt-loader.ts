import { readFileSync } from 'node:fs'; export function loadPrompt(path='src/config/agent-prompt.md'){return readFileSync(path,'utf8');}

import { readFileSync } from 'node:fs'; console.log('Knowledge seed ready:', readFileSync('src/config/knowledge-base.json','utf8').length>0);

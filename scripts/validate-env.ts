import {env} from '../src/config/env.js'; console.log(JSON.stringify({port:env.PORT,provider:env.WHATSAPP_PROVIDER,hasToken:Boolean(env.WHATSAPP_ACCESS_TOKEN)}));

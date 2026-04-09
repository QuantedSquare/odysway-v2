import { aB as executeAsync } from '../nitro/nitro.mjs';
import { createClient } from '@sanity/client';
import { bM as qp, g as Ue, X as sa } from './server.mjs';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'algoliasearch';
import 'axios';
import 'jsonwebtoken';
import 'dayjs';
import '@supabase/supabase-js';
import 'stripe';
import 'crypto';
import 'zod';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'fast-xml-parser';
import 'node:url';
import 'ipx';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'vue-dompurify-html';
import '@date-io/dayjs';
import '@mdi/js';
import 'lodash';
import 'search-insights';
import '@vueuse/core';
import 'groq';
import 'perfect-debounce';

const J=qp(async r=>{let t,o;try{const e=Ue(),a=createClient({projectId:e.public.sanity.projectId,dataset:e.public.sanity.dataset,apiVersion:e.public.sanity.apiVersion,useCdn:!0}),i=decodeURIComponent(r.path).split("/"),m=i[i.length-1],s=f(m),c=`*[_type == "voyage" && slug.current == $slug][0]{
      "slug": slug.current
    }`,p=([t,o]=executeAsync(()=>a.fetch(c,{slug:s})),t=await t,o(),t);if(p){const n=`/voyages/${p.slug}`;if(r.path!==n)return sa(n)}}catch(e){console.error(e);}});function f(r){const t={à:"a",â:"a",ä:"a",ç:"c",é:"e",è:"e",ê:"e",ë:"e",î:"i",ï:"i",ô:"o",ö:"o",ù:"u",û:"u",ü:"u",ÿ:"y",À:"A",Â:"A",Ä:"A",Ç:"C",É:"E",È:"E",Ê:"E",Ë:"E",Î:"I",Ï:"I",Ô:"O",Ö:"O",Ù:"U",Û:"U",Ü:"U",Ÿ:"Y"};return r.replace(/[àâäçéèêëîïôöùûüÿÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]/g,o=>t[o]||o)}

export { J as default };
//# sourceMappingURL=oldVoyagesLinkRedirection-DsLAgUAS.mjs.map

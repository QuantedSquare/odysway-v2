import { z } from './SectionContainer-CuQ9WYu3.mjs';
import { B } from './EnrichedText-DuMnQ6-0.mjs';
import { withAsyncContext, unref, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as lp, a as Jc } from './server.mjs';
import O from 'groq';
import { K } from './useSeo-CsS5EJ8u.mjs';
import './composables-NwuVgpqi.mjs';
import '../nitro/nitro.mjs';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'algoliasearch';
import '@sanity/client';
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
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'fast-xml-parser';
import 'node:url';
import 'ipx';
import '@portabletext/vue';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'vue-dompurify-html';
import '@date-io/dayjs';
import '@mdi/js';
import 'lodash';
import 'search-insights';
import '@vueuse/core';
import 'perfect-debounce';
import './getImageUrl-B94zyPkX.mjs';
import '@sanity/image-url';

const u={__name:"politique-de-confidentialite",__ssrInlineRender:true,async setup(p){let e,o;const d=lp(),_=O`*[_type == "privacyPolicy" && slug.current == "politique-de-confidentialite"][0]{
  title,
  body,
  seo
}`,{data:t}=([e,o]=withAsyncContext(()=>Jc("politique-de-confidentialite",()=>d.fetch(_))),e=await e,o(),e);return t.value&&K({seoData:t.value?.seo,content:t.value,pageType:"website",slug:"politique-de-confidentialite",baseUrl:"/politique-de-confidentialite"}),(T,r,f,y)=>{const v=z,m=B;unref(t)?(r(`<div${ssrRenderAttrs(y)}>`),r(ssrRenderComponent(v,null,{content:withCtx((E,n,x,s)=>{if(n)n(`<h1 class="text-center font-weight-bold"${s}>${ssrInterpolate(unref(t).title)}</h1>`),n(ssrRenderComponent(m,{value:unref(t).body},null,x,s));else return [createVNode("h1",{class:"text-center font-weight-bold"},toDisplayString(unref(t).title),1),createVNode(m,{value:unref(t).body},null,8,["value"])]}),_:1},f)),r("</div>")):r("<!---->");}}},c=u.setup;u.setup=(p,e)=>{const o=useSSRContext();return (o.modules||(o.modules=new Set)).add("pages/politique-de-confidentialite.vue"),c?c(p,e):void 0};

export { u as default };
//# sourceMappingURL=politique-de-confidentialite-DyglU30D.mjs.map

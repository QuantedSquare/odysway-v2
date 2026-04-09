import { z } from './SectionContainer-DKfgvH0W.mjs';
import { B } from './EnrichedText-COchyxWO.mjs';
import { withAsyncContext, withCtx, unref, openBlock, createBlock, toDisplayString, createCommentVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as up, a as Qc } from './server.mjs';
import O from 'groq';
import { K } from './useSeo-CsS5EJ8u.mjs';
import './composables-Dcwg06ZS.mjs';
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

const u={__name:"mentions-legales",__ssrInlineRender:true,async setup(m){let e,r;const c=up(),_=O`*[_type == "legalMentions" && slug.current == "mentions-legales"][0]{
  title,
  body,
  seo
}`,{data:t}=([e,r]=withAsyncContext(()=>Qc("mentions-legales",()=>c.fetch(_))),e=await e,r(),e);return t.value&&K({seoData:t.value?.seo,content:t.value,pageType:"website",slug:"mentions-legales",baseUrl:"/mentions-legales"}),(V,i,d,f)=>{const g=z,s=B;i(`<div${ssrRenderAttrs(f)}>`),i(ssrRenderComponent(g,null,{content:withCtx((E,n,y,p)=>{if(n)unref(t)?n(`<h1${p}>${ssrInterpolate(unref(t).title)}</h1>`):n("<!---->"),n(ssrRenderComponent(s,{value:unref(t).body},null,y,p));else return [unref(t)?(openBlock(),createBlock("h1",{key:0},toDisplayString(unref(t).title),1)):createCommentVNode("",true),createVNode(s,{value:unref(t).body},null,8,["value"])]}),_:1},d)),i("</div>");}}},l=u.setup;u.setup=(m,e)=>{const r=useSSRContext();return (r.modules||(r.modules=new Set)).add("pages/mentions-legales.vue"),l?l(m,e):void 0};

export { u as default };
//# sourceMappingURL=mentions-legales-Dz0rPPEj.mjs.map

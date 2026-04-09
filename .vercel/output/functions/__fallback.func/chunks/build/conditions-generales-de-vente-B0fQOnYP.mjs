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

const c={__name:"conditions-generales-de-vente",__ssrInlineRender:true,async setup(s){let t,r;const d=up(),u=O`*[_type == "conditionsGeneralesVente" && slug.current == "conditions-generales-de-vente"][0]{
  title,
  body,
  seo
}`,{data:e}=([t,r]=withAsyncContext(()=>Qc("conditions-generales-de-vente",()=>d.fetch(u))),t=await t,r(),t);return e.value&&K({seoData:e.value?.seo,content:e.value,pageType:"website",slug:"conditions-generales-de-vente",baseUrl:"/conditions-generales-de-vente"}),(T,i,_,f)=>{const v=z,m=B;i(`<div${ssrRenderAttrs(f)}>`),i(ssrRenderComponent(v,null,{content:withCtx((E,n,g,p)=>{if(n)unref(e)?n(`<h1${p}>${ssrInterpolate(unref(e).title)}</h1>`):n("<!---->"),n(ssrRenderComponent(m,{value:unref(e).body},null,g,p));else return [unref(e)?(openBlock(),createBlock("h1",{key:0},toDisplayString(unref(e).title),1)):createCommentVNode("",true),createVNode(m,{value:unref(e).body},null,8,["value"])]}),_:1},_)),i("</div>");}}},l=c.setup;c.setup=(s,t)=>{const r=useSSRContext();return (r.modules||(r.modules=new Set)).add("pages/conditions-generales-de-vente.vue"),l?l(s,t):void 0};

export { c as default };
//# sourceMappingURL=conditions-generales-de-vente-B0fQOnYP.mjs.map

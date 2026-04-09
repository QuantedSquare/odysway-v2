import { J } from './HeroSection-Ksavt6Vs.mjs';
import { z } from './SectionContainer-DKfgvH0W.mjs';
import { B } from './EnrichedText-COchyxWO.mjs';
import { k as k$1 } from './ctaButton-CoL2yy46.mjs';
import { withAsyncContext, unref, withCtx, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as up, a as Qc, b6 as un } from './server.mjs';
import O from 'groq';
import { K } from './useSeo-CsS5EJ8u.mjs';
import { u, y } from './structuredData-D7RlK3gb.mjs';
import './getImageUrl-B94zyPkX.mjs';
import '@sanity/image-url';
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
import './ssrSlot-D7De7VY4.mjs';
import './slot-Dpt2kD0O.mjs';
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
import '@sanity/client/stega';

const k={__name:"sur-mesure",__ssrInlineRender:true,async setup(d){let i,s;const w=up(),I=O`*[_type == "surMesure" && slug.current == "sur-mesure"][0]{
  title,
  heroImage,
  content,
  ctaButton
}`,{data:t,status:D}=([i,s]=withAsyncContext(()=>Qc("sur-mesure",()=>w.fetch(I))),i=await i,s(),i);if(t.value){const o={title:"Un voyage sur mesure, au rythme de vos envies",description:"Un voyage sur mesure, au rythme de vos envies",image:t.value.heroImage};K({seoData:t.value?.seo,content:o,pageType:"website",slug:"sur-mesure",baseUrl:"/sur-mesure",structuredData:[u({description:t.value?.seo?.metaDescription||o.description}),y()]});}function f(o){return o?o.startsWith("https://odysway.com")?o.replace("https://odysway.com",""):o:"/"}return (o,r,c,$)=>{const R=J,A=z,g=B,x=k$1;r(`<div${ssrRenderAttrs($)}>`),unref(t)?.heroImage?r(ssrRenderComponent(R,{"image-src":unref(t).heroImage},{title:withCtx((T,n,u,p)=>{if(n)n(`${ssrInterpolate(unref(t).title)}`);else return [createTextVNode(toDisplayString(unref(t).title),1)]}),_:1},c)):r("<!---->"),unref(t)?r(ssrRenderComponent(A,null,{content:withCtx((T,n,u,p)=>{if(n)unref(t).content?n(ssrRenderComponent(g,{value:unref(t).content},null,u,p)):n("<!---->"),unref(t).ctaButton?n(ssrRenderComponent(x,{link:f(unref(t).ctaButton.link),external:unref(t).ctaButton.external,class:"mt-8","cta-id":"cta-btn-page-sur-mesure"},{text:withCtx((Q,y,F,G)=>{if(y)y(`${ssrInterpolate(unref(t).ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]}),_:1},u,p)):n("<!---->");else return [unref(t).content?(openBlock(),createBlock(g,{key:0,value:unref(t).content},null,8,["value"])):createCommentVNode("",true),unref(t).ctaButton?(openBlock(),createBlock(x,{key:1,link:f(unref(t).ctaButton.link),external:unref(t).ctaButton.external,class:"mt-8","cta-id":"cta-btn-page-sur-mesure"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]),_:1},8,["link","external"])):createCommentVNode("",true)]}),_:1},c)):unref(D)==="pending"?(r('<div class="d-flex justify-center align-center">'),r(ssrRenderComponent(un,{indeterminate:""},null,c)),r("</div>")):r("<!---->"),r("</div>");}}},b=k.setup;k.setup=(d,i)=>{const s=useSSRContext();return (s.modules||(s.modules=new Set)).add("pages/sur-mesure.vue"),b?b(d,i):void 0};

export { k as default };
//# sourceMappingURL=sur-mesure-DBnm9loM.mjs.map

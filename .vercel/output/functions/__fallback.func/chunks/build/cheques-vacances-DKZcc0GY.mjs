import { J } from './HeroSection-Ksavt6Vs.mjs';
import { z } from './SectionContainer-DKfgvH0W.mjs';
import { B } from './EnrichedText-COchyxWO.mjs';
import { k as k$1 } from './ctaButton-CoL2yy46.mjs';
import { withAsyncContext, unref, withCtx, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as up, a as Qc, b6 as un } from './server.mjs';
import O from 'groq';
import { K } from './useSeo-CsS5EJ8u.mjs';
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

const k={__name:"cheques-vacances",__ssrInlineRender:true,async setup(f){let r,i;const w=up(),I=O`*[_type == "chequesVacances" && slug.current == "cheques-vacances"][0]{
  title,
  heroImage,
  content,
  ctaButton,
  seo
}`,{data:t,status:h}=([r,i]=withAsyncContext(()=>Qc("cheques-vacances",()=>w.fetch(I))),r=await r,i(),r);function d(c){return c?c.startsWith("https://odysway.com")?c.replace("https://odysway.com",""):c:"/"}return t.value&&K({seoData:t.value?.seo,content:t.value,pageType:"website",slug:"cheques-vacances",baseUrl:"/cheques-vacances"}),(c,o,m,$)=>{const R=J,V=z,v=B,x=k$1;o(`<div${ssrRenderAttrs($)}>`),unref(t)?.heroImage?o(ssrRenderComponent(R,{"image-src":unref(t).heroImage},{title:withCtx((b,n,p,u)=>{if(n)n(`${ssrInterpolate(unref(t).title)}`);else return [createTextVNode(toDisplayString(unref(t).title),1)]}),_:1},m)):o("<!---->"),unref(t)?o(ssrRenderComponent(V,null,{content:withCtx((b,n,p,u)=>{if(n)unref(t).content?n(ssrRenderComponent(v,{value:unref(t).content},null,p,u)):n("<!---->"),unref(t).ctaButton?n(ssrRenderComponent(x,{link:d(unref(t).ctaButton.link),class:"mt-8","cta-id":"cheques-vacances"},{text:withCtx((F,y,G,J)=>{if(y)y(`${ssrInterpolate(unref(t).ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]}),_:1},p,u)):n("<!---->");else return [unref(t).content?(openBlock(),createBlock(v,{key:0,value:unref(t).content},null,8,["value"])):createCommentVNode("",true),unref(t).ctaButton?(openBlock(),createBlock(x,{key:1,link:d(unref(t).ctaButton.link),class:"mt-8","cta-id":"cheques-vacances"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]),_:1},8,["link"])):createCommentVNode("",true)]}),_:1},m)):unref(h)==="pending"?(o('<div class="d-flex justify-center align-center">'),o(ssrRenderComponent(un,{indeterminate:""},null,m)),o("</div>")):o("<!---->"),o("</div>");}}},S=k.setup;k.setup=(f,r)=>{const i=useSSRContext();return (i.modules||(i.modules=new Set)).add("pages/cheques-vacances.vue"),S?S(f,r):void 0};

export { k as default };
//# sourceMappingURL=cheques-vacances-DKZcc0GY.mjs.map

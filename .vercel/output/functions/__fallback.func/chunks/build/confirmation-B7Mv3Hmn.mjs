import { x } from './sanity-image-nuxt-BjxFsp-6.mjs';
import { withAsyncContext, unref, withCtx, createVNode, toDisplayString, ref, resolveComponent, openBlock, createBlock, createCommentVNode, renderSlot, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { u as lp, a as Jc, b6 as un, _ as Lu, d as pt, b as gl, V as fi, e as Zn, f as lt, C as fu } from './server.mjs';
import O from 'groq';
import { q } from './VSkeletonLoader-D4yqdZak.mjs';
import { K } from './useSeo-CsS5EJ8u.mjs';
import './NuxtImg-BG7lA2AK.mjs';
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

const X={__name:"ConfirmationContainer",__ssrInlineRender:true,async setup(M){let x$1,h;const T=pt(),J=lp(),i=ref(T.query.isoption==="true"),R=ref(T.query.devis==="true"),Y=O`*[_type == "voyage" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  image,
  "destinations": destinations[]-> {
    _id,
    title
  },
  "experienceType": experienceType-> {
    _id,
    title
  },
  "categories": categories[]-> {
    _id,
    title
  },
  monthlyAvailability,
  availabilityTypes,
  pricing {
    startingPrice,
    pricePerPerson
  },
  startingPrice,
  promoChildren,
  indivRoomPrice
}`,{data:a,status:C}=([x$1,h]=withAsyncContext(()=>Jc(`voyage-${T.query.voyage}`,()=>J.fetch(Y,{slug:T.query.voyage}))),x$1=await x$1,h(),x$1),{mdAndUp:D}=gl();return (s,z,d,b)=>{const c=x,k=resolveComponent("v-btn-secondary");z(ssrRenderComponent(fi,b,{default:withCtx((je,Z,fe,me)=>{if(Z)Z(ssrRenderComponent(Zn,{justify:"center",class:"text-center"},{default:withCtx((I,U,K,W)=>{if(U)unref(C)==="success"&&unref(a)?U(ssrRenderComponent(lt,{cols:"12",xl:"10"},{default:withCtx((G,p,V,q)=>{if(p)p(ssrRenderComponent(Zn,{justify:"center",align:"center"},{default:withCtx((N,v,O,P)=>{if(v)unref(a)?v(ssrRenderComponent(lt,{cols:"12"},{default:withCtx((B,y,w,$)=>{if(y)unref(a).image?.asset?y(ssrRenderComponent(c,{"asset-id":unref(a).image.asset._ref,auto:"format"},{default:withCtx(({src:Q},F,ee,te)=>{if(F)F(ssrRenderComponent(fu,{rounded:"xl",class:"d-flex align-end",src:Q,alt:unref(a).image.alt||unref(a).title,height:unref(D)?"348px":"250px",cover:""},{default:withCtx((Re,L,Ce,ae)=>{if(L)L(`<div class="d-flex align-center justify-center" data-v-ad48d4e4${ae}>`),unref(a)?L(`<h3 class="text-white text-h3 pa-10 text-shadow" data-v-ad48d4e4${ae}>${ssrInterpolate(unref(a).title)}</h3>`):L("<!---->"),L("</div>");else return [createVNode("div",{class:"d-flex align-center justify-center"},[unref(a)?(openBlock(),createBlock("h3",{key:0,class:"text-white text-h3 pa-10 text-shadow"},toDisplayString(unref(a).title),1)):createCommentVNode("",true)])]}),_:2},ee,te));else return [createVNode(fu,{rounded:"xl",class:"d-flex align-end",src:Q,alt:unref(a).image.alt||unref(a).title,height:unref(D)?"348px":"250px",cover:""},{default:withCtx(()=>[createVNode("div",{class:"d-flex align-center justify-center"},[unref(a)?(openBlock(),createBlock("h3",{key:0,class:"text-white text-h3 pa-10 text-shadow"},toDisplayString(unref(a).title),1)):createCommentVNode("",true)])]),_:1},8,["src","alt","height"])]}),_:1},w,$)):y("<!---->");else return [unref(a).image?.asset?(openBlock(),createBlock(c,{key:0,"asset-id":unref(a).image.asset._ref,auto:"format"},{default:withCtx(({src:Q})=>[createVNode(fu,{rounded:"xl",class:"d-flex align-end",src:Q,alt:unref(a).image.alt||unref(a).title,height:unref(D)?"348px":"250px",cover:""},{default:withCtx(()=>[createVNode("div",{class:"d-flex align-center justify-center"},[unref(a)?(openBlock(),createBlock("h3",{key:0,class:"text-white text-h3 pa-10 text-shadow"},toDisplayString(unref(a).title),1)):createCommentVNode("",true)])]),_:1},8,["src","alt","height"])]),_:1},8,["asset-id"])):createCommentVNode("",true)]}),_:1},O,P)):v("<!---->"),v(ssrRenderComponent(lt,{cols:"12",sm:"6",md:"9"},{default:withCtx((B,y,w,$)=>{if(y)y(`<div data-v-ad48d4e4${$}>`),unref(i)?ssrRenderSlot(s.$slots,"title_option",{},null,y,w,$):ssrRenderSlot(s.$slots,"title_default",{},null,y,w,$),y("</div>");else return [createVNode("div",null,[unref(i)?renderSlot(s.$slots,"title_option",{key:0},void 0,true):renderSlot(s.$slots,"title_default",{key:1},void 0,true)])]}),_:3},O,P));else return [unref(a)?(openBlock(),createBlock(lt,{key:0,cols:"12"},{default:withCtx(()=>[unref(a).image?.asset?(openBlock(),createBlock(c,{key:0,"asset-id":unref(a).image.asset._ref,auto:"format"},{default:withCtx(({src:B})=>[createVNode(fu,{rounded:"xl",class:"d-flex align-end",src:B,alt:unref(a).image.alt||unref(a).title,height:unref(D)?"348px":"250px",cover:""},{default:withCtx(()=>[createVNode("div",{class:"d-flex align-center justify-center"},[unref(a)?(openBlock(),createBlock("h3",{key:0,class:"text-white text-h3 pa-10 text-shadow"},toDisplayString(unref(a).title),1)):createCommentVNode("",true)])]),_:1},8,["src","alt","height"])]),_:1},8,["asset-id"])):createCommentVNode("",true)]),_:1})):createCommentVNode("",true),createVNode(lt,{cols:"12",sm:"6",md:"9"},{default:withCtx(()=>[createVNode("div",null,[unref(i)?renderSlot(s.$slots,"title_option",{key:0},void 0,true):renderSlot(s.$slots,"title_default",{key:1},void 0,true)])]),_:3})]}),_:3},V,q)),p(ssrRenderComponent(Zn,{class:"mt-8"},{default:withCtx((N,v,O,P)=>{if(v)v(ssrRenderComponent(lt,{cols:"12"},{default:withCtx((B,y,w,$)=>{if(y)unref(i)?ssrRenderSlot(s.$slots,"accroche_option",{},null,y,w,$):unref(R)?ssrRenderSlot(s.$slots,"accroche_devis",{},null,y,w,$):ssrRenderSlot(s.$slots,"accroche_default",{},null,y,w,$);else return [unref(i)?renderSlot(s.$slots,"accroche_option",{key:0},void 0,true):unref(R)?renderSlot(s.$slots,"accroche_devis",{key:1},void 0,true):renderSlot(s.$slots,"accroche_default",{key:2},void 0,true)]}),_:3},O,P));else return [createVNode(lt,{cols:"12"},{default:withCtx(()=>[unref(i)?renderSlot(s.$slots,"accroche_option",{key:0},void 0,true):unref(R)?renderSlot(s.$slots,"accroche_devis",{key:1},void 0,true):renderSlot(s.$slots,"accroche_default",{key:2},void 0,true)]),_:3})]}),_:3},V,q)),p(ssrRenderComponent(Zn,{justify:"center"},{default:withCtx((N,v,O,P)=>{if(v)v(ssrRenderComponent(lt,{cols:"auto",class:"mt-8"},{default:withCtx((B,y,w,$)=>{if(y)y(ssrRenderComponent(k,{to:"/thematiques",nuxt:"",size:"x-large",class:"text-decoration-none"},{default:withCtx((Q,F,ee,te)=>{if(F)F(" Retour aux voyages ");else return [createTextVNode(" Retour aux voyages ")]}),_:1},w,$));else return [createVNode(k,{to:"/thematiques",nuxt:"",size:"x-large",class:"text-decoration-none"},{default:withCtx(()=>[createTextVNode(" Retour aux voyages ")]),_:1})]}),_:1},O,P));else return [createVNode(lt,{cols:"auto",class:"mt-8"},{default:withCtx(()=>[createVNode(k,{to:"/thematiques",nuxt:"",size:"x-large",class:"text-decoration-none"},{default:withCtx(()=>[createTextVNode(" Retour aux voyages ")]),_:1})]),_:1})]}),_:1},V,q));else return [createVNode(Zn,{justify:"center",align:"center"},{default:withCtx(()=>[unref(a)?(openBlock(),createBlock(lt,{key:0,cols:"12"},{default:withCtx(()=>[unref(a).image?.asset?(openBlock(),createBlock(c,{key:0,"asset-id":unref(a).image.asset._ref,auto:"format"},{default:withCtx(({src:N})=>[createVNode(fu,{rounded:"xl",class:"d-flex align-end",src:N,alt:unref(a).image.alt||unref(a).title,height:unref(D)?"348px":"250px",cover:""},{default:withCtx(()=>[createVNode("div",{class:"d-flex align-center justify-center"},[unref(a)?(openBlock(),createBlock("h3",{key:0,class:"text-white text-h3 pa-10 text-shadow"},toDisplayString(unref(a).title),1)):createCommentVNode("",true)])]),_:1},8,["src","alt","height"])]),_:1},8,["asset-id"])):createCommentVNode("",true)]),_:1})):createCommentVNode("",true),createVNode(lt,{cols:"12",sm:"6",md:"9"},{default:withCtx(()=>[createVNode("div",null,[unref(i)?renderSlot(s.$slots,"title_option",{key:0},void 0,true):renderSlot(s.$slots,"title_default",{key:1},void 0,true)])]),_:3})]),_:3}),createVNode(Zn,{class:"mt-8"},{default:withCtx(()=>[createVNode(lt,{cols:"12"},{default:withCtx(()=>[unref(i)?renderSlot(s.$slots,"accroche_option",{key:0},void 0,true):unref(R)?renderSlot(s.$slots,"accroche_devis",{key:1},void 0,true):renderSlot(s.$slots,"accroche_default",{key:2},void 0,true)]),_:3})]),_:3}),createVNode(Zn,{justify:"center"},{default:withCtx(()=>[createVNode(lt,{cols:"auto",class:"mt-8"},{default:withCtx(()=>[createVNode(k,{to:"/thematiques",nuxt:"",size:"x-large",class:"text-decoration-none"},{default:withCtx(()=>[createTextVNode(" Retour aux voyages ")]),_:1})]),_:1})]),_:1})]}),_:3},K,W)):unref(C)==="pending"?U(ssrRenderComponent(lt,{cols:"12"},{default:withCtx((G,p,V,q$1)=>{if(p)p(ssrRenderComponent(q,{type:"card"},null,V,q$1));else return [createVNode(q,{type:"card"})]}),_:1},K,W)):U(ssrRenderComponent(lt,{cols:"12",class:"d-flex flex-column justify-center align-center ga-2"},{default:withCtx((G,p,V,q)=>{if(p)unref(a)?p(`<h3 data-v-ad48d4e4${q}>${ssrInterpolate(unref(a).title)}</h3>`):p("<!---->"),ssrRenderSlot(s.$slots,"error",{},null,p,V,q),p(ssrRenderComponent(k,{to:"/",nuxt:"",size:"x-large"},{default:withCtx((N,v,O,P)=>{if(v)v(" Retour aux voyages ");else return [createTextVNode(" Retour aux voyages ")]}),_:1},V,q));else return [unref(a)?(openBlock(),createBlock("h3",{key:0},toDisplayString(unref(a).title),1)):createCommentVNode("",true),renderSlot(s.$slots,"error",{},void 0,true),createVNode(k,{to:"/",nuxt:"",size:"x-large"},{default:withCtx(()=>[createTextVNode(" Retour aux voyages ")]),_:1})]}),_:3},K,W));else return [unref(C)==="success"&&unref(a)?(openBlock(),createBlock(lt,{key:0,cols:"12",xl:"10"},{default:withCtx(()=>[createVNode(Zn,{justify:"center",align:"center"},{default:withCtx(()=>[unref(a)?(openBlock(),createBlock(lt,{key:0,cols:"12"},{default:withCtx(()=>[unref(a).image?.asset?(openBlock(),createBlock(c,{key:0,"asset-id":unref(a).image.asset._ref,auto:"format"},{default:withCtx(({src:G})=>[createVNode(fu,{rounded:"xl",class:"d-flex align-end",src:G,alt:unref(a).image.alt||unref(a).title,height:unref(D)?"348px":"250px",cover:""},{default:withCtx(()=>[createVNode("div",{class:"d-flex align-center justify-center"},[unref(a)?(openBlock(),createBlock("h3",{key:0,class:"text-white text-h3 pa-10 text-shadow"},toDisplayString(unref(a).title),1)):createCommentVNode("",true)])]),_:1},8,["src","alt","height"])]),_:1},8,["asset-id"])):createCommentVNode("",true)]),_:1})):createCommentVNode("",true),createVNode(lt,{cols:"12",sm:"6",md:"9"},{default:withCtx(()=>[createVNode("div",null,[unref(i)?renderSlot(s.$slots,"title_option",{key:0},void 0,true):renderSlot(s.$slots,"title_default",{key:1},void 0,true)])]),_:3})]),_:3}),createVNode(Zn,{class:"mt-8"},{default:withCtx(()=>[createVNode(lt,{cols:"12"},{default:withCtx(()=>[unref(i)?renderSlot(s.$slots,"accroche_option",{key:0},void 0,true):unref(R)?renderSlot(s.$slots,"accroche_devis",{key:1},void 0,true):renderSlot(s.$slots,"accroche_default",{key:2},void 0,true)]),_:3})]),_:3}),createVNode(Zn,{justify:"center"},{default:withCtx(()=>[createVNode(lt,{cols:"auto",class:"mt-8"},{default:withCtx(()=>[createVNode(k,{to:"/thematiques",nuxt:"",size:"x-large",class:"text-decoration-none"},{default:withCtx(()=>[createTextVNode(" Retour aux voyages ")]),_:1})]),_:1})]),_:1})]),_:3})):unref(C)==="pending"?(openBlock(),createBlock(lt,{key:1,cols:"12"},{default:withCtx(()=>[createVNode(q,{type:"card"})]),_:1})):(openBlock(),createBlock(lt,{key:2,cols:"12",class:"d-flex flex-column justify-center align-center ga-2"},{default:withCtx(()=>[unref(a)?(openBlock(),createBlock("h3",{key:0},toDisplayString(unref(a).title),1)):createCommentVNode("",true),renderSlot(s.$slots,"error",{},void 0,true),createVNode(k,{to:"/",nuxt:"",size:"x-large"},{default:withCtx(()=>[createTextVNode(" Retour aux voyages ")]),_:1})]),_:3}))]}),_:3},fe,me));else return [createVNode(Zn,{justify:"center",class:"text-center"},{default:withCtx(()=>[unref(C)==="success"&&unref(a)?(openBlock(),createBlock(lt,{key:0,cols:"12",xl:"10"},{default:withCtx(()=>[createVNode(Zn,{justify:"center",align:"center"},{default:withCtx(()=>[unref(a)?(openBlock(),createBlock(lt,{key:0,cols:"12"},{default:withCtx(()=>[unref(a).image?.asset?(openBlock(),createBlock(c,{key:0,"asset-id":unref(a).image.asset._ref,auto:"format"},{default:withCtx(({src:I})=>[createVNode(fu,{rounded:"xl",class:"d-flex align-end",src:I,alt:unref(a).image.alt||unref(a).title,height:unref(D)?"348px":"250px",cover:""},{default:withCtx(()=>[createVNode("div",{class:"d-flex align-center justify-center"},[unref(a)?(openBlock(),createBlock("h3",{key:0,class:"text-white text-h3 pa-10 text-shadow"},toDisplayString(unref(a).title),1)):createCommentVNode("",true)])]),_:1},8,["src","alt","height"])]),_:1},8,["asset-id"])):createCommentVNode("",true)]),_:1})):createCommentVNode("",true),createVNode(lt,{cols:"12",sm:"6",md:"9"},{default:withCtx(()=>[createVNode("div",null,[unref(i)?renderSlot(s.$slots,"title_option",{key:0},void 0,true):renderSlot(s.$slots,"title_default",{key:1},void 0,true)])]),_:3})]),_:3}),createVNode(Zn,{class:"mt-8"},{default:withCtx(()=>[createVNode(lt,{cols:"12"},{default:withCtx(()=>[unref(i)?renderSlot(s.$slots,"accroche_option",{key:0},void 0,true):unref(R)?renderSlot(s.$slots,"accroche_devis",{key:1},void 0,true):renderSlot(s.$slots,"accroche_default",{key:2},void 0,true)]),_:3})]),_:3}),createVNode(Zn,{justify:"center"},{default:withCtx(()=>[createVNode(lt,{cols:"auto",class:"mt-8"},{default:withCtx(()=>[createVNode(k,{to:"/thematiques",nuxt:"",size:"x-large",class:"text-decoration-none"},{default:withCtx(()=>[createTextVNode(" Retour aux voyages ")]),_:1})]),_:1})]),_:1})]),_:3})):unref(C)==="pending"?(openBlock(),createBlock(lt,{key:1,cols:"12"},{default:withCtx(()=>[createVNode(q,{type:"card"})]),_:1})):(openBlock(),createBlock(lt,{key:2,cols:"12",class:"d-flex flex-column justify-center align-center ga-2"},{default:withCtx(()=>[unref(a)?(openBlock(),createBlock("h3",{key:0},toDisplayString(unref(a).title),1)):createCommentVNode("",true),renderSlot(s.$slots,"error",{},void 0,true),createVNode(k,{to:"/",nuxt:"",size:"x-large"},{default:withCtx(()=>[createTextVNode(" Retour aux voyages ")]),_:1})]),_:3}))]),_:3})]}),_:3},d));}}},se=X.setup;X.setup=(M,x)=>{const h=useSSRContext();return (h.modules||(h.modules=new Set)).add("components/ConfirmationContainer.vue"),se?se(M,x):void 0};const we=Lu(X,[["__scopeId","data-v-ad48d4e4"]]),ce={__name:"confirmation",__ssrInlineRender:true,async setup(M){let x,h;const T=lp(),J=O`*[_type == "confirmation" && slug.current == "confirmation"][0]{
  titleOption,
  titleDefault,
  titleError,
  errorMessage,
  accrocheOption,
  accrocheDefault,
  accrocheDevis
}`,{data:i,status:R}=([x,h]=withAsyncContext(()=>Jc("confirmation-page",()=>T.fetch(J))),x=await x,h(),x);return K({seoData:{robotsIndex:false,robotsFollow:false}}),(Y,a,C,D)=>{const s=we;a(`<div${ssrRenderAttrs(D)}>`),unref(i)&&unref(R)==="success"?a(ssrRenderComponent(s,null,{title_option:withCtx((z,d,b,c)=>{if(d)d(`<h1${c}>${ssrInterpolate(unref(i).titleOption)}</h1>`);else return [createVNode("h1",null,toDisplayString(unref(i).titleOption),1)]}),title_default:withCtx((z,d,b,c)=>{if(d)d(`<h1${c}>${ssrInterpolate(unref(i).titleDefault)}</h1>`);else return [createVNode("h1",null,toDisplayString(unref(i).titleDefault),1)]}),error:withCtx((z,d,b,c)=>{if(d)d(`<h1${c}>${ssrInterpolate(unref(i).titleError)}</h1><p${c}>${ssrInterpolate(unref(i).errorMessage)}</p>`);else return [createVNode("h1",null,toDisplayString(unref(i).titleError),1),createVNode("p",null,toDisplayString(unref(i).errorMessage),1)]}),accroche_option:withCtx((z,d,b,c)=>{if(d)d(`<p${c}>${ssrInterpolate(unref(i).accrocheOption)}</p>`);else return [createVNode("p",null,toDisplayString(unref(i).accrocheOption),1)]}),accroche_default:withCtx((z,d,b,c)=>{if(d)d(`<p${c}>${ssrInterpolate(unref(i).accrocheDefault)}</p>`);else return [createVNode("p",null,toDisplayString(unref(i).accrocheDefault),1)]}),accroche_devis:withCtx((z,d,b,c)=>{if(d)d(`<p${c}>${ssrInterpolate(unref(i).accrocheDevis)}</p>`);else return [createVNode("p",null,toDisplayString(unref(i).accrocheDevis),1)]}),_:1},C)):unref(R)==="pending"?(a('<div class="d-flex justify-center align-center">'),a(ssrRenderComponent(un,{indeterminate:""},null,C)),a("</div>")):a("<!---->"),a("</div>");}}},re=ce.setup;ce.setup=(M,x)=>{const h=useSSRContext();return (h.modules||(h.modules=new Set)).add("pages/confirmation.vue"),re?re(M,x):void 0};

export { ce as default };
//# sourceMappingURL=confirmation-B7Mv3Hmn.mjs.map

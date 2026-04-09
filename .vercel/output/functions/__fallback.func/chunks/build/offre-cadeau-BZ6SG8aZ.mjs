import { x } from './sanity-image-nuxt-DuqwncgS.mjs';
import { withAsyncContext, unref, withCtx, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createCommentVNode, createVNode, mergeProps, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderSlot } from 'vue/server-renderer';
import { a as at } from './composables-Dcwg06ZS.mjs';
import { u as up, a as Qc, e as Zn, b6 as un, C as fu, _ as Lu, f as lt } from './server.mjs';
import { z } from './SectionContainer-DKfgvH0W.mjs';
import { B as B$1 } from './EnrichedText-COchyxWO.mjs';
import O from 'groq';
import { K as K$1 } from './useSeo-CsS5EJ8u.mjs';
import './NuxtImg-qXjnjbL3.mjs';
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
import '@portabletext/vue';
import './getImageUrl-B94zyPkX.mjs';
import '@sanity/image-url';

const j={__name:"FixedImgHeroSection",__ssrInlineRender:true,props:{imgSrc:{type:Object,required:true},imgSrcMobile:{type:Object,required:true}},setup(s){const o=at();return (r,u,d,e)=>{const y=x;u(`<div${ssrRenderAttrs(e)}>`),u(ssrRenderComponent(y,{"asset-id":s.imgSrc.asset._ref,auto:"format"},{default:withCtx(({src:i},n,c,l)=>{if(n)n(ssrRenderComponent(fu,{class:"img-couv hidden-md-and-down",src:i,"lazy-src":unref(o)(i,{format:"webp",quality:10,height:900,width:1536})},null,c,l));else return [createVNode(fu,{class:"img-couv hidden-md-and-down",src:i,"lazy-src":unref(o)(i,{format:"webp",quality:10,height:900,width:1536})},null,8,["src","lazy-src"])]}),_:1},d)),u(ssrRenderComponent(y,{"asset-id":s.imgSrcMobile.asset._ref,auto:"format"},{default:withCtx(({src:i},n,c,l)=>{if(n)n(ssrRenderComponent(fu,{class:"img-couv hidden-md-and-up",src:i,"lazy-src":unref(o)(i,{format:"webp",quality:10,height:900,width:1536})},null,c,l));else return [createVNode(fu,{class:"img-couv hidden-md-and-up",src:i,"lazy-src":unref(o)(i,{format:"webp",quality:10,height:900,width:1536})},null,8,["src","lazy-src"])]}),_:1},d)),u("</div>");}}},B=j.setup;j.setup=(s,o)=>{const r=useSSRContext();return (r.modules||(r.modules=new Set)).add("components/content/FixedImgHeroSection.vue"),B?B(s,o):void 0};const M={__name:"IntegrationCapcadeau",__ssrInlineRender:true,setup(s){return (o,r,u,d)=>{r(`<div${ssrRenderAttrs(mergeProps({class:"cap-cadeau-widget","data-url":"https://www.capcadeau.com/widget/liste-bons/1144"},d))}></div>`);}}},L=M.setup;M.setup=(s,o)=>{const r=useSSRContext();return (r.modules||(r.modules=new Set)).add("components/content/IntegrationCapcadeau.vue"),L?L(s,o):void 0};const pe=Object.assign(M,{__name:"IntegrationCapcadeau"}),P={__name:"PictoCol",__ssrInlineRender:true,props:{imgSrc:{type:Object,required:true}},setup(s){return (o,r,u,d)=>{const e=x;r(ssrRenderComponent(lt,mergeProps({cols:"12",sm:"6",md:"4",class:"picto_container"},d),{default:withCtx((y,i,n,c)=>{if(i)i(ssrRenderComponent(e,{"asset-id":s.imgSrc.asset._ref,auto:"format"},{default:withCtx(({src:l},w,W,v)=>{if(w)w(`<img width="15%" class="mb-4"${ssrRenderAttr("src",l)} data-v-ce9b2ad9${v}>`);else return [createVNode("img",{width:"15%",class:"mb-4",src:l},null,8,["src"])]}),_:1},n,c)),ssrRenderSlot(o.$slots,"text",{},null,i,n,c);else return [createVNode(e,{"asset-id":s.imgSrc.asset._ref,auto:"format"},{default:withCtx(({src:l})=>[createVNode("img",{width:"15%",class:"mb-4",src:l},null,8,["src"])]),_:1},8,["asset-id"]),renderSlot(o.$slots,"text",{},void 0,true)]}),_:3},u));}}},E=P.setup;P.setup=(s,o)=>{const r=useSSRContext();return (r.modules||(r.modules=new Set)).add("components/content/PictoCol.vue"),E?E(s,o):void 0};const fe=Lu(P,[["__scopeId","data-v-ce9b2ad9"]]),K={__name:"offre-cadeau",__ssrInlineRender:true,async setup(s){let o,r;const u=up(),d=O`*[_type == "offreCadeau"][0]{
  title,
  heroImage,
  heroImageMobile,
  mainContent,
  howItWorksTitle,
  pictoCols[]{
    image,
    text
  },
  seo
}`,{data:e,status:y}=([o,r]=withAsyncContext(()=>Qc("offre-cadeau",()=>u.fetch(d))),o=await o,r(),o);return e.value&&K$1({seoData:e.value?.seo,content:e.value,pageType:"website",slug:"offre-cadeau",baseUrl:"/offre-cadeau"}),(i,n,c,l)=>{const w=j,W=z,v=B$1,A=pe,h=fe;n(`<div${ssrRenderAttrs(l)}>`),unref(e)?.heroImage&&unref(e)?.heroImageMobile?n(ssrRenderComponent(w,{"img-src":unref(e).heroImage,"img-src-mobile":unref(e).heroImageMobile},null,c)):n("<!---->"),unref(e)?n(ssrRenderComponent(W,null,{content:withCtx((_e,p,k,I)=>{if(p)unref(e).mainContent?p(ssrRenderComponent(v,{value:unref(e).mainContent},null,k,I)):p("<!---->"),unref(e).howItWorksTitle?p(`<h1 class="text-center my-8"${I}>${ssrInterpolate(unref(e).howItWorksTitle)}</h1>`):p("<!---->"),p(ssrRenderComponent(A,null,null,k,I)),unref(e).pictoCols&&unref(e).pictoCols.length>0?p(ssrRenderComponent(Zn,null,{default:withCtx((R,g,Q,X)=>{if(g)g("<!--[-->"),ssrRenderList(unref(e).pictoCols,(x,q)=>{g(ssrRenderComponent(h,{key:q,"img-src":x.image},{text:withCtx((ge,F,xe,Ce)=>{if(F)F(`${ssrInterpolate(x.text)}`);else return [createTextVNode(toDisplayString(x.text),1)]}),_:2},Q,X));}),g("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(e).pictoCols,(x,q)=>(openBlock(),createBlock(h,{key:q,"img-src":x.image},{text:withCtx(()=>[createTextVNode(toDisplayString(x.text),1)]),_:2},1032,["img-src"]))),128))]}),_:1},k,I)):p("<!---->");else return [unref(e).mainContent?(openBlock(),createBlock(v,{key:0,value:unref(e).mainContent},null,8,["value"])):createCommentVNode("",true),unref(e).howItWorksTitle?(openBlock(),createBlock("h1",{key:1,class:"text-center my-8"},toDisplayString(unref(e).howItWorksTitle),1)):createCommentVNode("",true),createVNode(A),unref(e).pictoCols&&unref(e).pictoCols.length>0?(openBlock(),createBlock(Zn,{key:2},{default:withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(e).pictoCols,(R,g)=>(openBlock(),createBlock(h,{key:g,"img-src":R.image},{text:withCtx(()=>[createTextVNode(toDisplayString(R.text),1)]),_:2},1032,["img-src"]))),128))]),_:1})):createCommentVNode("",true)]}),_:1},c)):unref(y)==="pending"?(n('<div class="d-flex justify-center align-center">'),n(ssrRenderComponent(un,{indeterminate:""},null,c)),n("</div>")):n("<!---->"),n("</div>");}}},U=K.setup;K.setup=(s,o)=>{const r=useSSRContext();return (r.modules||(r.modules=new Set)).add("pages/offre-cadeau.vue"),U?U(s,o):void 0};

export { K as default };
//# sourceMappingURL=offre-cadeau-BZ6SG8aZ.mjs.map

import { J } from './HeroSection-Ksavt6Vs.mjs';
import { z } from './SectionContainer-DKfgvH0W.mjs';
import { B } from './EnrichedText-COchyxWO.mjs';
import { k } from './ctaButton-CoL2yy46.mjs';
import { withAsyncContext, mergeProps, withCtx, unref, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import O from 'groq';
import { u as up, a as Qc, V as fi } from './server.mjs';
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

const N={__name:"entreprise",__ssrInlineRender:true,async setup(S){let x,y$1;const R=O`*[_type == "entreprise"][0]{
  ...,
  heroSection{
    image,
    title
  },
  contentBlock1[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata
      }
    }
  },
  contentBlock2[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata
      }
    }
  },
  contentBlock3[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata
      }
    }
  },
  contentBlock4[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata
      }
    }
  },
  contentBlock5[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        _ref,
        url,
        metadata
      }
    }
  },
  ctaButton
}`,q=up(),{data:t}=([x,y$1]=withAsyncContext(()=>Qc("entreprise",()=>q.fetch(R))),x=await x,y$1(),x);if(t.value){const d={title:"Tribus par Odysway",description:"Des expériences uniques pour votre entreprise : découvrez nos séminaires et voyages Tribus",image:t.value.heroSection?.image};K({seoData:t.value?.seo,content:d,pageType:"website",slug:"entreprise",baseUrl:"/entreprise",structuredData:[u({description:t.value?.seo?.metaDescription||d.description}),y()]});}return (d,z$1,A,O)=>{const C=J,$=z,c=B,u=k;z$1(ssrRenderComponent(fi,mergeProps({class:"pt-4 py-md-0 my-0 px-2 px-md-4",fluid:""},O),{default:withCtx((Z,f,w,D)=>{if(f)f(ssrRenderComponent(C,{"image-src":unref(t).heroSection.image},{title:withCtx((P,n,k,p)=>{if(n)n(`${ssrInterpolate(unref(t).heroSection.title)}`);else return [createTextVNode(toDisplayString(unref(t).heroSection.title),1)]}),_:1},w,D)),f(ssrRenderComponent($,null,{content:withCtx((P,n,k,p)=>{if(n)unref(t).contentBlock1?n(ssrRenderComponent(c,{value:unref(t).contentBlock1,class:"mb-8"},null,k,p)):n("<!---->"),unref(t).ctaButton?n(ssrRenderComponent(u,{link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-1"},{text:withCtx((g,B,b,v)=>{if(B)B(`${ssrInterpolate(unref(t).ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]}),_:1},k,p)):n("<!---->"),unref(t).contentBlock2?n(ssrRenderComponent(c,{value:unref(t).contentBlock2,class:"mb-8"},null,k,p)):n("<!---->"),unref(t).ctaButton?n(ssrRenderComponent(u,{link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-2"},{text:withCtx((g,B,b,v)=>{if(B)B(`${ssrInterpolate(unref(t).ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]}),_:1},k,p)):n("<!---->"),unref(t).contentBlock3?n(ssrRenderComponent(c,{value:unref(t).contentBlock3,class:"mb-8"},null,k,p)):n("<!---->"),unref(t).ctaButton?n(ssrRenderComponent(u,{link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-3"},{text:withCtx((g,B,b,v)=>{if(B)B(`${ssrInterpolate(unref(t).ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]}),_:1},k,p)):n("<!---->"),unref(t).contentBlock4?n(ssrRenderComponent(c,{value:unref(t).contentBlock4,class:"mb-8"},null,k,p)):n("<!---->"),unref(t).contentBlock5?n(ssrRenderComponent(c,{value:unref(t).contentBlock5,class:"mb-8"},null,k,p)):n("<!---->"),unref(t).ctaButton?n(ssrRenderComponent(u,{link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-4"},{text:withCtx((g,B,b,v)=>{if(B)B(`${ssrInterpolate(unref(t).ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]}),_:1},k,p)):n("<!---->");else return [unref(t).contentBlock1?(openBlock(),createBlock(c,{key:0,value:unref(t).contentBlock1,class:"mb-8"},null,8,["value"])):createCommentVNode("",true),unref(t).ctaButton?(openBlock(),createBlock(u,{key:1,link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-1"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]),_:1},8,["link","external"])):createCommentVNode("",true),unref(t).contentBlock2?(openBlock(),createBlock(c,{key:2,value:unref(t).contentBlock2,class:"mb-8"},null,8,["value"])):createCommentVNode("",true),unref(t).ctaButton?(openBlock(),createBlock(u,{key:3,link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-2"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]),_:1},8,["link","external"])):createCommentVNode("",true),unref(t).contentBlock3?(openBlock(),createBlock(c,{key:4,value:unref(t).contentBlock3,class:"mb-8"},null,8,["value"])):createCommentVNode("",true),unref(t).ctaButton?(openBlock(),createBlock(u,{key:5,link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-3"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]),_:1},8,["link","external"])):createCommentVNode("",true),unref(t).contentBlock4?(openBlock(),createBlock(c,{key:6,value:unref(t).contentBlock4,class:"mb-8"},null,8,["value"])):createCommentVNode("",true),unref(t).contentBlock5?(openBlock(),createBlock(c,{key:7,value:unref(t).contentBlock5,class:"mb-8"},null,8,["value"])):createCommentVNode("",true),unref(t).ctaButton?(openBlock(),createBlock(u,{key:8,link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-4"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]),_:1},8,["link","external"])):createCommentVNode("",true)]}),_:1},w,D));else return [createVNode(C,{"image-src":unref(t).heroSection.image},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).heroSection.title),1)]),_:1},8,["image-src"]),createVNode($,null,{content:withCtx(()=>[unref(t).contentBlock1?(openBlock(),createBlock(c,{key:0,value:unref(t).contentBlock1,class:"mb-8"},null,8,["value"])):createCommentVNode("",true),unref(t).ctaButton?(openBlock(),createBlock(u,{key:1,link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-1"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]),_:1},8,["link","external"])):createCommentVNode("",true),unref(t).contentBlock2?(openBlock(),createBlock(c,{key:2,value:unref(t).contentBlock2,class:"mb-8"},null,8,["value"])):createCommentVNode("",true),unref(t).ctaButton?(openBlock(),createBlock(u,{key:3,link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-2"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]),_:1},8,["link","external"])):createCommentVNode("",true),unref(t).contentBlock3?(openBlock(),createBlock(c,{key:4,value:unref(t).contentBlock3,class:"mb-8"},null,8,["value"])):createCommentVNode("",true),unref(t).ctaButton?(openBlock(),createBlock(u,{key:5,link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-3"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]),_:1},8,["link","external"])):createCommentVNode("",true),unref(t).contentBlock4?(openBlock(),createBlock(c,{key:6,value:unref(t).contentBlock4,class:"mb-8"},null,8,["value"])):createCommentVNode("",true),unref(t).contentBlock5?(openBlock(),createBlock(c,{key:7,value:unref(t).contentBlock5,class:"mb-8"},null,8,["value"])):createCommentVNode("",true),unref(t).ctaButton?(openBlock(),createBlock(u,{key:8,link:unref(t).ctaButton.link,external:unref(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-4"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).ctaButton.text),1)]),_:1},8,["link","external"])):createCommentVNode("",true)]),_:1})]}),_:1},A));}}},V=N.setup;N.setup=(S,x)=>{const y=useSSRContext();return (y.modules||(y.modules=new Set)).add("pages/entreprise.vue"),V?V(S,x):void 0};

export { N as default };
//# sourceMappingURL=entreprise-BVnitwUn.mjs.map

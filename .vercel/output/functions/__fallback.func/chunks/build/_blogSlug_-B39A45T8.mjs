import { w as we } from './BlogHeroSection-Bql1kfK4.mjs';
import { z } from './SectionContainer-DKfgvH0W.mjs';
import { B as B$1 } from './EnrichedText-COchyxWO.mjs';
import { computed, withAsyncContext, watchEffect, mergeProps, withCtx, unref, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { d as bt, u as up, a as Qc, c as Mt, g as Ue, V as fi } from './server.mjs';
import { K } from './useSeo-CsS5EJ8u.mjs';
import { g } from './structuredData-D7RlK3gb.mjs';
import './AvatarImg-uPpuu2qe.mjs';
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
import './sanity-image-nuxt-DuqwncgS.mjs';
import './NuxtImg-qXjnjbL3.mjs';
import '@mdi/js';
import '@sanity/client/stega';
import './ssrSlot-D7De7VY4.mjs';
import './slot-Dpt2kD0O.mjs';
import '@portabletext/vue';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'vue-dompurify-html';
import '@date-io/dayjs';
import 'lodash';
import 'search-insights';
import '@vueuse/core';
import 'groq';
import 'perfect-debounce';

const Y=`
  *[_type == "blog" && slug.current == $slug][0]{
    ...,
    author->{
      _id,
      name,
      image,
      position,
      description
    },
    categories[]->{
      _id,
      title
    },
    seo{
      metaTitle,
      metaDescription,
      canonicalUrl,
      focusKeyword,
      keywords,
      robotsIndex,
      robotsFollow,
      ogTitle,
      ogDescription,
      ogImage{
        asset->{
          _id,
          _ref,
          url
        },
        alt
      }
    },
    body[]{
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
    "numberOfCharacters": length(pt::text(body)),
    "estimatedWordCount": round(length(pt::text(body)) / 5),
    "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
  }
`,V={__name:"[blogSlug]",__ssrInlineRender:true,async setup(y){let i,a;const c=bt(),$=computed(()=>c.params.blogSlug),A=up(),{data:t}=([i,a]=withAsyncContext(()=>Qc("blog",()=>A.fetch(Y,{slug:$.value}))),i=await i,a(),i);if(!t.value)throw Mt({statusCode:404,statusMessage:"Page not found"});const b=computed(()=>{const n=t.value?.estimatedReadingTime||0;return Math.max(1,n).toString()}),d=computed(()=>(t.value?.categories||[])[0]?.title||null),f=computed(()=>d.value?"secondary":null);return watchEffect(()=>{if(!t.value)return;const n=Ue();K({seoData:t.value.seo||{},content:t.value,pageType:"article",slug:t.value.slug?.current,structuredData:g(t.value,`https://odysway.com${c.path}`,n),breadcrumbs:[{name:"Blog",url:"https://odysway.com/blog"},{name:t.value.seo?.metaTitle||t.value.title,url:`https://odysway.com${c.path}`}]});}),(n,E,N,P)=>{const v=we,x=z,g=B$1;E(ssrRenderComponent(fi,mergeProps({class:"pt-4 py-md-0 my-0",fluid:""},P),{default:withCtx((Z,s,S,C)=>{if(s)unref(t)?s(ssrRenderComponent(v,{title:unref(t).title,description:unref(t).description,image:unref(t).displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":unref(d),"badge-color":unref(f),"reading-time":unref(b),"published-at":unref(t).publishedAt,author:unref(t).author?.name,"author-photo":unref(t).author?.image,"author-role":unref(t).author?.position,"author-description":unref(t).author?.description},{title:withCtx((w,e,_,h)=>{if(e)e(`${ssrInterpolate(unref(t).title)}`);else return [createTextVNode(toDisplayString(unref(t).title),1)]}),introduction:withCtx((w,e,_,h)=>{if(e)e(`${ssrInterpolate(unref(t).description)}`);else return [createTextVNode(toDisplayString(unref(t).description),1)]}),_:1},S,C)):s("<!---->"),unref(t)?s(ssrRenderComponent(x,null,{content:withCtx((w,e,_,h)=>{if(e)e(ssrRenderComponent(g,{value:unref(t).body},null,_,h));else return [createVNode(g,{value:unref(t).body},null,8,["value"])]}),_:1},S,C)):s("<!---->");else return [unref(t)?(openBlock(),createBlock(v,{key:0,title:unref(t).title,description:unref(t).description,image:unref(t).displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":unref(d),"badge-color":unref(f),"reading-time":unref(b),"published-at":unref(t).publishedAt,author:unref(t).author?.name,"author-photo":unref(t).author?.image,"author-role":unref(t).author?.position,"author-description":unref(t).author?.description},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).title),1)]),introduction:withCtx(()=>[createTextVNode(toDisplayString(unref(t).description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role","author-description"])):createCommentVNode("",true),unref(t)?(openBlock(),createBlock(x,{key:1},{content:withCtx(()=>[createVNode(g,{value:unref(t).body},null,8,["value"])]),_:1})):createCommentVNode("",true)]}),_:1},N));}}},B=V.setup;V.setup=(y,i)=>{const a=useSSRContext();return (a.modules||(a.modules=new Set)).add("pages/[blogSlug].vue"),B?B(y,i):void 0};

export { V as default };
//# sourceMappingURL=_blogSlug_-B39A45T8.mjs.map

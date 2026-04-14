import { a as ae } from './ContentLayout-B_nzSye3.mjs';
import { G as Gt } from './SearchField-C1No64IL.mjs';
import { w as we } from './BlogHeroSection-COTyFTAc.mjs';
import { z } from './SectionContainer-CuQ9WYu3.mjs';
import { B } from './EnrichedText-DuMnQ6-0.mjs';
import { computed, withAsyncContext, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { h as Er, a0 as cn, d as pt, u as lp, a as Jc, g as qe } from './server.mjs';
import O from 'groq';
import { K } from './useSeo-CsS5EJ8u.mjs';
import { g } from './structuredData-D7RlK3gb.mjs';
import './SearchHeroSection-bzkK_7Va.mjs';
import './getImageUrl-B94zyPkX.mjs';
import '@sanity/image-url';
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
import './ColorContainer-CrUITWCx.mjs';
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
import './HorizontalCarousel-DYGVWO59.mjs';
import './CustomChevronBtn-Dcvt4QRo.mjs';
import './ThematiqueColCard-eoc1chFL.mjs';
import './VLazy-X1Hg2eeI.mjs';
import './VDivider-CyZet7le.mjs';
import './useTravelDates-Diphbbs6.mjs';
import './NextDepartureCard-Bp4Rhfac.mjs';
import './getDateStatus-COvYSwLT.mjs';
import './VTooltip-CK5X-xBn.mjs';
import './VoyageCard-C1Obvr8r.mjs';
import './CtaCardSheet-BOxYgDlP.mjs';
import './sanity-image-nuxt-BjxFsp-6.mjs';
import './NuxtImg-BG7lA2AK.mjs';
import './VAutocomplete-BgyeS46r.mjs';
import './VSelect-DYMDk8Cd.mjs';
import './VList-DT0Pyyna.mjs';
import './ssrBoot-755kmDGm.mjs';
import './VListItemTitle-DS3Mch2w.mjs';
import './AvatarImg-D1kZHHkd.mjs';
import '@sanity/client/stega';
import './ssrSlot-D7De7VY4.mjs';
import './slot-Dpt2kD0O.mjs';
import '@portabletext/vue';

const pe=`
  *[_type == "experience" && slug.current == $slug][0]{
    _id,
    title,
    badgeTitle,
    slug,
    description,
    image,
    showOnHome,
    "voyages": *[_type == "voyage" && references(^._id) && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
      )]{
      _id,
      title,
      "slug": slug.current,
      image,
      duration,
      nights,
      rating,
      comments,
      availabilityTypes,
      "startingPrice": pricing.startingPrice,
      pricing {
        startingPrice
      },
      destinations[]->{
        _id,
        title
      },
      experienceType->{
        _id,
        title
      },
      categories[]->{
        _id,
        title
      },
      monthlyAvailability
    },
    seo,
    blog->{
      _id,
      title,
      slug,
      description,
      displayedImg,
      publishedAt,
      body,
      categories[]->{
        _id,
        title
      },
      author->{
        _id,
        name,
        image,
        position
      },
      body[]{
        ...,
        _type == "image" => {
          ...,
          asset->{
            _id,
            url,
            "metadata": {
              "dimensions": metadata.dimensions,
              "lqip": metadata.lqip
            }
          }
        }
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
      "numberOfCharacters": length(pt::text(body)),
      "estimatedWordCount": round(length(pt::text(body)) / 5),
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
    },
  }
`,ce=`
  *[_type == "experience"]{
    _id,
    title,
    slug,
    image,
    discoveryTitle,
    description
  }
`,q={__name:"[experienceSlug]",__ssrInlineRender:true,async setup(S){let i,r;const{trackViewItemList:U}=Er(),{formatVoyagesForGtm:F}=cn(),G=pt(),k=computed(()=>G.params.experienceSlug),H=O`*[_type == "page_experiences"][0]{
  ...
}`,b=lp(),{data:m}=([i,r]=withAsyncContext(()=>Jc("page-content",()=>b.fetch(H))),i=await i,r(),i),{data:e}=([i,r]=withAsyncContext(()=>Jc(()=>`selected-experience-${k.value}`,()=>b.fetch(pe,{slug:k.value}),"$t7kHVUqSfa")),i=await i,r(),i),{data:O$1}=([i,r]=withAsyncContext(()=>Jc("experiences-on-content-layout",()=>b.fetch(ce))),i=await i,r(),i),Q=computed(()=>({items:O$1.value?.map(o=>({id:o._id,title:o.title,slug:o.slug?.current,image:o.image,type:"experiences",discoveryTitle:o.discoveryTitle||o.description||""})).filter(o=>o.image?.asset?._ref),selectedItem:e.value,pageTitle:m.value?.index?.pageTitle||"Toutes nos expériences",showOnBottom:false})),$=computed(()=>{if(!e.value?.blog)return null;const o=e.value.blog.estimatedReadingTime||0;return Math.max(1,o).toString()}),_=computed(()=>(e.value?.blog?.categories||[])[0]?.title||null),R=computed(()=>_.value?"secondary":null);if(watch(()=>e.value?.voyages,o=>{if(o&&o.length>0){const s=F(o),v=`Experience - ${e.value?.title||"Unknown"}`;s&&s.length>0&&U({currency:"EUR",items:s,itemListName:v});}},{immediate:true}),e.value){const o=qe();K({seoData:e.value.seo||e.value.blog?.seo||{},content:e.value,pageType:"article",slug:e.value.slug?.current,structuredData:e.value.blog?g(e.value.blog,`https://odysway.com/experiences/${e.value.slug.current}`,o):null,breadcrumbs:[{name:"Accueil",url:"https://odysway.com"},{name:"Expériences",url:"https://odysway.com/experiences"},{name:e.value.title,url:`https://odysway.com/experiences/${e.value.slug.current}`}]});}return (o,s,v,z$1)=>{const K=ae,V=Gt,D=we,I=z,f=B;s(ssrRenderComponent(K,mergeProps({"selected-experience":unref(e),"page-content":unref(m),"display-divider":true,"displayed-data":unref(Q),type:"experiences"},z$1),{content:withCtx((me,a,h,u)=>{if(a)a(`<div${u}>`),a(ssrRenderComponent(V,{"is-search":true,"selected-experience":unref(e),voyages:unref(e).voyages,"page-content":unref(m)},null,h,u)),unref(e)?.blog?a(ssrRenderComponent(D,{class:"mt-12",title:unref(e).blog.title,description:unref(e).blog.description,image:unref(e).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":unref(_),"badge-color":unref(R),"reading-time":unref($),"published-at":unref(e).blog.publishedAt,author:unref(e).blog.author?.name,"author-photo":unref(e).blog.author?.image,"author-role":unref(e).blog.author?.position},{title:withCtx((A,n,x,T)=>{if(n)n(`${ssrInterpolate(unref(e).blog.title)}`);else return [createTextVNode(toDisplayString(unref(e).blog.title),1)]}),introduction:withCtx((A,n,x,T)=>{if(n)n(`${ssrInterpolate(unref(e).blog.description)}`);else return [createTextVNode(toDisplayString(unref(e).blog.description),1)]}),_:1},h,u)):a("<!---->"),unref(e)?.blog?a(ssrRenderComponent(I,{title:unref(e).blog.title,subtitle:unref(e).blog.excerpt},{content:withCtx((A,n,x,T)=>{if(n)n(ssrRenderComponent(f,{value:unref(e).blog.body},null,x,T));else return [createVNode(f,{value:unref(e).blog.body},null,8,["value"])]}),_:1},h,u)):a("<!---->"),a("</div>");else return [createVNode("div",null,[createVNode(V,{"is-search":true,"selected-experience":unref(e),voyages:unref(e).voyages,"page-content":unref(m)},null,8,["selected-experience","voyages","page-content"]),unref(e)?.blog?(openBlock(),createBlock(D,{key:0,class:"mt-12",title:unref(e).blog.title,description:unref(e).blog.description,image:unref(e).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":unref(_),"badge-color":unref(R),"reading-time":unref($),"published-at":unref(e).blog.publishedAt,author:unref(e).blog.author?.name,"author-photo":unref(e).blog.author?.image,"author-role":unref(e).blog.author?.position},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(e).blog.title),1)]),introduction:withCtx(()=>[createTextVNode(toDisplayString(unref(e).blog.description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role"])):createCommentVNode("",true),unref(e)?.blog?(openBlock(),createBlock(I,{key:1,title:unref(e).blog.title,subtitle:unref(e).blog.excerpt},{content:withCtx(()=>[createVNode(f,{value:unref(e).blog.body},null,8,["value"])]),_:1},8,["title","subtitle"])):createCommentVNode("",true)])]}),_:1},v));}}},P=q.setup;q.setup=(S,i)=>{const r=useSSRContext();return (r.modules||(r.modules=new Set)).add("pages/experiences/[experienceSlug].vue"),P?P(S,i):void 0};

export { q as default };
//# sourceMappingURL=_experienceSlug_-DAetxnry.mjs.map

import { a as ae } from './ContentLayout-B_nzSye3.mjs';
import { G as Gt } from './SearchField-C1No64IL.mjs';
import { w as we } from './BlogHeroSection-COTyFTAc.mjs';
import { z } from './SectionContainer-CuQ9WYu3.mjs';
import { B } from './EnrichedText-DuMnQ6-0.mjs';
import { computed, withAsyncContext, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { h as Er, a0 as cn, d as pt, u as lp, a as Jc, g as qe } from './server.mjs';
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
import 'groq';
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

const st=`
  *[_type == "page_thematiques"][0]{
    ...
  }
`,nt=`
  *[_type == "category" && slug.current == $slug][0]{
      _id,
    title,
    slug,
    image,
    "voyages": *[_type == "voyage" && references(^._id) && (
        !('custom' in availabilityTypes)
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
`,mt=`
  *[_type == "category"]{
    _id,
    title,
    slug,
    image,
    discoveryTitle,
    description
  }
`,F={__name:"[thematiqueSlug]",__ssrInlineRender:true,async setup($){let i,r;const{trackViewItemList:G}=Er(),{formatVoyagesForGtm:Q}=cn(),U=pt(),R=computed(()=>U.params.thematiqueSlug),y=lp(),{data:c}=([i,r]=withAsyncContext(async()=>Jc("page-content",async()=>{try{return await y.fetch(st)||{}}catch{return {}}})),i=await i,r(),i),{data:t}=([i,r]=withAsyncContext(async()=>Jc(()=>`category-sanity-${R.value}`,async()=>{try{return await y.fetch(nt,{slug:R.value})}catch{return null}},"$5kAZ3aplFC")),i=await i,r(),i),{data:z$1}=([i,r]=withAsyncContext(async()=>Jc("categories-on-content-layout",async()=>{try{return await y.fetch(mt)||[]}catch{return []}})),i=await i,r(),i),E=computed(()=>({items:z$1.value?.map(o=>({id:o._id,title:o.title,slug:o.slug?.current,image:o.image,type:"thematiques",discoveryTitle:o.discoveryTitle||o.description||""})).filter(o=>o.image?.asset?._ref),selectedItem:t.value,pageTitle:c.value?.index?.pageTitle||"Toutes nos thématiques",showOnBottom:false})),A=computed(()=>{if(!t.value?.blog)return null;const o=t.value.blog.estimatedReadingTime||0;return Math.max(1,o).toString()}),b=computed(()=>(t.value?.blog?.categories||[])[0]?.title||null),D=computed(()=>b.value?"secondary":null);if(watch(()=>t.value?.voyages,o=>{if(o&&o.length>0){const n=Q(o),_=`Thematique - ${t.value?.title||"Unknown"}`;n&&n.length>0&&G({currency:"EUR",items:n,itemListName:_});}},{immediate:true}),t.value){const o=qe();K({seoData:t.value.seo||t.value.blog?.seo||{},content:t.value,pageType:"article",slug:t.value.slug?.current,structuredData:t.value.blog?g(t.value.blog,`https://odysway.com/thematiques/${t.value.slug.current}`,o):null,breadcrumbs:[{name:"Accueil",url:"https://odysway.com"},{name:"Thématiques",url:"https://odysway.com/thematiques"},{name:t.value.title,url:`https://odysway.com/thematiques/${t.value.slug.current}`}]});}return (o,n,_,O)=>{const H=ae,I=Gt,V=we,B$1=z,h=B;n(ssrRenderComponent(H,mergeProps({"selected-category":unref(t),"page-content":unref(c),"display-divider":true,"displayed-data":unref(E),type:"thematiques"},O),{content:withCtx((ut,a,v,p)=>{if(a)a(`<div${p}>`),unref(t)?a(ssrRenderComponent(I,{"is-search":true,"selected-category":unref(t),voyages:unref(t).voyages,"page-content":unref(c)},null,v,p)):a("<!---->"),a("</div>"),unref(t)?.blog?a(ssrRenderComponent(V,{class:"mt-12",title:unref(t).blog.title,description:unref(t).blog.description,image:unref(t).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":unref(b),"badge-color":unref(D),"reading-time":unref(A),"published-at":unref(t).blog.publishedAt,author:unref(t).blog.author?.name,"author-photo":unref(t).blog.author?.image,"author-role":unref(t).blog.author?.position},{title:withCtx((L,l,f,x)=>{if(l)l(`${ssrInterpolate(unref(t).blog.title)}`);else return [createTextVNode(toDisplayString(unref(t).blog.title),1)]}),introduction:withCtx((L,l,f,x)=>{if(l)l(`${ssrInterpolate(unref(t).blog.description)}`);else return [createTextVNode(toDisplayString(unref(t).blog.description),1)]}),_:1},v,p)):a("<!---->"),unref(t)?.blog?a(ssrRenderComponent(B$1,{title:unref(t).blog.title,subtitle:unref(t).blog.excerpt},{content:withCtx((L,l,f,x)=>{if(l)l(ssrRenderComponent(h,{value:unref(t).blog.body},null,f,x));else return [createVNode(h,{value:unref(t).blog.body},null,8,["value"])]}),_:1},v,p)):a("<!---->");else return [createVNode("div",null,[unref(t)?(openBlock(),createBlock(I,{key:0,"is-search":true,"selected-category":unref(t),voyages:unref(t).voyages,"page-content":unref(c)},null,8,["selected-category","voyages","page-content"])):createCommentVNode("",true)]),unref(t)?.blog?(openBlock(),createBlock(V,{key:0,class:"mt-12",title:unref(t).blog.title,description:unref(t).blog.description,image:unref(t).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":unref(b),"badge-color":unref(D),"reading-time":unref(A),"published-at":unref(t).blog.publishedAt,author:unref(t).blog.author?.name,"author-photo":unref(t).blog.author?.image,"author-role":unref(t).blog.author?.position},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).blog.title),1)]),introduction:withCtx(()=>[createTextVNode(toDisplayString(unref(t).blog.description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role"])):createCommentVNode("",true),unref(t)?.blog?(openBlock(),createBlock(B$1,{key:1,title:unref(t).blog.title,subtitle:unref(t).blog.excerpt},{content:withCtx(()=>[createVNode(h,{value:unref(t).blog.body},null,8,["value"])]),_:1},8,["title","subtitle"])):createCommentVNode("",true)]}),_:1},_));}}},P=F.setup;F.setup=($,i)=>{const r=useSSRContext();return (r.modules||(r.modules=new Set)).add("pages/thematiques/[thematiqueSlug].vue"),P?P($,i):void 0};

export { F as default };
//# sourceMappingURL=_thematiqueSlug_-DaDCRSjk.mjs.map

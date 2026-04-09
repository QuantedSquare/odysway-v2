import { a as ae } from './ContentLayout-CDdzqG3S.mjs';
import { G as Gt } from './SearchField-D9CnF2nN.mjs';
import { w as we } from './BlogHeroSection-Bql1kfK4.mjs';
import { z } from './SectionContainer-DKfgvH0W.mjs';
import { B } from './EnrichedText-COchyxWO.mjs';
import { computed, withAsyncContext, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import Mc from 'lodash';
import { h as Er, a0 as cn, d as bt, u as up, a as Qc, g as Ue } from './server.mjs';
import { K } from './useSeo-CsS5EJ8u.mjs';
import { g } from './structuredData-D7RlK3gb.mjs';
import './SearchHeroSection-Dd8KGmAj.mjs';
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
import './ColorContainer-C-6Z7ufA.mjs';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'vue-dompurify-html';
import '@date-io/dayjs';
import '@mdi/js';
import 'search-insights';
import '@vueuse/core';
import 'groq';
import 'perfect-debounce';
import './HorizontalCarousel-CNMnzhwc.mjs';
import './CustomChevronBtn-Dt0H0OcB.mjs';
import './ThematiqueColCard-BuxHJfBv.mjs';
import './VLazy-X1Hg2eeI.mjs';
import './VDivider-BvWzDmzk.mjs';
import './useTravelDates-CuwXkECi.mjs';
import './NextDepartureCard-BK1ybO5H.mjs';
import './getDateStatus-D9pJy1lO.mjs';
import './VTooltip-C6zmCnYG.mjs';
import './VoyageCard-DEYu6Ww-.mjs';
import './CtaCardSheet-Bl0SoBB6.mjs';
import './sanity-image-nuxt-DuqwncgS.mjs';
import './NuxtImg-qXjnjbL3.mjs';
import './VAutocomplete-GoRVrwxJ.mjs';
import './VSelect-CFMQ_QoL.mjs';
import './VList-AvZPU_ZY.mjs';
import './ssrBoot-755kmDGm.mjs';
import './VListItemTitle-DS3Mch2w.mjs';
import './AvatarImg-uPpuu2qe.mjs';
import '@sanity/client/stega';
import './ssrSlot-D7De7VY4.mjs';
import './slot-Dpt2kD0O.mjs';
import '@portabletext/vue';

const lt=`
  *[_type == "region" && slug.current == $slug][0]{
    _id,
    nom,
    slug,
    meta_description,
    image,
    interjection,
    showOnHome,
    "destinations": *[_type == "destination" && references(^._id)]{
      _id,
      title,
      slug,
      image,
      description,
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
      }
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
  *[_type == "destination" && slug.current == $slug][0]{
    _id,
    title,
    badgeTitle,
    slug,
    metaDescription,
    image,
    interjection,
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
`,ut=`
  *[_type == "destination"]{
    _id,
    title,
    nom,
    slug,
    image,
    metaDescription,
    description
  }
`,O={__name:"[destinationSlug]",__ssrInlineRender:true,async setup(w){let i,s;const{trackViewItemList:B$1}=Er(),{formatVoyagesForGtm:N}=cn(),U=bt(),g$1=computed(()=>U.params.destinationSlug),j=computed(()=>["europe","afrique","asie","amerique-du-sud","amerique-du-nord","amerique-centrale","moyen-orient","france"].includes(g$1.value)),_=up(),{data:t}=([i,s]=withAsyncContext(async()=>Qc(()=>`destination-${g$1.value}`,async()=>{if(j.value){const o=await _.fetch(lt,{slug:g$1.value}),a=Mc.flatMap(o.destinations.map(u=>u.voyages));return {interjection:o.interjection,meta_description:o.meta_description,slug:o.slug,blog:o.blog,title:o.nom,image:o?.image||a[0]?.image,voyages:a}}else return _.fetch(mt,{slug:g$1.value})},"$LsMhCYUYi0")),i=await i,s(),i),{data:H}=([i,s]=withAsyncContext(()=>Qc("destinations-on-content-layout",()=>_.fetch(ut))),i=await i,s(),i),M=computed(()=>({items:H.value?.map(o=>({id:o._id,title:o.title||o.nom,slug:o.slug?.current,image:o.image,type:"destinations",discoveryTitle:o.metaDescription||o.meta_description||o.description||""})).filter(o=>o.image?.asset?._ref),selectedItem:t.value,pageTitle:"Toutes nos destinations",showOnBottom:false})),S=computed(()=>{if(!t.value?.blog)return null;const o=t.value.blog.estimatedReadingTime||0;return Math.max(1,o).toString()}),v=computed(()=>(t.value?.blog?.categories||[])[0]?.title||null),D=computed(()=>v.value?"secondary":null);if(watch(()=>t.value?.voyages,o=>{if(o&&o.length>0){const a=N(o),u=`Destination - ${t.value?.title||t.value?.nom||"Unknown"}`;a&&a.length>0&&B$1({currency:"EUR",items:a,itemListName:u});}},{immediate:true}),t.value){const o=Ue();K({seoData:t.value.seo||t.value.blog?.seo||{},content:t.value,pageType:"article",slug:t.value.slug?.current,structuredData:t.value.blog?g(t.value.blog,`https://odysway.com/destinations/${t.value.slug.current}`,o):null,breadcrumbs:[{name:"Accueil",url:"https://odysway.com"},{name:"Destinations",url:"https://odysway.com/destinations"},{name:t.value.title,url:`https://odysway.com/destinations/${t.value.slug.current}`}]});}return (o,a,u,G)=>{const Q=ae,C=Gt,R=we,k=z,h=B;a(ssrRenderComponent(Q,mergeProps({type:"destinations","selected-destination":unref(t),"display-divider":true,"displayed-data":unref(M)},G),{content:withCtx((ct,r,f,d)=>{if(r)r(`<div${d}>`),r(ssrRenderComponent(C,{"is-search":true,voyages:unref(t).voyages},null,f,d)),r("</div>"),unref(t).blog?r(ssrRenderComponent(R,{class:"mt-12",title:unref(t).blog.title,description:unref(t).blog.description,image:unref(t).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":unref(v),"badge-color":unref(D),"reading-time":unref(S),"published-at":unref(t).blog.publishedAt,author:unref(t).blog.author?.name,"author-photo":unref(t).blog.author?.image,"author-role":unref(t).blog.author?.position},{title:withCtx((I,n,x,T)=>{if(n)n(`${ssrInterpolate(unref(t).blog.title)}`);else return [createTextVNode(toDisplayString(unref(t).blog.title),1)]}),introduction:withCtx((I,n,x,T)=>{if(n)n(`${ssrInterpolate(unref(t).blog.description)}`);else return [createTextVNode(toDisplayString(unref(t).blog.description),1)]}),_:1},f,d)):r("<!---->"),unref(t).blog?r(ssrRenderComponent(k,{title:"categorySanity.blog.title",subtitle:"categorySanity.blog.excerpt"},{content:withCtx((I,n,x,T)=>{if(n)n(ssrRenderComponent(h,{value:unref(t).blog.body},null,x,T));else return [createVNode(h,{value:unref(t).blog.body},null,8,["value"])]}),_:1},f,d)):r("<!---->");else return [createVNode("div",null,[createVNode(C,{"is-search":true,voyages:unref(t).voyages},null,8,["voyages"])]),unref(t).blog?(openBlock(),createBlock(R,{key:0,class:"mt-12",title:unref(t).blog.title,description:unref(t).blog.description,image:unref(t).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":unref(v),"badge-color":unref(D),"reading-time":unref(S),"published-at":unref(t).blog.publishedAt,author:unref(t).blog.author?.name,"author-photo":unref(t).blog.author?.image,"author-role":unref(t).blog.author?.position},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).blog.title),1)]),introduction:withCtx(()=>[createTextVNode(toDisplayString(unref(t).blog.description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role"])):createCommentVNode("",true),unref(t).blog?(openBlock(),createBlock(k,{key:1,title:"categorySanity.blog.title",subtitle:"categorySanity.blog.excerpt"},{content:withCtx(()=>[createVNode(h,{value:unref(t).blog.body},null,8,["value"])]),_:1})):createCommentVNode("",true)]}),_:1},u));}}},F=O.setup;O.setup=(w,i)=>{const s=useSSRContext();return (s.modules||(s.modules=new Set)).add("pages/destinations/[destinationSlug].vue"),F?F(w,i):void 0};

export { O as default };
//# sourceMappingURL=_destinationSlug_-w8sFtXAc.mjs.map

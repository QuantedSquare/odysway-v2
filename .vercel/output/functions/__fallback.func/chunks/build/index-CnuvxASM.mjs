import { a as ae } from './ContentLayout-CDdzqG3S.mjs';
import { G as Gt } from './SearchField-D9CnF2nN.mjs';
import { withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { u as up, a as Qc, k as pt } from './server.mjs';
import { K } from './useSeo-CsS5EJ8u.mjs';
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
import 'lodash';
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

const I=`
{
  "destinations": *[_type == "destination"]{
    _id,
    title,
    slug,
    "description": metaDescription,
    image,
    "voyages": *[_type == "voyage" && references(^._id) && !('custom' in availabilityTypes)]{
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
  "pageContent": *[_type == "page_destinations"][0]{
    ...
  }
}
`,l={__name:"index",__ssrInlineRender:true,async setup(s){let i,o;const d=up(),{data:e}=([i,o]=withAsyncContext(()=>Qc("destinations",()=>d.fetch(I))),i=await i,o(),i),u=computed(()=>({items:e.value?.destinations?.map(t=>({id:t._id,title:t.title,slug:t.slug?.current,image:t.image,type:"destinations",discoveryTitle:t.metaDescription||t.description||""})).filter(t=>t.image?.asset?._ref),selectedItem:null,pageTitle:e.value?.pageContent?.index?.pageTitle||"Toutes nos destinations",showOnBottom:false}));return pt({htmlAttrs:{lang:"fr"}}),e.value?.pageContent&&K({seoData:e.value?.pageContent?.seo,slug:"destinations",content:e.value?.pageContent,pageType:"website"}),(t,c,_,g)=>{const y=ae,n=Gt;c(ssrRenderComponent(y,mergeProps({type:"destinations","display-divider":true,"displayed-data":unref(u),"page-content":unref(e).pageContent},g),{content:withCtx((k,p,f,v)=>{if(p)p(ssrRenderComponent(n,{voyages:unref(e).destinations},null,f,v));else return [createVNode(n,{voyages:unref(e).destinations},null,8,["voyages"])]}),_:1},_));}}},m=l.setup;l.setup=(s,i)=>{const o=useSSRContext();return (o.modules||(o.modules=new Set)).add("pages/destinations/index.vue"),m?m(s,i):void 0};

export { l as default };
//# sourceMappingURL=index-CnuvxASM.mjs.map

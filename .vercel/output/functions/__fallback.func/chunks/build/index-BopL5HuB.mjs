import { a as ae } from './ContentLayout-B_nzSye3.mjs';
import { G as Gt } from './SearchField-C1No64IL.mjs';
import { withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { u as lp, a as Jc, k as Ft } from './server.mjs';
import { K } from './useSeo-CsS5EJ8u.mjs';
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
`,l={__name:"index",__ssrInlineRender:true,async setup(s){let i,o;const d=lp(),{data:e}=([i,o]=withAsyncContext(()=>Jc("destinations",()=>d.fetch(I))),i=await i,o(),i),u=computed(()=>({items:e.value?.destinations?.map(t=>({id:t._id,title:t.title,slug:t.slug?.current,image:t.image,type:"destinations",discoveryTitle:t.metaDescription||t.description||""})).filter(t=>t.image?.asset?._ref),selectedItem:null,pageTitle:e.value?.pageContent?.index?.pageTitle||"Toutes nos destinations",showOnBottom:false}));return Ft({htmlAttrs:{lang:"fr"}}),e.value?.pageContent&&K({seoData:e.value?.pageContent?.seo,slug:"destinations",content:e.value?.pageContent,pageType:"website"}),(t,c,_,g)=>{const y=ae,n=Gt;c(ssrRenderComponent(y,mergeProps({type:"destinations","display-divider":true,"displayed-data":unref(u),"page-content":unref(e).pageContent},g),{content:withCtx((k,p,f,v)=>{if(p)p(ssrRenderComponent(n,{voyages:unref(e).destinations},null,f,v));else return [createVNode(n,{voyages:unref(e).destinations},null,8,["voyages"])]}),_:1},_));}}},m=l.setup;l.setup=(s,i)=>{const o=useSSRContext();return (o.modules||(o.modules=new Set)).add("pages/destinations/index.vue"),m?m(s,i):void 0};

export { l as default };
//# sourceMappingURL=index-BopL5HuB.mjs.map

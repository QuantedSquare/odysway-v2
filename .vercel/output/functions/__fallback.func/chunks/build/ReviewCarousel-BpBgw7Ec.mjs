import { _ as Lu, d as pt, b as gl, u as lp, a as Jc, W as Xc } from './server.mjs';
import { ref, withAsyncContext, computed, watch, nextTick, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { useScroll, useElementSize } from '@vueuse/core';
import Ac from 'lodash';
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
import 'search-insights';
import 'groq';
import 'perfect-debounce';

const I=`
  *[_type == "review" && voyage->slug.current == $voyageSlug]{
    _id,
    author,
    authorAge,
    date,
    photo,
    rating,
    text,
    voyage->{
      _id,
      title,
      slug
    }
  }
`,l={__name:"ReviewCarousel",__ssrInlineRender:true,props:{centerTitle:{type:Boolean,default:false},color:{type:String,default:"secondary"},reviewsSection:{type:Object,required:true}},async setup(u){let t,r;const p=pt(),{mdAndUp:d}=gl(),o=ref(null),m=ref(null);ref(null);const y=lp(),{data:f}=([t,r]=withAsyncContext(()=>Jc("reviews-"+p.params.voyageSlug,()=>y.fetch(I,{voyageSlug:p.params.voyageSlug}),"$LiywC0s0FR")),t=await t,r(),t),n=computed(()=>Ac.uniqBy(f.value,"text")||[]),g=()=>{nextTick(()=>{if(o.value){const e=o.value.$el||o.value;e&&e.scrollWidth>e.clientWidth&&(m.value=e);}});};watch(()=>n.value,e=>{e&&e.length>0&&nextTick();}),watch(()=>o.value,()=>{o.value&&g();}),computed(()=>d.value&&n.value&&n.value.length>3);const{x:T,arrivedState:j}=useScroll(m,{behavior:"smooth"}),{width:i}=useElementSize(o);return computed(()=>i.value&&i.value>=892?400:i?.value||300),(e,S,h,w)=>{S(ssrRenderComponent(Xc,w,{},h));}}},_=l.setup;l.setup=(u,t)=>{const r=useSSRContext();return (r.modules||(r.modules=new Set)).add("components/content/Voyages/ReviewCarousel.vue"),_?_(u,t):void 0};const fe=Lu(l,[["__scopeId","data-v-b3e41997"]]);

export { fe as default };
//# sourceMappingURL=ReviewCarousel-BpBgw7Ec.mjs.map

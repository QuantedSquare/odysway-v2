import { R } from './SimpleHeroSection-BYo6-84Y.mjs';
import { z } from './SectionContainer-DKfgvH0W.mjs';
import { withAsyncContext, mergeProps, withCtx, unref, createTextVNode, toDisplayString, createVNode, renderSlot, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer';
import { _ as Lu, u as up, a as Qc, V as fi, e as Zn, f as lt, aJ as wa, C as fu } from './server.mjs';
import { B } from './EnrichedText-COchyxWO.mjs';
import { x } from './sanity-image-nuxt-DuqwncgS.mjs';
import { a as at } from './composables-Dcwg06ZS.mjs';
import O from 'groq';
import { K as K$1 } from './useSeo-CsS5EJ8u.mjs';
import { u, y } from './structuredData-D7RlK3gb.mjs';
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
import './NuxtImg-qXjnjbL3.mjs';
import './getImageUrl-B94zyPkX.mjs';
import '@sanity/image-url';
import '@sanity/client/stega';

const U={};function ue(l,a,s,y){a(`<div${ssrRenderAttrs(y)}>`),a(ssrRenderComponent(fi,null,{default:withCtx((Q,o,c,T)=>{if(o)o(ssrRenderComponent(Zn,{justify:"center"},{default:withCtx((q,x,C,v)=>{if(x)x(ssrRenderComponent(lt,{cols:"12",class:""},{default:withCtx((_,i,m,$)=>{if(i)ssrRenderSlot(l.$slots,"text",{},null,i,m,$);else return [renderSlot(l.$slots,"text")]}),_:3},C,v));else return [createVNode(lt,{cols:"12",class:""},{default:withCtx(()=>[renderSlot(l.$slots,"text")]),_:3})]}),_:3},c,T));else return [createVNode(Zn,{justify:"center"},{default:withCtx(()=>[createVNode(lt,{cols:"12",class:""},{default:withCtx(()=>[renderSlot(l.$slots,"text")]),_:3})]),_:3})]}),_:3},s)),a("</div>");}const G=U.setup;U.setup=(l,a)=>{const s=useSSRContext();return (s.modules||(s.modules=new Set)).add("components/content/a-propos/TextContainer.vue"),G?G(l,a):void 0};const me=Object.assign(Lu(U,[["ssrRender",ue]]),{__name:"TextContainer"}),W={__name:"ConceptContainer",__ssrInlineRender:true,props:{imageSrc:{type:Object,required:true}},setup(l){const a=at();return (s,y,Q,o)=>{const c=x;y(`<div${ssrRenderAttrs(o)}>`),y(ssrRenderComponent(fi,null,{default:withCtx((T,q,x,C)=>{if(q)q(ssrRenderComponent(Zn,{justify:"center"},{default:withCtx((v,_,i,m)=>{if(_)_(ssrRenderComponent(lt,{cols:"12",class:""},{default:withCtx(($,u,S,w)=>{if(u)ssrRenderSlot(s.$slots,"text",{},null,u,S,w);else return [renderSlot(s.$slots,"text")]}),_:3},i,m)),_(ssrRenderComponent(lt,{class:"d-flex align-center"},{default:withCtx(($,u,S,w)=>{if(u)u(ssrRenderComponent(wa,{size:"x-large",class:"mr-4"},{default:withCtx((z,p,A,I)=>{if(p)p(ssrRenderComponent(c,{"asset-id":l.imageSrc.asset._ref,auto:"format"},{default:withCtx(({src:j},g,D,V)=>{if(g)g(ssrRenderComponent(fu,{src:unref(a)(j,{format:"webp",quality:70,width:640})},null,D,V));else return [createVNode(fu,{src:unref(a)(j,{format:"webp",quality:70,width:640})},null,8,["src"])]}),_:1},A,I));else return [createVNode(c,{"asset-id":l.imageSrc.asset._ref,auto:"format"},{default:withCtx(({src:j})=>[createVNode(fu,{src:unref(a)(j,{format:"webp",quality:70,width:640})},null,8,["src"])]),_:1},8,["asset-id"])]}),_:1},S,w)),ssrRenderSlot(s.$slots,"founder",{},null,u,S,w);else return [createVNode(wa,{size:"x-large",class:"mr-4"},{default:withCtx(()=>[createVNode(c,{"asset-id":l.imageSrc.asset._ref,auto:"format"},{default:withCtx(({src:z})=>[createVNode(fu,{src:unref(a)(z,{format:"webp",quality:70,width:640})},null,8,["src"])]),_:1},8,["asset-id"])]),_:1}),renderSlot(s.$slots,"founder")]}),_:3},i,m));else return [createVNode(lt,{cols:"12",class:""},{default:withCtx(()=>[renderSlot(s.$slots,"text")]),_:3}),createVNode(lt,{class:"d-flex align-center"},{default:withCtx(()=>[createVNode(wa,{size:"x-large",class:"mr-4"},{default:withCtx(()=>[createVNode(c,{"asset-id":l.imageSrc.asset._ref,auto:"format"},{default:withCtx(({src:$})=>[createVNode(fu,{src:unref(a)($,{format:"webp",quality:70,width:640})},null,8,["src"])]),_:1},8,["asset-id"])]),_:1}),renderSlot(s.$slots,"founder")]),_:3})]}),_:3},x,C));else return [createVNode(Zn,{justify:"center"},{default:withCtx(()=>[createVNode(lt,{cols:"12",class:""},{default:withCtx(()=>[renderSlot(s.$slots,"text")]),_:3}),createVNode(lt,{class:"d-flex align-center"},{default:withCtx(()=>[createVNode(wa,{size:"x-large",class:"mr-4"},{default:withCtx(()=>[createVNode(c,{"asset-id":l.imageSrc.asset._ref,auto:"format"},{default:withCtx(({src:v})=>[createVNode(fu,{src:unref(a)(v,{format:"webp",quality:70,width:640})},null,8,["src"])]),_:1},8,["asset-id"])]),_:1}),renderSlot(s.$slots,"founder")]),_:3})]),_:3})]}),_:3},Q)),y("</div>");}}},K=W.setup;W.setup=(l,a)=>{const s=useSSRContext();return (s.modules||(s.modules=new Set)).add("components/content/a-propos/ConceptContainer.vue"),K?K(l,a):void 0};const k={__name:"vision-voyage-odysway",__ssrInlineRender:true,async setup(l){let a,s;const y$1=O`*[_type == "visionVoyageOdysway"][0]{
  ...,
  ceQueOnDefend{
    content[]{
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
    }
  },
  priseDeConscience{
    content[]{
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
    }
  },
  teamSection{
    content[]{
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
    }
  }
}`,Q=up(),{data:o}=([a,s]=withAsyncContext(()=>Qc("vision-voyage-odysway",()=>Q.fetch(y$1))),a=await a,s(),a);if(o.value){const c={title:"Vision Voyage Odysway",description:"Vision Voyage Odysway",image:o.value.heroSection.image};K$1({seoData:o.value?.seo,content:c,pageType:"website",slug:"vision-voyage-odysway",baseUrl:"/vision-voyage-odysway",structuredData:[u({description:o.value?.seo?.metaDescription||c.description}),y()]});}return (c,T,q,x)=>{const C=R,v=z,_=me,i=B,m=W;T(ssrRenderComponent(fi,mergeProps({class:"pt-4 py-md-0 my-0 px-2 px-md-4",fluid:""},x),{default:withCtx(($,u,S,w)=>{if(u)u(ssrRenderComponent(C,{"displayed-img":unref(o).heroSection.image,"title-color":"white"},{title:withCtx((z,p,A,I)=>{if(p)p(`${ssrInterpolate(unref(o).heroSection.title)}`);else return [createTextVNode(toDisplayString(unref(o).heroSection.title),1)]}),_:1},S,w)),u(ssrRenderComponent(v,null,{content:withCtx((z,p,A,I)=>{if(p)p(ssrRenderComponent(_,{class:"focus"},{text:withCtx((j,g,D,V)=>{if(g)g(ssrRenderComponent(i,{class:"focus",value:unref(o).priseDeConscience.content},null,D,V)),g(ssrRenderComponent(m,{"image-src":unref(o).founderSection.image},{founder:withCtx((de,B,fe,_e)=>{if(B)B(`${ssrInterpolate(unref(o).founderSection.caption)}`);else return [createTextVNode(toDisplayString(unref(o).founderSection.caption),1)]}),_:1},D,V)),g(ssrRenderComponent(i,{value:unref(o).ceQueOnDefend.content},null,D,V)),g(ssrRenderComponent(i,{value:unref(o).teamSection.content},null,D,V));else return [createVNode(i,{class:"focus",value:unref(o).priseDeConscience.content},null,8,["value"]),createVNode(m,{"image-src":unref(o).founderSection.image},{founder:withCtx(()=>[createTextVNode(toDisplayString(unref(o).founderSection.caption),1)]),_:1},8,["image-src"]),createVNode(i,{value:unref(o).ceQueOnDefend.content},null,8,["value"]),createVNode(i,{value:unref(o).teamSection.content},null,8,["value"])]}),_:1},A,I));else return [createVNode(_,{class:"focus"},{text:withCtx(()=>[createVNode(i,{class:"focus",value:unref(o).priseDeConscience.content},null,8,["value"]),createVNode(m,{"image-src":unref(o).founderSection.image},{founder:withCtx(()=>[createTextVNode(toDisplayString(unref(o).founderSection.caption),1)]),_:1},8,["image-src"]),createVNode(i,{value:unref(o).ceQueOnDefend.content},null,8,["value"]),createVNode(i,{value:unref(o).teamSection.content},null,8,["value"])]),_:1})]}),_:1},S,w));else return [createVNode(C,{"displayed-img":unref(o).heroSection.image,"title-color":"white"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(o).heroSection.title),1)]),_:1},8,["displayed-img"]),createVNode(v,null,{content:withCtx(()=>[createVNode(_,{class:"focus"},{text:withCtx(()=>[createVNode(i,{class:"focus",value:unref(o).priseDeConscience.content},null,8,["value"]),createVNode(m,{"image-src":unref(o).founderSection.image},{founder:withCtx(()=>[createTextVNode(toDisplayString(unref(o).founderSection.caption),1)]),_:1},8,["image-src"]),createVNode(i,{value:unref(o).ceQueOnDefend.content},null,8,["value"]),createVNode(i,{value:unref(o).teamSection.content},null,8,["value"])]),_:1})]),_:1})]}),_:1},q));}}},L=k.setup;k.setup=(l,a)=>{const s=useSSRContext();return (s.modules||(s.modules=new Set)).add("pages/vision-voyage-odysway.vue"),L?L(l,a):void 0};const it=Lu(k,[["__scopeId","data-v-fd961290"]]);

export { it as default };
//# sourceMappingURL=vision-voyage-odysway-BgniZRtW.mjs.map

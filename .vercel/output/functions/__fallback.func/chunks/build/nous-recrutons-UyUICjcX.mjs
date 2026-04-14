import { J } from './HeroSection-DVb3OnJk.mjs';
import { z } from './SectionContainer-CuQ9WYu3.mjs';
import { B } from './EnrichedText-DuMnQ6-0.mjs';
import { withAsyncContext, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, resolveComponent, mergeProps, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderSlot } from 'vue/server-renderer';
import { $ } from './ssrSlot-D7De7VY4.mjs';
import { T } from './slot-Dpt2kD0O.mjs';
import { mdiCursorDefaultClickOutline } from '@mdi/js';
import { u as lp, a as Jc, b6 as un, e as Zn, f as lt, Y as Fi, bc as ra, n as se } from './server.mjs';
import O from 'groq';
import { K } from './useSeo-CsS5EJ8u.mjs';
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
import '@portabletext/vue';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'vue-dompurify-html';
import '@date-io/dayjs';
import 'lodash';
import 'search-insights';
import '@vueuse/core';
import 'perfect-debounce';

const h={__name:"RecruitementCard",__ssrInlineRender:true,props:{link:{type:String,required:true},color:{type:String,default:"primary"}},setup(a){return (l,u,D,I)=>{const r=resolveComponent("v-btn-secondary");u(ssrRenderComponent(Zn,mergeProps({justify:"start",align:"center"},I),{default:withCtx((E,O,s,k)=>{if(O)O(ssrRenderComponent(lt,{cols:"8.5"},{default:withCtx((q,g,C,v)=>{if(g)g(ssrRenderComponent(Fi,null,{default:withCtx((S,c,i,d)=>{if(c)c(ssrRenderComponent(ra,{class:"text-primary text-wrap"},{default:withCtx((_,t,w,R)=>{if(t)t(`<a${ssrRenderAttr("href",a.link)} target="_blank"${R}>`),ssrRenderSlot(l.$slots,"text",{},null,t,w,R),t("</a>");else return [createVNode("a",{href:a.link,target:"_blank"},[renderSlot(l.$slots,"text")],8,["href"])]}),_:3},i,d));else return [createVNode(ra,{class:"text-primary text-wrap"},{default:withCtx(()=>[createVNode("a",{href:a.link,target:"_blank"},[renderSlot(l.$slots,"text")],8,["href"])]),_:3})]}),_:3},C,v));else return [createVNode(Fi,null,{default:withCtx(()=>[createVNode(ra,{class:"text-primary text-wrap"},{default:withCtx(()=>[createVNode("a",{href:a.link,target:"_blank"},[renderSlot(l.$slots,"text")],8,["href"])]),_:3})]),_:3})]}),_:3},s,k)),O(ssrRenderComponent(lt,{cols:"auto"},{default:withCtx((q,g,C,v)=>{if(g)g(ssrRenderComponent(r,{href:a.link,color:a.color,size:"x-large",class:"text-white",elevation:"10"},{prepend:withCtx((S,c,i,d)=>{if(c)c(ssrRenderComponent(se,{class:"text-white"},{default:withCtx((_,t,w,R)=>{if(t)t(`${ssrInterpolate(unref(mdiCursorDefaultClickOutline))}`);else return [createTextVNode(toDisplayString(unref(mdiCursorDefaultClickOutline)),1)]}),_:1},i,d));else return [createVNode(se,{class:"text-white"},{default:withCtx(()=>[createTextVNode(toDisplayString(unref(mdiCursorDefaultClickOutline)),1)]),_:1})]}),default:withCtx((S,c,i,d)=>{if(c)c(`<div class="text-white"${d}>`),$(l.$slots,"cta",{mdcUnwrap:"p"},null,c,i,d),c("</div>");else return [createVNode("div",{class:"text-white"},[T(l.$slots,"cta",{mdcUnwrap:"p"})])]}),_:3},C,v));else return [createVNode(r,{href:a.link,color:a.color,size:"x-large",class:"text-white",elevation:"10"},{prepend:withCtx(()=>[createVNode(se,{class:"text-white"},{default:withCtx(()=>[createTextVNode(toDisplayString(unref(mdiCursorDefaultClickOutline)),1)]),_:1})]),default:withCtx(()=>[createVNode("div",{class:"text-white"},[T(l.$slots,"cta",{mdcUnwrap:"p"})])]),_:3},8,["href","color"])]}),_:3},s,k));else return [createVNode(lt,{cols:"8.5"},{default:withCtx(()=>[createVNode(Fi,null,{default:withCtx(()=>[createVNode(ra,{class:"text-primary text-wrap"},{default:withCtx(()=>[createVNode("a",{href:a.link,target:"_blank"},[renderSlot(l.$slots,"text")],8,["href"])]),_:3})]),_:3})]),_:3}),createVNode(lt,{cols:"auto"},{default:withCtx(()=>[createVNode(r,{href:a.link,color:a.color,size:"x-large",class:"text-white",elevation:"10"},{prepend:withCtx(()=>[createVNode(se,{class:"text-white"},{default:withCtx(()=>[createTextVNode(toDisplayString(unref(mdiCursorDefaultClickOutline)),1)]),_:1})]),default:withCtx(()=>[createVNode("div",{class:"text-white"},[T(l.$slots,"cta",{mdcUnwrap:"p"})])]),_:3},8,["href","color"])]),_:3})]}),_:3},D));}}},F=h.setup;h.setup=(a,l)=>{const u=useSSRContext();return (u.modules||(u.modules=new Set)).add("components/content/RecruitementCard.vue"),F?F(a,l):void 0};const G={__name:"nous-recrutons",__ssrInlineRender:true,async setup(a){let l,u;const D=lp(),I=O`*[_type == "recruitment" && slug.current == "nous-recrutons"][0]{
  title,
  heroImage,
  content,
  jobOffers[]{
    title,
    location,
    description,
    applicationLink,
    ctaText
  },
  seo
}`,{data:r,status:E}=([l,u]=withAsyncContext(()=>Jc("nous-recrutons",()=>D.fetch(I))),l=await l,u(),l);return r.value&&K({seoData:r.value?.seo,content:r.value,pageType:"website",slug:"nous-recrutons",baseUrl:"/nous-recrutons"}),(O,s,k,q)=>{const g=J,C=z,v=B,S=h;s(`<div${ssrRenderAttrs(q)}>`),unref(r)?.heroImage?s(ssrRenderComponent(g,{"image-src":unref(r).heroImage},{title:withCtx((c,i,d,_)=>{if(i)i(`${ssrInterpolate(unref(r).title)}`);else return [createTextVNode(toDisplayString(unref(r).title),1)]}),_:1},k)):s("<!---->"),unref(r)?s(ssrRenderComponent(C,null,{content:withCtx((c,i,d,_)=>{if(i)unref(r).content?i(ssrRenderComponent(v,{value:unref(r).content},null,d,_)):i("<!---->"),unref(r).jobOffers&&unref(r).jobOffers.length>0?(i(`<div class="mt-8"${_}><!--[-->`),ssrRenderList(unref(r).jobOffers,(t,w)=>{i(ssrRenderComponent(S,{key:w,link:t.applicationLink,class:"mb-4"},{text:withCtx((R,x,J,z)=>{if(x)x(`<p${z}>${ssrInterpolate(t.title)} `),t.location?x(`<span${z}> | ${ssrInterpolate(t.location)}</span>`):x("<!---->"),x("</p>");else return [createVNode("p",null,[createTextVNode(toDisplayString(t.title)+" ",1),t.location?(openBlock(),createBlock("span",{key:0}," | "+toDisplayString(t.location),1)):createCommentVNode("",true)])]}),cta:withCtx((R,x,J,z)=>{if(x)x(`${ssrInterpolate(t.ctaText||"Postuler")}`);else return [createTextVNode(toDisplayString(t.ctaText||"Postuler"),1)]}),_:2},d,_));}),i("<!--]--></div>")):i("<!---->");else return [unref(r).content?(openBlock(),createBlock(v,{key:0,value:unref(r).content},null,8,["value"])):createCommentVNode("",true),unref(r).jobOffers&&unref(r).jobOffers.length>0?(openBlock(),createBlock("div",{key:1,class:"mt-8"},[(openBlock(true),createBlock(Fragment,null,renderList(unref(r).jobOffers,(t,w)=>(openBlock(),createBlock(S,{key:w,link:t.applicationLink,class:"mb-4"},{text:withCtx(()=>[createVNode("p",null,[createTextVNode(toDisplayString(t.title)+" ",1),t.location?(openBlock(),createBlock("span",{key:0}," | "+toDisplayString(t.location),1)):createCommentVNode("",true)])]),cta:withCtx(()=>[createTextVNode(toDisplayString(t.ctaText||"Postuler"),1)]),_:2},1032,["link"]))),128))])):createCommentVNode("",true)]}),_:1},k)):unref(E)==="pending"?(s('<div class="d-flex justify-center align-center">'),s(ssrRenderComponent(un,{indeterminate:""},null,k)),s("</div>")):s("<!---->"),s("</div>");}}},H=G.setup;G.setup=(a,l)=>{const u=useSSRContext();return (u.modules||(u.modules=new Set)).add("pages/nous-recrutons.vue"),H?H(a,l):void 0};

export { G as default };
//# sourceMappingURL=nous-recrutons-UyUICjcX.mjs.map

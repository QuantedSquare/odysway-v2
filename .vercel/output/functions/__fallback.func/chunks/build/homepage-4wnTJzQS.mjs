import { s as se } from './TopBar-C9XybSZ3.mjs';
import { z } from './WhatsAppBtn-CdavfN40.mjs';
import { _ as Lu, b as gl, d as bt, u as up, a as Qc, V as fi, W as Up } from './server.mjs';
import { withAsyncContext, withCtx, renderSlot, unref, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, defineAsyncComponent, useSSRContext } from 'vue';
import { Q } from './AvatarsRowStack-BX9frdDd.mjs';
import { k } from './ctaButton-CoL2yy46.mjs';
import Y from './ColorContainer-C-6Z7ufA.mjs';
import M from './CommonReviewContainer-BEy_jRAF.mjs';
import T$1 from './InfoContainer-BqMlCkP2.mjs';
import { i as ie } from './PartenairesContainer-BDdjtgaG.mjs';
import { ssrRenderComponent, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import O from 'groq';
import { T, x } from './VMain-BSCIiDCd.mjs';
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
import '@mdi/js';
import '@vueuse/core';
import './VAppBar-Bxsx9_WN.mjs';
import './ssrBoot-755kmDGm.mjs';
import './VTooltip-C6zmCnYG.mjs';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'vue-dompurify-html';
import '@date-io/dayjs';
import 'lodash';
import 'search-insights';
import 'perfect-debounce';
import './ssrSlot-D7De7VY4.mjs';
import './slot-Dpt2kD0O.mjs';
import './AvatarImg-uPpuu2qe.mjs';
import './getImageUrl-B94zyPkX.mjs';
import '@sanity/image-url';
import './ExpandableText-DhHAMOzy.mjs';
import './VLazy-X1Hg2eeI.mjs';

const Vt=defineAsyncComponent(()=>import('./ColorContainer-C-6Z7ufA.mjs').then(n=>n.default||n)),zt=defineAsyncComponent(()=>import('./InfoContainer-BqMlCkP2.mjs').then(n=>n.default||n)),Rt=defineAsyncComponent(()=>import('./FaqContainer-DjUyJ4q3.mjs').then(n=>n.default||n)),$t=defineAsyncComponent(()=>import('./TopTravelsTabs-CQX87KCX.mjs').then(n=>n.default||n)),kt=defineAsyncComponent(()=>import('./FooterOdysway-7qnCVMRU.mjs').then(n=>n.default||n)),L={__name:"homepage",__ssrInlineRender:true,async setup(n){let c,d;const{width:q}=gl(),C=bt(),N=up(),et=O`*[_type == "ctas"][0]{
  layoutInfoContainer,
  partenairesSection
}`,ot=O`*[_type == "search"][0]{
  infoContainer
}`,{data:s}=([c,d]=withAsyncContext(async()=>Qc("partenairesTextes",async()=>{try{return await N.fetch(et)||null}catch(m){return console.error("Error fetching partenaires:",m),null}},{server:true})),c=await c,d(),c),{data:p}=([c,d]=withAsyncContext(async()=>Qc("search-content",async()=>{try{return await N.fetch(ot)||null}catch(m){return console.error("Error fetching search content:",m),null}},{server:true})),c=await c,d(),c);return (m,nt,rt,it)=>{const E=se,F=z,T$2=Up,O=Vt,Q$1=zt,W=Q,M$1=k,x$1=Y,$=M,D=Rt,k$1=T$1,g=ie,S=$t,j=kt;nt(ssrRenderComponent(T,it,{default:withCtx((Tt,_,V,v)=>{if(_)_(ssrRenderComponent(E,null,null,V,v)),_(ssrRenderComponent(x,{class:"main-content"},{default:withCtx((at,r,y,u)=>{if(r)ssrRenderSlot(m.$slots,"default",{},null,r,y,u);else return [renderSlot(m.$slots,"default",{},void 0,true)]}),_:3},V,v)),_(`<div class="whatsapp-button mb-16" data-v-2c04f7c6${v}>`),_(ssrRenderComponent(F,null,null,V,v)),_("</div>"),_(ssrRenderComponent(fi,{fluid:unref(q)>600,class:"py-0 my-0 px-2 px-md-9"},{default:withCtx((at,r,y,u)=>{if(r)unref(C).path!=="/"?(r(`<div class="mx-1" data-v-2c04f7c6${u}>`),r(ssrRenderComponent(T$2,null,{},y,u)),unref(C).path!=="/avis-voyageurs"?r(ssrRenderComponent(x$1,{color:"white"},{default:withCtx((lt,z,I,P)=>{if(z)z(ssrRenderComponent($,null,null,I,P));else return [createVNode($)]}),_:1},y,u)):r("<!---->"),r("</div>")):r("<!---->"),r(ssrRenderComponent(D,null,null,y,u)),r(`<div class="mx-1" data-v-2c04f7c6${u}>`),unref(s)?r(ssrRenderComponent(x$1,{color:"secondary","white-text":true},{default:withCtx((lt,z,I,P)=>{if(z)z(ssrRenderComponent(k$1,{"white-text":true},{title:withCtx((G,f,A,B)=>{if(f)f(`${ssrInterpolate(unref(s)?.layoutInfoContainer?.title)}`);else return [createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.title),1)]}),description:withCtx((G,f,A,B)=>{if(f)f(`${ssrInterpolate(unref(s)?.layoutInfoContainer?.subtitle)}`);else return [createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.subtitle),1)]}),bottom:withCtx((G,f,A,B)=>{if(f)f(ssrRenderComponent(g,null,null,A,B));else return [createVNode(g)]}),_:1},I,P));else return [createVNode(k$1,{"white-text":true},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.title),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.subtitle),1)]),bottom:withCtx(()=>[createVNode(g)]),_:1})]}),_:1},y,u)):r("<!---->"),r(ssrRenderComponent(S,null,null,y,u)),r("</div>");else return [unref(C).path!=="/"?(openBlock(),createBlock("div",{key:0,class:"mx-1"},[createVNode(T$2,null,{default:withCtx(()=>[createVNode(O,{color:"grey-light-2"},{default:withCtx(()=>[createVNode(Q$1,null,{top:withCtx(()=>[createVNode(W)]),title:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.title||"Vous hésitez encore ?"),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.description||"Prenez un RDV avec un spécialiste qui vous conseillera selon vos envies."),1)]),bottom:withCtx(()=>[createVNode(M$1,{color:"secondary",link:"/calendly","cta-id":"homepage-layout-rdv-bottom","cta-label":unref(p)?.infoContainer?.buttonText||"Prendre RDV"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.buttonText||"Prendre RDV"),1)]),_:1},8,["cta-label"])]),_:1})]),_:1})]),_:1}),unref(C).path!=="/avis-voyageurs"?(openBlock(),createBlock(x$1,{key:0,color:"white"},{default:withCtx(()=>[createVNode($)]),_:1})):createCommentVNode("",true)])):createCommentVNode("",true),createVNode(D),createVNode("div",{class:"mx-1"},[unref(s)?(openBlock(),createBlock(x$1,{key:0,color:"secondary","white-text":true},{default:withCtx(()=>[createVNode(k$1,{"white-text":true},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.title),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.subtitle),1)]),bottom:withCtx(()=>[createVNode(g)]),_:1})]),_:1})):createCommentVNode("",true),createVNode(S)])]}),_:1},V,v)),_(ssrRenderComponent(j,null,null,V,v));else return [createVNode(E),createVNode(x,{class:"main-content"},{default:withCtx(()=>[renderSlot(m.$slots,"default",{},void 0,true)]),_:3}),createVNode("div",{class:"whatsapp-button mb-16"},[createVNode(F)]),createVNode(fi,{fluid:unref(q)>600,class:"py-0 my-0 px-2 px-md-9"},{default:withCtx(()=>[unref(C).path!=="/"?(openBlock(),createBlock("div",{key:0,class:"mx-1"},[createVNode(T$2,null,{default:withCtx(()=>[createVNode(O,{color:"grey-light-2"},{default:withCtx(()=>[createVNode(Q$1,null,{top:withCtx(()=>[createVNode(W)]),title:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.title||"Vous hésitez encore ?"),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.description||"Prenez un RDV avec un spécialiste qui vous conseillera selon vos envies."),1)]),bottom:withCtx(()=>[createVNode(M$1,{color:"secondary",link:"/calendly","cta-id":"homepage-layout-rdv-bottom","cta-label":unref(p)?.infoContainer?.buttonText||"Prendre RDV"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.buttonText||"Prendre RDV"),1)]),_:1},8,["cta-label"])]),_:1})]),_:1})]),_:1}),unref(C).path!=="/avis-voyageurs"?(openBlock(),createBlock(x$1,{key:0,color:"white"},{default:withCtx(()=>[createVNode($)]),_:1})):createCommentVNode("",true)])):createCommentVNode("",true),createVNode(D),createVNode("div",{class:"mx-1"},[unref(s)?(openBlock(),createBlock(x$1,{key:0,color:"secondary","white-text":true},{default:withCtx(()=>[createVNode(k$1,{"white-text":true},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.title),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.subtitle),1)]),bottom:withCtx(()=>[createVNode(g)]),_:1})]),_:1})):createCommentVNode("",true),createVNode(S)])]),_:1},8,["fluid"]),createVNode(j)]}),_:3},rt));}}},tt=L.setup;L.setup=(n,c)=>{const d=useSSRContext();return (d.modules||(d.modules=new Set)).add("layouts/homepage.vue"),tt?tt(n,c):void 0};const Te=Lu(L,[["__scopeId","data-v-2c04f7c6"]]);

export { Te as default };
//# sourceMappingURL=homepage-4wnTJzQS.mjs.map

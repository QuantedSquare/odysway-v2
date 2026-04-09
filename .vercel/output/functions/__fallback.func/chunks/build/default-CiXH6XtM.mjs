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

const zt=defineAsyncComponent(()=>import('./ColorContainer-C-6Z7ufA.mjs').then(n=>n.default||n)),gt=defineAsyncComponent(()=>import('./InfoContainer-BqMlCkP2.mjs').then(n=>n.default||n)),Rt=defineAsyncComponent(()=>import('./FaqContainer-DjUyJ4q3.mjs').then(n=>n.default||n)),$t=defineAsyncComponent(()=>import('./TopTravelsTabs-CQX87KCX.mjs').then(n=>n.default||n)),kt=defineAsyncComponent(()=>import('./FooterOdysway-7qnCVMRU.mjs').then(n=>n.default||n)),L={__name:"default",__ssrInlineRender:true,async setup(n){let c,d;const{width:q}=gl(),x$1=bt(),N=up(),et=O`*[_type == "ctas"][0]{
  layoutInfoContainer,
  partenairesSection
}`,ot=O`*[_type == "search"][0]{
  infoContainer
}`,{data:s}=([c,d]=withAsyncContext(async()=>Qc("partenairesTextes",async()=>{try{return await N.fetch(et)||null}catch(m){return console.error("Error fetching partenaires:",m),null}},{server:true})),c=await c,d(),c),{data:p}=([c,d]=withAsyncContext(async()=>Qc("search-content",async()=>{try{return await N.fetch(ot)||null}catch(m){return console.error("Error fetching search content:",m),null}},{server:true})),c=await c,d(),c);return (m,nt,rt,at)=>{const j=se,E=z,T$2=Up,F=zt,O=gt,Q$1=Q,W=k,v=Y,$=M,D=Rt,k$1=T$1,V=ie,S=$t,M$1=kt;nt(ssrRenderComponent(T,at,{default:withCtx((Tt,_,z,C)=>{if(_)_(ssrRenderComponent(j,null,null,z,C)),_(ssrRenderComponent(x,{class:"main-content mx-0 mx-md-5 px-1"},{default:withCtx((it,r,y,u)=>{if(r)ssrRenderSlot(m.$slots,"default",{},null,r,y,u);else return [renderSlot(m.$slots,"default",{},void 0,true)]}),_:3},z,C)),_(`<div class="whatsapp-button mb-16" data-v-afcc7b94${C}>`),_(ssrRenderComponent(E,null,null,z,C)),_("</div>"),_(ssrRenderComponent(fi,{fluid:unref(q)>600,class:"py-0 my-0 px-2 px-md-9"},{default:withCtx((it,r,y,u)=>{if(r)unref(x$1).path!=="/"?(r(`<div class="mx-1" data-v-afcc7b94${u}>`),r(ssrRenderComponent(T$2,null,{},y,u)),unref(x$1).path!=="/avis-voyageurs"?r(ssrRenderComponent(v,{color:"white"},{default:withCtx((lt,g,I,P)=>{if(g)g(ssrRenderComponent($,null,null,I,P));else return [createVNode($)]}),_:1},y,u)):r("<!---->"),r("</div>")):r("<!---->"),r(ssrRenderComponent(D,null,null,y,u)),r(`<div class="mx-1" data-v-afcc7b94${u}>`),unref(s)?r(ssrRenderComponent(v,{color:"secondary","white-text":true},{default:withCtx((lt,g,I,P)=>{if(g)g(ssrRenderComponent(k$1,{"white-text":true},{title:withCtx((G,f,A,B)=>{if(f)f(`${ssrInterpolate(unref(s)?.layoutInfoContainer?.title)}`);else return [createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.title),1)]}),description:withCtx((G,f,A,B)=>{if(f)f(`${ssrInterpolate(unref(s)?.layoutInfoContainer?.subtitle)}`);else return [createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.subtitle),1)]}),bottom:withCtx((G,f,A,B)=>{if(f)f(ssrRenderComponent(V,null,null,A,B));else return [createVNode(V)]}),_:1},I,P));else return [createVNode(k$1,{"white-text":true},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.title),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.subtitle),1)]),bottom:withCtx(()=>[createVNode(V)]),_:1})]}),_:1},y,u)):r("<!---->"),r(ssrRenderComponent(S,null,null,y,u)),r("</div>");else return [unref(x$1).path!=="/"?(openBlock(),createBlock("div",{key:0,class:"mx-1"},[createVNode(T$2,null,{default:withCtx(()=>[createVNode(F,{color:"grey-light-2"},{default:withCtx(()=>[createVNode(O,null,{top:withCtx(()=>[createVNode(Q$1)]),title:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.title||"Vous hésitez encore ?"),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.description||"Prenez un RDV avec un spécialiste qui vous conseillera selon vos envies."),1)]),bottom:withCtx(()=>[createVNode(W,{color:"secondary",link:"/rdv-projet-voyage","cta-id":"layout-rdv-bottom","cta-label":unref(p)?.infoContainer?.buttonText||"Prendre RDV"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.buttonText||"Prendre RDV"),1)]),_:1},8,["cta-label"])]),_:1})]),_:1})]),_:1}),unref(x$1).path!=="/avis-voyageurs"?(openBlock(),createBlock(v,{key:0,color:"white"},{default:withCtx(()=>[createVNode($)]),_:1})):createCommentVNode("",true)])):createCommentVNode("",true),createVNode(D),createVNode("div",{class:"mx-1"},[unref(s)?(openBlock(),createBlock(v,{key:0,color:"secondary","white-text":true},{default:withCtx(()=>[createVNode(k$1,{"white-text":true},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.title),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.subtitle),1)]),bottom:withCtx(()=>[createVNode(V)]),_:1})]),_:1})):createCommentVNode("",true),createVNode(S)])]}),_:1},z,C)),_(ssrRenderComponent(M$1,null,null,z,C));else return [createVNode(j),createVNode(x,{class:"main-content mx-0 mx-md-5 px-1"},{default:withCtx(()=>[renderSlot(m.$slots,"default",{},void 0,true)]),_:3}),createVNode("div",{class:"whatsapp-button mb-16"},[createVNode(E)]),createVNode(fi,{fluid:unref(q)>600,class:"py-0 my-0 px-2 px-md-9"},{default:withCtx(()=>[unref(x$1).path!=="/"?(openBlock(),createBlock("div",{key:0,class:"mx-1"},[createVNode(T$2,null,{default:withCtx(()=>[createVNode(F,{color:"grey-light-2"},{default:withCtx(()=>[createVNode(O,null,{top:withCtx(()=>[createVNode(Q$1)]),title:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.title||"Vous hésitez encore ?"),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.description||"Prenez un RDV avec un spécialiste qui vous conseillera selon vos envies."),1)]),bottom:withCtx(()=>[createVNode(W,{color:"secondary",link:"/rdv-projet-voyage","cta-id":"layout-rdv-bottom","cta-label":unref(p)?.infoContainer?.buttonText||"Prendre RDV"},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(p)?.infoContainer?.buttonText||"Prendre RDV"),1)]),_:1},8,["cta-label"])]),_:1})]),_:1})]),_:1}),unref(x$1).path!=="/avis-voyageurs"?(openBlock(),createBlock(v,{key:0,color:"white"},{default:withCtx(()=>[createVNode($)]),_:1})):createCommentVNode("",true)])):createCommentVNode("",true),createVNode(D),createVNode("div",{class:"mx-1"},[unref(s)?(openBlock(),createBlock(v,{key:0,color:"secondary","white-text":true},{default:withCtx(()=>[createVNode(k$1,{"white-text":true},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.title),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(s)?.layoutInfoContainer?.subtitle),1)]),bottom:withCtx(()=>[createVNode(V)]),_:1})]),_:1})):createCommentVNode("",true),createVNode(S)])]),_:1},8,["fluid"]),createVNode(M$1)]}),_:3},rt));}}},tt=L.setup;L.setup=(n,c)=>{const d=useSSRContext();return (d.modules||(d.modules=new Set)).add("layouts/default.vue"),tt?tt(n,c):void 0};const Te=Lu(L,[["__scopeId","data-v-afcc7b94"]]);

export { Te as default };
//# sourceMappingURL=default-CiXH6XtM.mjs.map

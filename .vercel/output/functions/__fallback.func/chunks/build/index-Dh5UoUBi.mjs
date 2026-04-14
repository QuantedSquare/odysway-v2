import { T as T$1 } from './NuxtImg-BG7lA2AK.mjs';
import { withAsyncContext, computed, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createCommentVNode, defineAsyncComponent, mergeProps, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { mdiMagnify } from '@mdi/js';
import Rt from '@sanity/image-url';
import { u as lp, g as qe, h as Er, a as Jc, V as fi, f as lt$1, U as we, W as Xc, _ as Lu, C as fu, X as sa, T as Hy, n as se } from './server.mjs';
import { B } from './EnrichedText-DuMnQ6-0.mjs';
import { i, D as D$1 } from './NewsletterContainer-r-gPNWwh.mjs';
import { R, D } from './useTravelDates-Diphbbs6.mjs';
import { $ } from './ssrSlot-D7De7VY4.mjs';
import { T } from './slot-Dpt2kD0O.mjs';
import { s } from './getImageUrl-B94zyPkX.mjs';
import { k } from './ctaButton-CoL2yy46.mjs';
import { Q } from './AvatarsRowStack-CR3qRFzH.mjs';
import O from 'groq';
import { K } from './useSeo-CsS5EJ8u.mjs';
import { u, y } from './structuredData-D7RlK3gb.mjs';
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
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'vue-dompurify-html';
import '@date-io/dayjs';
import 'lodash';
import 'search-insights';
import '@vueuse/core';
import 'perfect-debounce';
import '@portabletext/vue';
import './NextDepartureCard-Bp4Rhfac.mjs';
import './getDateStatus-COvYSwLT.mjs';
import './VLazy-X1Hg2eeI.mjs';
import './VTooltip-CK5X-xBn.mjs';
import './VDivider-CyZet7le.mjs';
import './VoyageCard-C1Obvr8r.mjs';
import '@sanity/client/stega';

const pe={__name:"HomeHeroSection",__ssrInlineRender:true,props:{image:{type:Object,required:true},imageTest:{type:Object,required:true},imageMobile:{type:Object,required:true},imageMobileTest:{type:Object,required:true},typewriterWords:{type:Array,default:()=>[]},noiseLevel:{type:Number,default:.05},placeholder:{type:String,default:""},placeholderImage:{type:Object,required:true}},setup(d){Hy();const T=d,z=computed(()=>T.typewriterWords||[]),Y=ref("");ref(false),ref(0),ref(100);const R=qe(),te=computed(()=>R.public.environment!=="production"),Z=ref(R.public.environment!=="production"),t=ref(true),E=M=>{const c=Number(M);return Number.isNaN(c)?.1:Math.min(Math.max(c,0),1)},ee=ref(E(T.noiseLevel??.1)),p=Rt({projectId:R.public.sanity.projectId,dataset:R.public.sanity.dataset}),N=computed(()=>Z.value?T.imageTest:T.image),V=computed(()=>Z.value?T.imageMobileTest:T.imageMobile),P=computed(()=>`${N.value?.asset?._ref||""}-${V.value?.asset?._ref||""}`),ae=computed(()=>E(ee.value)),q=(M,c,B,h=75)=>M?.asset?._ref?p.image(M).width(c).height(B).auto("format").quality(h).fit("crop").url():"",ie=computed(()=>q(N.value,1920,1080,70)||q(T.placeholderImage,1920,1080,70)),H=computed(()=>[`${q(V.value,640,360,70)} 640w`,`${q(V.value,960,540,70)} 960w`,`${q(N.value,1280,720,70)} 1280w`,`${q(N.value,1600,900,70)} 1600w`,`${q(N.value,1920,1080,70)} 1920w`,`${q(N.value,2560,1440,70)} 2560w`].filter(Boolean).join(", "));return (M,c,B,h)=>{const _=T$1;c(`<section${ssrRenderAttrs(mergeProps({class:"hero"},h))} data-v-5dcee0a6>`),unref(te)?c(`<div class="hero-dev-controls" data-v-5dcee0a6><button class="hero-dev-btn" type="button" data-v-5dcee0a6>${ssrInterpolate(unref(Z)?"Use main image":"Use test image")}</button><button class="hero-dev-btn" type="button" data-v-5dcee0a6>${ssrInterpolate(unref(t)?"Disable grain":"Enable grain")}</button><button class="hero-dev-btn" type="button" data-v-5dcee0a6> Grain + </button><button class="hero-dev-btn" type="button" data-v-5dcee0a6> Grain - </button><span class="hero-dev-badge" data-v-5dcee0a6>Grain: ${ssrInterpolate((unref(ae)*100).toFixed(0))}%</span></div>`):c("<!---->"),c(`<div class="${ssrRenderClass([{"hero-noise-enabled":unref(t)},"hero-image-bg"])}" style="${ssrRenderStyle({"--hero-noise-opacity":unref(ae)})}" data-v-5dcee0a6>`),unref(ie)?c(ssrRenderComponent(_,{key:unref(P),src:unref(ie),srcset:unref(H),sizes:"(max-width: 600px) 100vw, (max-width: 960px) 90vw, 100vw",alt:"Image principale Hero d'Odysway",class:["hero-image",{"hero-image-dim":unref(t)}],format:"webp",loading:"eager",fetchpriority:"high",width:"1536",height:"900"},null,B)):c("<!---->"),c('</div><div class="hero-content" data-v-5dcee0a6><h1 data-v-5dcee0a6>'),ssrRenderSlot(M.$slots,"title",{},null,c,B),c('</h1><h2 class="custom-hero-subtitle" data-v-5dcee0a6>'),ssrRenderSlot(M.$slots,"subtitle",{},null,c,B),unref(z).length?c(`<span class="${ssrRenderClass([{"typewriter-active":unref(Y).length},"typewriter-text text-center font-italic"])}" data-v-5dcee0a6>${ssrInterpolate(unref(Y))}<span class="cursor" data-v-5dcee0a6>|</span></span>`):c("<!---->"),c('</h2><div class="glass-search-trigger mt-10" role="button" tabindex="0" data-v-5dcee0a6>'),c(ssrRenderComponent(se,{icon:unref(mdiMagnify),color:"primary",size:"24",class:"mr-3 icon-search"},null,B)),c(`<span class="search-placeholder" data-v-5dcee0a6>${ssrInterpolate(d.placeholder)}</span></div></div></section>`);}}},he=pe.setup;pe.setup=(d,T)=>{const z=useSSRContext();return (z.modules||(z.modules=new Set)).add("components/content/HomeHeroSection.vue"),he?he(d,T):void 0};const lt=Lu(pe,[["__scopeId","data-v-5dcee0a6"]]),_e={__name:"IconTextCol",__ssrInlineRender:true,props:{icon:{type:Object,required:true},sideBySide:{type:Boolean,default:true}},setup(d){const T$1=computed(()=>s(d.icon?.asset?._ref));return (z,Y,R,te)=>{Y(ssrRenderComponent(lt$1,mergeProps({cols:"6",class:[d.sideBySide?"d-flex":"","text-h5 text-primary font-weight-bold mt-8"]},te),{default:withCtx((Z,t,E,ee)=>{if(t)unref(T$1)?t(ssrRenderComponent(fu,{src:unref(T$1),width:"40px",height:"40px",class:"mb-4 mr-2"},null,E,ee)):t("<!---->"),$(z.$slots,"text",{mdcUnwrap:"p"},null,t,E,ee);else return [unref(T$1)?(openBlock(),createBlock(fu,{key:0,src:unref(T$1),width:"40px",height:"40px",class:"mb-4 mr-2"},null,8,["src"])):createCommentVNode("",true),T(z.$slots,"text",{mdcUnwrap:"p"})]}),_:3},R));}}},ke=_e.setup;_e.setup=(d,T)=>{const z=useSSRContext();return (z.modules||(z.modules=new Set)).add("components/content/IconTextCol.vue"),ke?ke(d,T):void 0};const it=defineAsyncComponent(()=>import('./ExperienceCarousel-BZNzBRfg.mjs').then(d=>d.default||d)),ot=defineAsyncComponent(()=>import('./ColorContainer-CrUITWCx.mjs').then(d=>d.default||d)),nt=defineAsyncComponent(()=>import('./HorizontalCarousel-DYGVWO59.mjs').then(d=>d.default||d)),st=defineAsyncComponent(()=>import('./CardGrid-CV7pwi8Q.mjs').then(d=>d.default||d)),ct=defineAsyncComponent(()=>import('./TextImageContainer-DdGE0b7u.mjs').then(d=>d.default||d)),ut=defineAsyncComponent(()=>import('./CommonReviewContainer-DbdzaCyM.mjs').then(d=>d.default||d)),mt=defineAsyncComponent(()=>import('./InfoContainer-BqMlCkP2.mjs').then(d=>d.default||d)),Ie={__name:"index",__ssrInlineRender:true,async setup(d){let T,z;const Y=lp(),R$1=qe(),{trackCtaClick:te}=Er(),Z=O`
  *[_type == "homePage"][0]{
    ...,
    contact{
      title,
      description,
      ctaButton{
        text,
        link,
        color
      },
    },
    reviews{
      ctaText,
      title
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
          _ref,
          _id,
          url
        },
        alt
      }
    },
    franceTrips{
      title,
      voyagesFrance[]->{
        _id,
        "slug": slug.current,
        image,
        rating,
        comments,
        title,
        availabilityTypes,
        duration,
        pricing,
        closingDays,
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
    experienceCarousel{
      title,
      experiences[]->{
        _id,
        title,
        slug,
        discoveryTitle,
        showOnHome,
        image
      }
    },
    followDesires{
      title,
      categoriesFollowDesires[]->{
        _id,
        title,
        slug,
        discoveryTitle,
        showOnHome,
        image
      }
    },
    guaranteedDepartures{
      title,
      voyagesGuaranteedDepartures[]->{
        _id,
        "slug": slug.current,
        image,
        rating,
        comments,
        title,
        availabilityTypes,
        duration,
        pricing,
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
      ctaButton{
        text,
        link
      }
    },
    summerTravel{
      title,
      voyagesSummerTravel[]->{
        _id,
        "slug": slug.current,
        image,
        rating,
        comments,
        title,
        availabilityTypes,
        duration,
        pricing,
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
    unforgettableTravels{
      title,
      voyagesUnforgettableTravels[]->{
        _id,
        "slug": slug.current,
        image,
        rating,
        comments,
        title,
        availabilityTypes,
        duration,
        pricing,
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
    }
  }
`,{data:t}=([T,z]=withAsyncContext(()=>Jc("test",()=>Y.fetch(Z))),T=await T,z(),T),E=computed(()=>t.value?[t.value.franceTrips?.voyagesFrance||[],t.value.guaranteedDepartures?.voyagesGuaranteedDepartures||[],t.value.summerTravel?.voyagesSummerTravel||[],t.value.unforgettableTravels?.voyagesUnforgettableTravels||[]].flat().filter(Boolean):[]),ee=computed(()=>[...new Set(E.value.map(V=>V.slug?.current||V.slug).filter(Boolean))]),{datesBySlug:p}=R(ee),N=()=>{const V=t.value?.guaranteedDepartures?.ctaButton?.link||"/prochains-departs";te({ctaId:"prochains-departs-home",ctaLabel:t.value?.guaranteedDepartures?.ctaButton?.text||"Prochains départs",ctaUrl:V}),sa(V);};if(t.value){const V={title:"Odysway - Voyages en Petits Groupes et Expériences Authentiques",description:"Découvrez nos voyages en petits groupes à travers le monde. Expériences authentiques, rencontres locales et aventures inoubliables avec Odysway.",image:t.value.heroSection?.image};K({seoData:t.value.seo,content:V,pageType:"website",slug:"home",baseUrl:"/",structuredData:[u({description:t.value.seo?.metaDescription||V.description,aggregateRating:{ratingValue:"4.9",reviewCount:"156",bestRating:"5"}}),y()]});}return (V,P,ae,q)=>{const ie=lt,H=B,M=it,c=ot,B$1=i,h=nt,_=D,ce=st,ue=ct,oe=_e,W=k,me=Xc,be=D$1,de=ut,ge=mt,ne=Q;P(`<div${ssrRenderAttrs(q)}>`),unref(t)?P(ssrRenderComponent(ie,{image:unref(t).heroSection.image,"placeholder-image":unref(R$1).public.environment==="production"?unref(t).heroSection.image:unref(t).heroSectionTest.image,"image-test":unref(t).heroSectionTest.image,"image-mobile":unref(t).heroSection.imageMobile,"image-mobile-test":unref(t).heroSectionTest.imageMobile,"typewriter-words":unref(R$1).public.environment==="production"?unref(t).heroSection.typewritterWords:unref(t).heroSectionTest.typewritterWords,placeholder:unref(R$1).public.environment==="production"?unref(t).heroSection.placeholder:unref(t).heroSectionTest.placeholder},{title:withCtx((xe,k,O,L)=>{if(k)k(ssrRenderComponent(H,{class:"text-white",value:unref(R$1).public.environment==="production"?unref(t).heroSection.title:unref(t).heroSectionTest.title},null,O,L));else return [createVNode(H,{class:"text-white",value:unref(R$1).public.environment==="production"?unref(t).heroSection.title:unref(t).heroSectionTest.title},null,8,["value"])]}),subtitle:withCtx((xe,k,O,L)=>{if(k)k(ssrRenderComponent(H,{class:"text-white",value:unref(R$1).public.environment==="production"?unref(t).heroSection.subtitle:unref(t).heroSectionTest.subtitle},null,O,L));else return [createVNode(H,{class:"text-white",value:unref(R$1).public.environment==="production"?unref(t).heroSection.subtitle:unref(t).heroSectionTest.subtitle},null,8,["value"])]}),_:1},ae)):P("<!---->"),P(ssrRenderComponent(fi,{fluid:"",class:"mx-0 mx-md-5 px-1"},{default:withCtx((xe,k,O,L)=>{if(k)k(`<section class="py-0 my-0 px-2 px-md-4"${L}>`),unref(t)&&unref(t).experienceCarousel?.experiences?.length>0?k(ssrRenderComponent(M,{"experiences-data":unref(t).experienceCarousel.experiences},{title:withCtx((b,g,C,S)=>{if(g)g(`${ssrInterpolate(unref(t).experienceCarousel.title)}`);else return [createTextVNode(toDisplayString(unref(t).experienceCarousel.title),1)]}),_:1},O,L)):k("<!---->"),k(ssrRenderComponent(c,{color:"soft-blush"},{default:withCtx((b,g,C,S)=>{if(g)g(ssrRenderComponent(B$1,{voyages:unref(t).franceTrips.voyagesFrance,"list-name":unref(t).franceTrips.title},{default:withCtx((y,i,w,x)=>{if(i)i(ssrRenderComponent(h,{"text-color":"primary","slider-name":"home-france-trips"},{title:withCtx((f,u,F,G)=>{if(u)u(`<span style="${ssrRenderStyle({color:"rgba(43, 76, 82, 1)"})}"${G}>${ssrInterpolate(unref(t).franceTrips.title)}</span>`);else return [createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).franceTrips.title),1)]}),"carousel-item":withCtx((f,u,F,G)=>{if(u)u("<!--[-->"),ssrRenderList(unref(t).franceTrips.voyagesFrance,v=>{u(ssrRenderComponent(lt$1,{key:v._id},{default:withCtx((ye,j,K,Q)=>{if(j)j(ssrRenderComponent(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,K,Q));else return [createVNode(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,8,["voyage","dates-by-slug","item-list-name"])]}),_:2},F,G));}),u("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(t).franceTrips.voyagesFrance,v=>(openBlock(),createBlock(lt$1,{key:v._id},{default:withCtx(()=>[createVNode(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]}),_:1},w,x));else return [createVNode(h,{"text-color":"primary","slider-name":"home-france-trips"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).franceTrips.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).franceTrips.voyagesFrance,f=>(openBlock(),createBlock(lt$1,{key:f._id},{default:withCtx(()=>[createVNode(_,{voyage:f,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]}),_:1},C,S));else return [createVNode(B$1,{voyages:unref(t).franceTrips.voyagesFrance,"list-name":unref(t).franceTrips.title},{default:withCtx(()=>[createVNode(h,{"text-color":"primary","slider-name":"home-france-trips"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).franceTrips.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).franceTrips.voyagesFrance,y=>(openBlock(),createBlock(lt$1,{key:y._id},{default:withCtx(()=>[createVNode(_,{voyage:y,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]}),_:1},O,L)),k(ssrRenderComponent(c,{color:"primary"},{default:withCtx((b,g,C,S)=>{if(g)g(ssrRenderComponent(ce,{categories:unref(t).followDesires.categoriesFollowDesires,"promotion-name":unref(t).followDesires.title},{title:withCtx((y,i,w,x)=>{if(i)i(`<h4 class="text-white"${x}>${ssrInterpolate(unref(t).followDesires.title)}</h4>`);else return [createVNode("h4",{class:"text-white"},toDisplayString(unref(t).followDesires.title),1)]}),_:1},C,S));else return [createVNode(ce,{categories:unref(t).followDesires.categoriesFollowDesires,"promotion-name":unref(t).followDesires.title},{title:withCtx(()=>[createVNode("h4",{class:"text-white"},toDisplayString(unref(t).followDesires.title),1)]),_:1},8,["categories","promotion-name"])]}),_:1},O,L)),k(ssrRenderComponent(c,{color:"white"},{default:withCtx((b,g,C,S)=>{if(g)g(ssrRenderComponent(ue,{"display-cta-button":true,"image-desktop-right":true,"image-src":unref(t).travelDifferently.image},{title:withCtx((y,i,w,x)=>{if(i)i(`<span style="${ssrRenderStyle({color:"rgba(43, 76, 82, 1)"})}"${x}>${ssrInterpolate(unref(t).travelDifferently.title)}</span>`);else return [createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).travelDifferently.title),1)]}),"content-cols":withCtx((y,i,w,x)=>{if(i)i("<!--[-->"),ssrRenderList(unref(t).travelDifferently.features,f=>{i(ssrRenderComponent(oe,{key:f._id,icon:f.icon,"side-by-side":false},{text:withCtx((u,F,G,v)=>{if(F)F(`${ssrInterpolate(f.text)}`);else return [createTextVNode(toDisplayString(f.text),1)]}),_:2},w,x));}),i("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(t).travelDifferently.features,f=>(openBlock(),createBlock(oe,{key:f._id,icon:f.icon,"side-by-side":false},{text:withCtx(()=>[createTextVNode(toDisplayString(f.text),1)]),_:2},1032,["icon"]))),128))]}),"cta-button":withCtx((y,i,w,x)=>{if(i)i(ssrRenderComponent(W,{color:unref(t).travelDifferently.ctaButton.color,link:unref(t).travelDifferently.ctaButton.link,"cta-id":"travel-differently-home","cta-label":unref(t).travelDifferently.ctaButton.text},{text:withCtx((f,u,F,G)=>{if(u)u(`${ssrInterpolate(unref(t).travelDifferently.ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).travelDifferently.ctaButton.text),1)]}),_:1},w,x));else return [createVNode(W,{color:unref(t).travelDifferently.ctaButton.color,link:unref(t).travelDifferently.ctaButton.link,"cta-id":"travel-differently-home","cta-label":unref(t).travelDifferently.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).travelDifferently.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]}),_:1},C,S));else return [createVNode(ue,{"display-cta-button":true,"image-desktop-right":true,"image-src":unref(t).travelDifferently.image},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).travelDifferently.title),1)]),"content-cols":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).travelDifferently.features,y=>(openBlock(),createBlock(oe,{key:y._id,icon:y.icon,"side-by-side":false},{text:withCtx(()=>[createTextVNode(toDisplayString(y.text),1)]),_:2},1032,["icon"]))),128))]),"cta-button":withCtx(()=>[createVNode(W,{color:unref(t).travelDifferently.ctaButton.color,link:unref(t).travelDifferently.ctaButton.link,"cta-id":"travel-differently-home","cta-label":unref(t).travelDifferently.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).travelDifferently.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]),_:1},8,["image-src"])]}),_:1},O,L)),k(ssrRenderComponent(c,{color:"grey-light"},{default:withCtx((b,g,C,S)=>{if(g)g(ssrRenderComponent(B$1,{voyages:unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,"list-name":unref(t).guaranteedDepartures.title},{default:withCtx((y,i,w,x)=>{if(i)i(ssrRenderComponent(h,{"text-color":"primary","slider-name":"home-departs-garantis"},{title:withCtx((f,u,F,G)=>{if(u)u(`<span style="${ssrRenderStyle({color:"rgba(43, 76, 82, 1)"})}"${G}>${ssrInterpolate(unref(t).guaranteedDepartures.title)}</span>`);else return [createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).guaranteedDepartures.title),1)]}),"carousel-item":withCtx((f,u,F,G)=>{if(u)u("<!--[-->"),ssrRenderList(unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,v=>{u(ssrRenderComponent(lt$1,{key:v._id},{default:withCtx((ye,j,K,Q)=>{if(j)j(ssrRenderComponent(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,K,Q));else return [createVNode(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,8,["voyage","dates-by-slug","item-list-name"])]}),_:2},F,G));}),u("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,v=>(openBlock(),createBlock(lt$1,{key:v._id},{default:withCtx(()=>[createVNode(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]}),_:1},w,x));else return [createVNode(h,{"text-color":"primary","slider-name":"home-departs-garantis"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).guaranteedDepartures.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,f=>(openBlock(),createBlock(lt$1,{key:f._id},{default:withCtx(()=>[createVNode(_,{voyage:f,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]}),_:1},C,S)),g(`<div class="d-flex justify-center mb-5 mt-8"${S}>`),g(ssrRenderComponent(we,{height:"60",variant:"tonal",class:"bg-primary text-white text-body-1 d-inline font-weight-bold",onClick:N},{default:withCtx((y,i,w,x)=>{if(i)i(`${ssrInterpolate(unref(t).guaranteedDepartures.ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).guaranteedDepartures.ctaButton.text),1)]}),_:1},C,S)),g("</div>");else return [createVNode(B$1,{voyages:unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,"list-name":unref(t).guaranteedDepartures.title},{default:withCtx(()=>[createVNode(h,{"text-color":"primary","slider-name":"home-departs-garantis"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).guaranteedDepartures.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,y=>(openBlock(),createBlock(lt$1,{key:y._id},{default:withCtx(()=>[createVNode(_,{voyage:y,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"]),createVNode("div",{class:"d-flex justify-center mb-5 mt-8"},[createVNode(we,{height:"60",variant:"tonal",class:"bg-primary text-white text-body-1 d-inline font-weight-bold",onClick:N},{default:withCtx(()=>[createTextVNode(toDisplayString(unref(t).guaranteedDepartures.ctaButton.text),1)]),_:1})])]}),_:1},O,L)),k(ssrRenderComponent(c,{color:"white"},{default:withCtx((b,g,C,S)=>{if(g)g(ssrRenderComponent(B$1,{voyages:unref(t).summerTravel.voyagesSummerTravel,"list-name":unref(t).summerTravel.title},{default:withCtx((y,i,w,x)=>{if(i)i(ssrRenderComponent(h,{"text-color":"primary","slider-name":"home-ete"},{title:withCtx((f,u,F,G)=>{if(u)u(`${ssrInterpolate(unref(t).summerTravel.title)}`);else return [createTextVNode(toDisplayString(unref(t).summerTravel.title),1)]}),"carousel-item":withCtx((f,u,F,G)=>{if(u)u("<!--[-->"),ssrRenderList(unref(t).summerTravel.voyagesSummerTravel,v=>{u(ssrRenderComponent(lt$1,{key:v._id},{default:withCtx((ye,j,K,Q)=>{if(j)j(ssrRenderComponent(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,K,Q));else return [createVNode(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,8,["voyage","dates-by-slug","item-list-name"])]}),_:2},F,G));}),u("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(t).summerTravel.voyagesSummerTravel,v=>(openBlock(),createBlock(lt$1,{key:v._id},{default:withCtx(()=>[createVNode(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]}),_:1},w,x));else return [createVNode(h,{"text-color":"primary","slider-name":"home-ete"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).summerTravel.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).summerTravel.voyagesSummerTravel,f=>(openBlock(),createBlock(lt$1,{key:f._id},{default:withCtx(()=>[createVNode(_,{voyage:f,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]}),_:1},C,S));else return [createVNode(B$1,{voyages:unref(t).summerTravel.voyagesSummerTravel,"list-name":unref(t).summerTravel.title},{default:withCtx(()=>[createVNode(h,{"text-color":"primary","slider-name":"home-ete"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).summerTravel.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).summerTravel.voyagesSummerTravel,y=>(openBlock(),createBlock(lt$1,{key:y._id},{default:withCtx(()=>[createVNode(_,{voyage:y,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]}),_:1},O,L)),k(ssrRenderComponent(c,{color:"soft-blush"},{default:withCtx((b,g,C,S)=>{if(g)g(ssrRenderComponent(me,null,{},C,S));else return [createVNode(me,null,{default:withCtx(()=>[unref(t).newsletter?(openBlock(),createBlock(be,{key:0},{title:withCtx(()=>[createVNode(H,{value:unref(t).newsletter.title},null,8,["value"])]),subtitle:withCtx(()=>[createVNode(H,{class:"text-grey",value:unref(t).newsletter.subtitle},null,8,["value"])]),_:1})):createCommentVNode("",true)]),_:1})]}),_:1},O,L)),k(ssrRenderComponent(c,{"white-text":"",color:"primary"},{default:withCtx((b,g,C,S)=>{if(g)g(ssrRenderComponent(B$1,{voyages:unref(t).unforgettableTravels.voyagesUnforgettableTravels,"list-name":unref(t).unforgettableTravels.title},{default:withCtx((y,i,w,x)=>{if(i)i(ssrRenderComponent(h,{"text-color":"white","slider-name":"home-voyages-inoubliables"},{title:withCtx((f,u,F,G)=>{if(u)u(`${ssrInterpolate(unref(t).unforgettableTravels.title)}`);else return [createTextVNode(toDisplayString(unref(t).unforgettableTravels.title),1)]}),"carousel-item":withCtx((f,u,F,G)=>{if(u)u("<!--[-->"),ssrRenderList(unref(t).unforgettableTravels.voyagesUnforgettableTravels,v=>{u(ssrRenderComponent(lt$1,{key:v._id},{default:withCtx((ye,j,K,Q)=>{if(j)j(ssrRenderComponent(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,K,Q));else return [createVNode(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,8,["voyage","dates-by-slug","item-list-name"])]}),_:2},F,G));}),u("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(t).unforgettableTravels.voyagesUnforgettableTravels,v=>(openBlock(),createBlock(lt$1,{key:v._id},{default:withCtx(()=>[createVNode(_,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]}),_:1},w,x));else return [createVNode(h,{"text-color":"white","slider-name":"home-voyages-inoubliables"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).unforgettableTravels.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).unforgettableTravels.voyagesUnforgettableTravels,f=>(openBlock(),createBlock(lt$1,{key:f._id},{default:withCtx(()=>[createVNode(_,{voyage:f,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]}),_:1},C,S));else return [createVNode(B$1,{voyages:unref(t).unforgettableTravels.voyagesUnforgettableTravels,"list-name":unref(t).unforgettableTravels.title},{default:withCtx(()=>[createVNode(h,{"text-color":"white","slider-name":"home-voyages-inoubliables"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).unforgettableTravels.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).unforgettableTravels.voyagesUnforgettableTravels,y=>(openBlock(),createBlock(lt$1,{key:y._id},{default:withCtx(()=>[createVNode(_,{voyage:y,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]}),_:1},O,L)),k(ssrRenderComponent(c,{color:"white"},{default:withCtx((b,g,C,S)=>{if(g)g(ssrRenderComponent(de,null,{title:withCtx((y,i,w,x)=>{if(i)i(`<span style="${ssrRenderStyle({color:"rgba(43, 76, 82, 1)"})}"${x}>${ssrInterpolate(unref(t).reviews.title)}</span>`);else return [createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).reviews.title),1)]}),cta:withCtx((y,i,w,x)=>{if(i)i(`${ssrInterpolate(unref(t).reviews.ctaText)}`);else return [createTextVNode(toDisplayString(unref(t).reviews.ctaText),1)]}),_:1},C,S));else return [createVNode(de,null,{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).reviews.title),1)]),cta:withCtx(()=>[createTextVNode(toDisplayString(unref(t).reviews.ctaText),1)]),_:1})]}),_:1},O,L)),k(ssrRenderComponent(c,{color:"grey-light-2"},{default:withCtx((b,g,C,S)=>{if(g)g(ssrRenderComponent(ge,null,{top:withCtx((y,i,w,x)=>{if(i)i(ssrRenderComponent(ne,null,null,w,x));else return [createVNode(ne)]}),title:withCtx((y,i,w,x)=>{if(i)i(`${ssrInterpolate(unref(t).contact?.title)}`);else return [createTextVNode(toDisplayString(unref(t).contact?.title),1)]}),description:withCtx((y,i,w,x)=>{if(i)i(`${ssrInterpolate(unref(t).contact?.description)}`);else return [createTextVNode(toDisplayString(unref(t).contact?.description),1)]}),bottom:withCtx((y,i,w,x)=>{if(i)i(ssrRenderComponent(W,{color:unref(t).contact?.ctaButton.color,link:unref(t).contact?.ctaButton.link,"cta-id":"contact-rdv-home","cta-label":unref(t).contact?.ctaButton.text},{text:withCtx((f,u,F,G)=>{if(u)u(`${ssrInterpolate(unref(t).contact?.ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).contact?.ctaButton.text),1)]}),_:1},w,x));else return [createVNode(W,{color:unref(t).contact?.ctaButton.color,link:unref(t).contact?.ctaButton.link,"cta-id":"contact-rdv-home","cta-label":unref(t).contact?.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]}),_:1},C,S));else return [createVNode(ge,null,{top:withCtx(()=>[createVNode(ne)]),title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.title),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.description),1)]),bottom:withCtx(()=>[createVNode(W,{color:unref(t).contact?.ctaButton.color,link:unref(t).contact?.ctaButton.link,"cta-id":"contact-rdv-home","cta-label":unref(t).contact?.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]),_:1})]}),_:1},O,L)),k("</section>");else return [createVNode("section",{class:"py-0 my-0 px-2 px-md-4"},[unref(t)&&unref(t).experienceCarousel?.experiences?.length>0?(openBlock(),createBlock(M,{key:0,"experiences-data":unref(t).experienceCarousel.experiences},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).experienceCarousel.title),1)]),_:1},8,["experiences-data"])):createCommentVNode("",true),createVNode(c,{color:"soft-blush"},{default:withCtx(()=>[createVNode(B$1,{voyages:unref(t).franceTrips.voyagesFrance,"list-name":unref(t).franceTrips.title},{default:withCtx(()=>[createVNode(h,{"text-color":"primary","slider-name":"home-france-trips"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).franceTrips.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).franceTrips.voyagesFrance,b=>(openBlock(),createBlock(lt$1,{key:b._id},{default:withCtx(()=>[createVNode(_,{voyage:b,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]),_:1}),createVNode(c,{color:"primary"},{default:withCtx(()=>[createVNode(ce,{categories:unref(t).followDesires.categoriesFollowDesires,"promotion-name":unref(t).followDesires.title},{title:withCtx(()=>[createVNode("h4",{class:"text-white"},toDisplayString(unref(t).followDesires.title),1)]),_:1},8,["categories","promotion-name"])]),_:1}),createVNode(c,{color:"white"},{default:withCtx(()=>[createVNode(ue,{"display-cta-button":true,"image-desktop-right":true,"image-src":unref(t).travelDifferently.image},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).travelDifferently.title),1)]),"content-cols":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).travelDifferently.features,b=>(openBlock(),createBlock(oe,{key:b._id,icon:b.icon,"side-by-side":false},{text:withCtx(()=>[createTextVNode(toDisplayString(b.text),1)]),_:2},1032,["icon"]))),128))]),"cta-button":withCtx(()=>[createVNode(W,{color:unref(t).travelDifferently.ctaButton.color,link:unref(t).travelDifferently.ctaButton.link,"cta-id":"travel-differently-home","cta-label":unref(t).travelDifferently.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).travelDifferently.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]),_:1},8,["image-src"])]),_:1}),createVNode(c,{color:"grey-light"},{default:withCtx(()=>[createVNode(B$1,{voyages:unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,"list-name":unref(t).guaranteedDepartures.title},{default:withCtx(()=>[createVNode(h,{"text-color":"primary","slider-name":"home-departs-garantis"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).guaranteedDepartures.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,b=>(openBlock(),createBlock(lt$1,{key:b._id},{default:withCtx(()=>[createVNode(_,{voyage:b,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"]),createVNode("div",{class:"d-flex justify-center mb-5 mt-8"},[createVNode(we,{height:"60",variant:"tonal",class:"bg-primary text-white text-body-1 d-inline font-weight-bold",onClick:N},{default:withCtx(()=>[createTextVNode(toDisplayString(unref(t).guaranteedDepartures.ctaButton.text),1)]),_:1})])]),_:1}),createVNode(c,{color:"white"},{default:withCtx(()=>[createVNode(B$1,{voyages:unref(t).summerTravel.voyagesSummerTravel,"list-name":unref(t).summerTravel.title},{default:withCtx(()=>[createVNode(h,{"text-color":"primary","slider-name":"home-ete"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).summerTravel.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).summerTravel.voyagesSummerTravel,b=>(openBlock(),createBlock(lt$1,{key:b._id},{default:withCtx(()=>[createVNode(_,{voyage:b,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]),_:1}),createVNode(c,{color:"soft-blush"},{default:withCtx(()=>[createVNode(me,null,{default:withCtx(()=>[unref(t).newsletter?(openBlock(),createBlock(be,{key:0},{title:withCtx(()=>[createVNode(H,{value:unref(t).newsletter.title},null,8,["value"])]),subtitle:withCtx(()=>[createVNode(H,{class:"text-grey",value:unref(t).newsletter.subtitle},null,8,["value"])]),_:1})):createCommentVNode("",true)]),_:1})]),_:1}),createVNode(c,{"white-text":"",color:"primary"},{default:withCtx(()=>[createVNode(B$1,{voyages:unref(t).unforgettableTravels.voyagesUnforgettableTravels,"list-name":unref(t).unforgettableTravels.title},{default:withCtx(()=>[createVNode(h,{"text-color":"white","slider-name":"home-voyages-inoubliables"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).unforgettableTravels.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).unforgettableTravels.voyagesUnforgettableTravels,b=>(openBlock(),createBlock(lt$1,{key:b._id},{default:withCtx(()=>[createVNode(_,{voyage:b,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]),_:1}),createVNode(c,{color:"white"},{default:withCtx(()=>[createVNode(de,null,{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).reviews.title),1)]),cta:withCtx(()=>[createTextVNode(toDisplayString(unref(t).reviews.ctaText),1)]),_:1})]),_:1}),createVNode(c,{color:"grey-light-2"},{default:withCtx(()=>[createVNode(ge,null,{top:withCtx(()=>[createVNode(ne)]),title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.title),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.description),1)]),bottom:withCtx(()=>[createVNode(W,{color:unref(t).contact?.ctaButton.color,link:unref(t).contact?.ctaButton.link,"cta-id":"contact-rdv-home","cta-label":unref(t).contact?.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]),_:1})]),_:1})])]}),_:1},ae)),P("</div>");}}},Se=Ie.setup;Ie.setup=(d,T)=>{const z=useSSRContext();return (z.modules||(z.modules=new Set)).add("pages/index.vue"),Se?Se(d,T):void 0};

export { Ie as default };
//# sourceMappingURL=index-Dh5UoUBi.mjs.map

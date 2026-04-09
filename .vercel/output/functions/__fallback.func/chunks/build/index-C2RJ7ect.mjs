import { J } from './NuxtImg-qXjnjbL3.mjs';
import { withAsyncContext, computed, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createCommentVNode, defineAsyncComponent, mergeProps, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { mdiMagnify } from '@mdi/js';
import At from '@sanity/image-url';
import { u as up, g as Ue, h as Er, a as Qc, V as fi, f as lt$1, U as we, W as Up, _ as Lu, C as fu, X as sa, T as zy, n as se } from './server.mjs';
import { B } from './EnrichedText-COchyxWO.mjs';
import { i, D as D$1 } from './NewsletterContainer-LHXb-Kxf.mjs';
import { R, D } from './useTravelDates-CuwXkECi.mjs';
import { $ } from './ssrSlot-D7De7VY4.mjs';
import { T } from './slot-Dpt2kD0O.mjs';
import { s } from './getImageUrl-B94zyPkX.mjs';
import { k } from './ctaButton-CoL2yy46.mjs';
import { Q } from './AvatarsRowStack-BX9frdDd.mjs';
import O from 'groq';
import { K } from './useSeo-CsS5EJ8u.mjs';
import { u, y } from './structuredData-D7RlK3gb.mjs';
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
import './NextDepartureCard-BK1ybO5H.mjs';
import './getDateStatus-D9pJy1lO.mjs';
import './VLazy-X1Hg2eeI.mjs';
import './VTooltip-C6zmCnYG.mjs';
import './VDivider-BvWzDmzk.mjs';
import './VoyageCard-DEYu6Ww-.mjs';
import '@sanity/client/stega';

const pe={__name:"HomeHeroSection",__ssrInlineRender:true,props:{image:{type:Object,required:true},imageTest:{type:Object,required:true},imageMobile:{type:Object,required:true},imageMobileTest:{type:Object,required:true},typewriterWords:{type:Array,default:()=>[]},noiseLevel:{type:Number,default:.05},placeholder:{type:String,default:""},placeholderImage:{type:Object,required:true}},setup(m){zy();const T=m,z=computed(()=>T.typewriterWords||[]),ee=ref("");ref(false),ref(0),ref(100);const V=Ue(),le=computed(()=>V.public.environment!=="production"),te=ref(V.public.environment!=="production"),t=ref(true),Q=d=>{const x=Number(d);return Number.isNaN(x)?.1:Math.min(Math.max(x,0),1)},ae=ref(Q(T.noiseLevel??.1)),p=At({projectId:V.public.sanity.projectId,dataset:V.public.sanity.dataset}),H=computed(()=>te.value?T.imageTest:T.image),O=computed(()=>te.value?T.imageMobileTest:T.imageMobile),X=computed(()=>`${H.value?.asset?._ref||""}-${O.value?.asset?._ref||""}`),ie=computed(()=>Q(ae.value)),M=(d,x,W,P=75)=>d?.asset?._ref?p.image(d).width(x).height(W).auto("format").quality(P).fit("crop").url():"",re=ref(false),N=computed(()=>re.value?M(H.value,1920,1080,100):""),oe=computed(()=>re.value?[`${M(O.value,640,360,90)} 640w`,`${M(O.value,960,540,90)} 960w`,`${M(H.value,1280,720,90)} 1280w`,`${M(H.value,1600,900,90)} 1600w`,`${M(H.value,1920,1080,90)} 1920w`,`${M(H.value,2560,1440,100)} 2560w`].filter(Boolean).join(", "):""),D=computed(()=>M(T.placeholderImage,1920,1080,100)),G=computed(()=>re.value&&N.value?N.value:D.value),U=computed(()=>re.value&&oe.value?oe.value:"");return (d,x,W,P)=>{const E=J;x(`<section${ssrRenderAttrs(mergeProps({class:"hero"},P))} data-v-fc94d458>`),unref(le)?x(`<div class="hero-dev-controls" data-v-fc94d458><button class="hero-dev-btn" type="button" data-v-fc94d458>${ssrInterpolate(unref(te)?"Use main image":"Use test image")}</button><button class="hero-dev-btn" type="button" data-v-fc94d458>${ssrInterpolate(unref(t)?"Disable grain":"Enable grain")}</button><button class="hero-dev-btn" type="button" data-v-fc94d458> Grain + </button><button class="hero-dev-btn" type="button" data-v-fc94d458> Grain - </button><span class="hero-dev-badge" data-v-fc94d458>Grain: ${ssrInterpolate((unref(ie)*100).toFixed(0))}%</span></div>`):x("<!---->"),x(`<div class="${ssrRenderClass([{"hero-noise-enabled":unref(t)},"hero-image-bg"])}" style="${ssrRenderStyle({"--hero-noise-opacity":unref(ie)})}" data-v-fc94d458>`),unref(G)?x(ssrRenderComponent(E,{key:unref(X),src:unref(G),srcset:unref(U),sizes:"(max-width: 600px) 100vw, (max-width: 960px) 90vw, 100vw",alt:"Image principale Hero d'Odysway",class:["hero-image",{"hero-image-dim":unref(t)}],format:"webp",loading:"eager",preload:{fetchpriority:"high"},fetchpriority:"high",width:"1536",height:"900"},null,W)):x("<!---->"),x('</div><div class="hero-content" data-v-fc94d458><h1 data-v-fc94d458>'),ssrRenderSlot(d.$slots,"title",{},null,x,W),x('</h1><h2 class="custom-hero-subtitle" data-v-fc94d458>'),ssrRenderSlot(d.$slots,"subtitle",{},null,x,W),unref(z).length?x(`<span class="${ssrRenderClass([{"typewriter-active":unref(ee).length},"typewriter-text text-center font-italic"])}" data-v-fc94d458>${ssrInterpolate(unref(ee))}<span class="cursor" data-v-fc94d458>|</span></span>`):x("<!---->"),x('</h2><div class="glass-search-trigger mt-10" role="button" tabindex="0" data-v-fc94d458>'),x(ssrRenderComponent(se,{icon:unref(mdiMagnify),color:"primary",size:"24",class:"mr-3 icon-search"},null,W)),x(`<span class="search-placeholder" data-v-fc94d458>${ssrInterpolate(m.placeholder)}</span></div></div></section>`);}}},De=pe.setup;pe.setup=(m,T)=>{const z=useSSRContext();return (z.modules||(z.modules=new Set)).add("components/content/HomeHeroSection.vue"),De?De(m,T):void 0};const lt=Lu(pe,[["__scopeId","data-v-fc94d458"]]),_e={__name:"IconTextCol",__ssrInlineRender:true,props:{icon:{type:Object,required:true},sideBySide:{type:Boolean,default:true}},setup(m){const T$1=computed(()=>s(m.icon?.asset?._ref));return (z,ee,V,le)=>{ee(ssrRenderComponent(lt$1,mergeProps({cols:"6",class:[m.sideBySide?"d-flex":"","text-h5 text-primary font-weight-bold mt-8"]},le),{default:withCtx((te,t,Q,ae)=>{if(t)unref(T$1)?t(ssrRenderComponent(fu,{src:unref(T$1),width:"40px",height:"40px",class:"mb-4 mr-2"},null,Q,ae)):t("<!---->"),$(z.$slots,"text",{mdcUnwrap:"p"},null,t,Q,ae);else return [unref(T$1)?(openBlock(),createBlock(fu,{key:0,src:unref(T$1),width:"40px",height:"40px",class:"mb-4 mr-2"},null,8,["src"])):createCommentVNode("",true),T(z.$slots,"text",{mdcUnwrap:"p"})]}),_:3},V));}}},ke=_e.setup;_e.setup=(m,T)=>{const z=useSSRContext();return (z.modules||(z.modules=new Set)).add("components/content/IconTextCol.vue"),ke?ke(m,T):void 0};const it=defineAsyncComponent(()=>import('./ExperienceCarousel-LNyxnCOY.mjs').then(m=>m.default||m)),ot=defineAsyncComponent(()=>import('./ColorContainer-C-6Z7ufA.mjs').then(m=>m.default||m)),nt=defineAsyncComponent(()=>import('./HorizontalCarousel-CNMnzhwc.mjs').then(m=>m.default||m)),st=defineAsyncComponent(()=>import('./CardGrid-pUNvyvza.mjs').then(m=>m.default||m)),ct=defineAsyncComponent(()=>import('./TextImageContainer-B3CoubHk.mjs').then(m=>m.default||m)),ut=defineAsyncComponent(()=>import('./CommonReviewContainer-BEy_jRAF.mjs').then(m=>m.default||m)),mt=defineAsyncComponent(()=>import('./InfoContainer-BqMlCkP2.mjs').then(m=>m.default||m)),Ie={__name:"index",__ssrInlineRender:true,async setup(m){let T,z;const ee=up(),V=Ue(),{trackCtaClick:le}=Er(),te=O`
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
`,{data:t}=([T,z]=withAsyncContext(()=>Qc("test",()=>ee.fetch(te))),T=await T,z(),T),Q$1=computed(()=>t.value?[t.value.franceTrips?.voyagesFrance||[],t.value.guaranteedDepartures?.voyagesGuaranteedDepartures||[],t.value.summerTravel?.voyagesSummerTravel||[],t.value.unforgettableTravels?.voyagesUnforgettableTravels||[]].flat().filter(Boolean):[]),ae=computed(()=>[...new Set(Q$1.value.map(O=>O.slug?.current||O.slug).filter(Boolean))]),{datesBySlug:p}=R(ae),H=()=>{const O=t.value?.guaranteedDepartures?.ctaButton?.link||"/prochains-departs";le({ctaId:"prochains-departs-home",ctaLabel:t.value?.guaranteedDepartures?.ctaButton?.text||"Prochains départs",ctaUrl:O}),sa(O);};if(t.value){const O={title:"Odysway - Voyages en Petits Groupes et Expériences Authentiques",description:"Découvrez nos voyages en petits groupes à travers le monde. Expériences authentiques, rencontres locales et aventures inoubliables avec Odysway.",image:t.value.heroSection?.image};K({seoData:t.value.seo,content:O,pageType:"website",slug:"home",baseUrl:"/",structuredData:[u({description:t.value.seo?.metaDescription||O.description,aggregateRating:{ratingValue:"4.9",reviewCount:"156",bestRating:"5"}}),y()]});}return (O,X,ie,M)=>{const re=lt,N=B,oe=it,D$2=ot,G=i,U=nt,d=D,x=st,W=ct,P=_e,E=k,me=Up,be=D$1,de=ut,ge=mt,ce=Q;X(`<div${ssrRenderAttrs(M)}>`),unref(t)?X(ssrRenderComponent(re,{image:unref(t).heroSection.image,"placeholder-image":unref(V).public.environment==="production"?unref(t).heroSection.image:unref(t).heroSectionTest.image,"image-test":unref(t).heroSectionTest.image,"image-mobile":unref(t).heroSection.imageMobile,"image-mobile-test":unref(t).heroSectionTest.imageMobile,"typewriter-words":unref(V).public.environment==="production"?unref(t).heroSection.typewritterWords:unref(t).heroSectionTest.typewritterWords,placeholder:unref(V).public.environment==="production"?unref(t).heroSection.placeholder:unref(t).heroSectionTest.placeholder},{title:withCtx((xe,k,j,L)=>{if(k)k(ssrRenderComponent(N,{class:"text-white",value:unref(V).public.environment==="production"?unref(t).heroSection.title:unref(t).heroSectionTest.title},null,j,L));else return [createVNode(N,{class:"text-white",value:unref(V).public.environment==="production"?unref(t).heroSection.title:unref(t).heroSectionTest.title},null,8,["value"])]}),subtitle:withCtx((xe,k,j,L)=>{if(k)k(ssrRenderComponent(N,{class:"text-white",value:unref(V).public.environment==="production"?unref(t).heroSection.subtitle:unref(t).heroSectionTest.subtitle},null,j,L));else return [createVNode(N,{class:"text-white",value:unref(V).public.environment==="production"?unref(t).heroSection.subtitle:unref(t).heroSectionTest.subtitle},null,8,["value"])]}),_:1},ie)):X("<!---->"),X(ssrRenderComponent(fi,{fluid:"",class:"mx-0 mx-md-5 px-1"},{default:withCtx((xe,k,j,L)=>{if(k)k(`<section class="py-0 my-0 px-2 px-md-4"${L}>`),unref(t)&&unref(t).experienceCarousel?.experiences?.length>0?k(ssrRenderComponent(oe,{"experiences-data":unref(t).experienceCarousel.experiences},{title:withCtx((_,g,B,S)=>{if(g)g(`${ssrInterpolate(unref(t).experienceCarousel.title)}`);else return [createTextVNode(toDisplayString(unref(t).experienceCarousel.title),1)]}),_:1},j,L)):k("<!---->"),k(ssrRenderComponent(D$2,{color:"soft-blush"},{default:withCtx((_,g,B,S)=>{if(g)g(ssrRenderComponent(G,{voyages:unref(t).franceTrips.voyagesFrance,"list-name":unref(t).franceTrips.title},{default:withCtx((y,i,w,b)=>{if(i)i(ssrRenderComponent(U,{"text-color":"primary","slider-name":"home-france-trips"},{title:withCtx((f,c,F,R)=>{if(c)c(`<span style="${ssrRenderStyle({color:"rgba(43, 76, 82, 1)"})}"${R}>${ssrInterpolate(unref(t).franceTrips.title)}</span>`);else return [createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).franceTrips.title),1)]}),"carousel-item":withCtx((f,c,F,R)=>{if(c)c("<!--[-->"),ssrRenderList(unref(t).franceTrips.voyagesFrance,v=>{c(ssrRenderComponent(lt$1,{key:v._id},{default:withCtx((ye,q,J,Y)=>{if(q)q(ssrRenderComponent(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,J,Y));else return [createVNode(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,8,["voyage","dates-by-slug","item-list-name"])]}),_:2},F,R));}),c("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(t).franceTrips.voyagesFrance,v=>(openBlock(),createBlock(lt$1,{key:v._id},{default:withCtx(()=>[createVNode(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]}),_:1},w,b));else return [createVNode(U,{"text-color":"primary","slider-name":"home-france-trips"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).franceTrips.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).franceTrips.voyagesFrance,f=>(openBlock(),createBlock(lt$1,{key:f._id},{default:withCtx(()=>[createVNode(d,{voyage:f,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]}),_:1},B,S));else return [createVNode(G,{voyages:unref(t).franceTrips.voyagesFrance,"list-name":unref(t).franceTrips.title},{default:withCtx(()=>[createVNode(U,{"text-color":"primary","slider-name":"home-france-trips"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).franceTrips.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).franceTrips.voyagesFrance,y=>(openBlock(),createBlock(lt$1,{key:y._id},{default:withCtx(()=>[createVNode(d,{voyage:y,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]}),_:1},j,L)),k(ssrRenderComponent(D$2,{color:"primary"},{default:withCtx((_,g,B,S)=>{if(g)g(ssrRenderComponent(x,{categories:unref(t).followDesires.categoriesFollowDesires,"promotion-name":unref(t).followDesires.title},{title:withCtx((y,i,w,b)=>{if(i)i(`<h4 class="text-white"${b}>${ssrInterpolate(unref(t).followDesires.title)}</h4>`);else return [createVNode("h4",{class:"text-white"},toDisplayString(unref(t).followDesires.title),1)]}),_:1},B,S));else return [createVNode(x,{categories:unref(t).followDesires.categoriesFollowDesires,"promotion-name":unref(t).followDesires.title},{title:withCtx(()=>[createVNode("h4",{class:"text-white"},toDisplayString(unref(t).followDesires.title),1)]),_:1},8,["categories","promotion-name"])]}),_:1},j,L)),k(ssrRenderComponent(D$2,{color:"white"},{default:withCtx((_,g,B,S)=>{if(g)g(ssrRenderComponent(W,{"display-cta-button":true,"image-desktop-right":true,"image-src":unref(t).travelDifferently.image},{title:withCtx((y,i,w,b)=>{if(i)i(`<span style="${ssrRenderStyle({color:"rgba(43, 76, 82, 1)"})}"${b}>${ssrInterpolate(unref(t).travelDifferently.title)}</span>`);else return [createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).travelDifferently.title),1)]}),"content-cols":withCtx((y,i,w,b)=>{if(i)i("<!--[-->"),ssrRenderList(unref(t).travelDifferently.features,f=>{i(ssrRenderComponent(P,{key:f._id,icon:f.icon,"side-by-side":false},{text:withCtx((c,F,R,v)=>{if(F)F(`${ssrInterpolate(f.text)}`);else return [createTextVNode(toDisplayString(f.text),1)]}),_:2},w,b));}),i("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(t).travelDifferently.features,f=>(openBlock(),createBlock(P,{key:f._id,icon:f.icon,"side-by-side":false},{text:withCtx(()=>[createTextVNode(toDisplayString(f.text),1)]),_:2},1032,["icon"]))),128))]}),"cta-button":withCtx((y,i,w,b)=>{if(i)i(ssrRenderComponent(E,{color:unref(t).travelDifferently.ctaButton.color,link:unref(t).travelDifferently.ctaButton.link,"cta-id":"travel-differently-home","cta-label":unref(t).travelDifferently.ctaButton.text},{text:withCtx((f,c,F,R)=>{if(c)c(`${ssrInterpolate(unref(t).travelDifferently.ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).travelDifferently.ctaButton.text),1)]}),_:1},w,b));else return [createVNode(E,{color:unref(t).travelDifferently.ctaButton.color,link:unref(t).travelDifferently.ctaButton.link,"cta-id":"travel-differently-home","cta-label":unref(t).travelDifferently.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).travelDifferently.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]}),_:1},B,S));else return [createVNode(W,{"display-cta-button":true,"image-desktop-right":true,"image-src":unref(t).travelDifferently.image},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).travelDifferently.title),1)]),"content-cols":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).travelDifferently.features,y=>(openBlock(),createBlock(P,{key:y._id,icon:y.icon,"side-by-side":false},{text:withCtx(()=>[createTextVNode(toDisplayString(y.text),1)]),_:2},1032,["icon"]))),128))]),"cta-button":withCtx(()=>[createVNode(E,{color:unref(t).travelDifferently.ctaButton.color,link:unref(t).travelDifferently.ctaButton.link,"cta-id":"travel-differently-home","cta-label":unref(t).travelDifferently.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).travelDifferently.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]),_:1},8,["image-src"])]}),_:1},j,L)),k(ssrRenderComponent(D$2,{color:"grey-light"},{default:withCtx((_,g,B,S)=>{if(g)g(ssrRenderComponent(G,{voyages:unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,"list-name":unref(t).guaranteedDepartures.title},{default:withCtx((y,i,w,b)=>{if(i)i(ssrRenderComponent(U,{"text-color":"primary","slider-name":"home-departs-garantis"},{title:withCtx((f,c,F,R)=>{if(c)c(`<span style="${ssrRenderStyle({color:"rgba(43, 76, 82, 1)"})}"${R}>${ssrInterpolate(unref(t).guaranteedDepartures.title)}</span>`);else return [createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).guaranteedDepartures.title),1)]}),"carousel-item":withCtx((f,c,F,R)=>{if(c)c("<!--[-->"),ssrRenderList(unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,v=>{c(ssrRenderComponent(lt$1,{key:v._id},{default:withCtx((ye,q,J,Y)=>{if(q)q(ssrRenderComponent(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,J,Y));else return [createVNode(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,8,["voyage","dates-by-slug","item-list-name"])]}),_:2},F,R));}),c("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,v=>(openBlock(),createBlock(lt$1,{key:v._id},{default:withCtx(()=>[createVNode(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]}),_:1},w,b));else return [createVNode(U,{"text-color":"primary","slider-name":"home-departs-garantis"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).guaranteedDepartures.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,f=>(openBlock(),createBlock(lt$1,{key:f._id},{default:withCtx(()=>[createVNode(d,{voyage:f,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]}),_:1},B,S)),g(`<div class="d-flex justify-center mb-5 mt-8"${S}>`),g(ssrRenderComponent(we,{height:"60",variant:"tonal",class:"bg-primary text-white text-body-1 d-inline font-weight-bold",onClick:H},{default:withCtx((y,i,w,b)=>{if(i)i(`${ssrInterpolate(unref(t).guaranteedDepartures.ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).guaranteedDepartures.ctaButton.text),1)]}),_:1},B,S)),g("</div>");else return [createVNode(G,{voyages:unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,"list-name":unref(t).guaranteedDepartures.title},{default:withCtx(()=>[createVNode(U,{"text-color":"primary","slider-name":"home-departs-garantis"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).guaranteedDepartures.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,y=>(openBlock(),createBlock(lt$1,{key:y._id},{default:withCtx(()=>[createVNode(d,{voyage:y,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"]),createVNode("div",{class:"d-flex justify-center mb-5 mt-8"},[createVNode(we,{height:"60",variant:"tonal",class:"bg-primary text-white text-body-1 d-inline font-weight-bold",onClick:H},{default:withCtx(()=>[createTextVNode(toDisplayString(unref(t).guaranteedDepartures.ctaButton.text),1)]),_:1})])]}),_:1},j,L)),k(ssrRenderComponent(D$2,{color:"white"},{default:withCtx((_,g,B,S)=>{if(g)g(ssrRenderComponent(G,{voyages:unref(t).summerTravel.voyagesSummerTravel,"list-name":unref(t).summerTravel.title},{default:withCtx((y,i,w,b)=>{if(i)i(ssrRenderComponent(U,{"text-color":"primary","slider-name":"home-ete"},{title:withCtx((f,c,F,R)=>{if(c)c(`${ssrInterpolate(unref(t).summerTravel.title)}`);else return [createTextVNode(toDisplayString(unref(t).summerTravel.title),1)]}),"carousel-item":withCtx((f,c,F,R)=>{if(c)c("<!--[-->"),ssrRenderList(unref(t).summerTravel.voyagesSummerTravel,v=>{c(ssrRenderComponent(lt$1,{key:v._id},{default:withCtx((ye,q,J,Y)=>{if(q)q(ssrRenderComponent(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,J,Y));else return [createVNode(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,8,["voyage","dates-by-slug","item-list-name"])]}),_:2},F,R));}),c("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(t).summerTravel.voyagesSummerTravel,v=>(openBlock(),createBlock(lt$1,{key:v._id},{default:withCtx(()=>[createVNode(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]}),_:1},w,b));else return [createVNode(U,{"text-color":"primary","slider-name":"home-ete"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).summerTravel.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).summerTravel.voyagesSummerTravel,f=>(openBlock(),createBlock(lt$1,{key:f._id},{default:withCtx(()=>[createVNode(d,{voyage:f,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]}),_:1},B,S));else return [createVNode(G,{voyages:unref(t).summerTravel.voyagesSummerTravel,"list-name":unref(t).summerTravel.title},{default:withCtx(()=>[createVNode(U,{"text-color":"primary","slider-name":"home-ete"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).summerTravel.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).summerTravel.voyagesSummerTravel,y=>(openBlock(),createBlock(lt$1,{key:y._id},{default:withCtx(()=>[createVNode(d,{voyage:y,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]}),_:1},j,L)),k(ssrRenderComponent(D$2,{color:"soft-blush"},{default:withCtx((_,g,B,S)=>{if(g)g(ssrRenderComponent(me,null,{},B,S));else return [createVNode(me,null,{default:withCtx(()=>[unref(t).newsletter?(openBlock(),createBlock(be,{key:0},{title:withCtx(()=>[createVNode(N,{value:unref(t).newsletter.title},null,8,["value"])]),subtitle:withCtx(()=>[createVNode(N,{class:"text-grey",value:unref(t).newsletter.subtitle},null,8,["value"])]),_:1})):createCommentVNode("",true)]),_:1})]}),_:1},j,L)),k(ssrRenderComponent(D$2,{"white-text":"",color:"primary"},{default:withCtx((_,g,B,S)=>{if(g)g(ssrRenderComponent(G,{voyages:unref(t).unforgettableTravels.voyagesUnforgettableTravels,"list-name":unref(t).unforgettableTravels.title},{default:withCtx((y,i,w,b)=>{if(i)i(ssrRenderComponent(U,{"text-color":"white","slider-name":"home-voyages-inoubliables"},{title:withCtx((f,c,F,R)=>{if(c)c(`${ssrInterpolate(unref(t).unforgettableTravels.title)}`);else return [createTextVNode(toDisplayString(unref(t).unforgettableTravels.title),1)]}),"carousel-item":withCtx((f,c,F,R)=>{if(c)c("<!--[-->"),ssrRenderList(unref(t).unforgettableTravels.voyagesUnforgettableTravels,v=>{c(ssrRenderComponent(lt$1,{key:v._id},{default:withCtx((ye,q,J,Y)=>{if(q)q(ssrRenderComponent(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,J,Y));else return [createVNode(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,8,["voyage","dates-by-slug","item-list-name"])]}),_:2},F,R));}),c("<!--]-->");else return [(openBlock(true),createBlock(Fragment,null,renderList(unref(t).unforgettableTravels.voyagesUnforgettableTravels,v=>(openBlock(),createBlock(lt$1,{key:v._id},{default:withCtx(()=>[createVNode(d,{voyage:v,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]}),_:1},w,b));else return [createVNode(U,{"text-color":"white","slider-name":"home-voyages-inoubliables"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).unforgettableTravels.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).unforgettableTravels.voyagesUnforgettableTravels,f=>(openBlock(),createBlock(lt$1,{key:f._id},{default:withCtx(()=>[createVNode(d,{voyage:f,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]}),_:1},B,S));else return [createVNode(G,{voyages:unref(t).unforgettableTravels.voyagesUnforgettableTravels,"list-name":unref(t).unforgettableTravels.title},{default:withCtx(()=>[createVNode(U,{"text-color":"white","slider-name":"home-voyages-inoubliables"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).unforgettableTravels.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).unforgettableTravels.voyagesUnforgettableTravels,y=>(openBlock(),createBlock(lt$1,{key:y._id},{default:withCtx(()=>[createVNode(d,{voyage:y,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]}),_:1},j,L)),k(ssrRenderComponent(D$2,{color:"white"},{default:withCtx((_,g,B,S)=>{if(g)g(ssrRenderComponent(de,null,{title:withCtx((y,i,w,b)=>{if(i)i(`<span style="${ssrRenderStyle({color:"rgba(43, 76, 82, 1)"})}"${b}>${ssrInterpolate(unref(t).reviews.title)}</span>`);else return [createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).reviews.title),1)]}),cta:withCtx((y,i,w,b)=>{if(i)i(`${ssrInterpolate(unref(t).reviews.ctaText)}`);else return [createTextVNode(toDisplayString(unref(t).reviews.ctaText),1)]}),_:1},B,S));else return [createVNode(de,null,{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).reviews.title),1)]),cta:withCtx(()=>[createTextVNode(toDisplayString(unref(t).reviews.ctaText),1)]),_:1})]}),_:1},j,L)),k(ssrRenderComponent(D$2,{color:"grey-light-2"},{default:withCtx((_,g,B,S)=>{if(g)g(ssrRenderComponent(ge,null,{top:withCtx((y,i,w,b)=>{if(i)i(ssrRenderComponent(ce,null,null,w,b));else return [createVNode(ce)]}),title:withCtx((y,i,w,b)=>{if(i)i(`${ssrInterpolate(unref(t).contact?.title)}`);else return [createTextVNode(toDisplayString(unref(t).contact?.title),1)]}),description:withCtx((y,i,w,b)=>{if(i)i(`${ssrInterpolate(unref(t).contact?.description)}`);else return [createTextVNode(toDisplayString(unref(t).contact?.description),1)]}),bottom:withCtx((y,i,w,b)=>{if(i)i(ssrRenderComponent(E,{color:unref(t).contact?.ctaButton.color,link:unref(t).contact?.ctaButton.link,"cta-id":"contact-rdv-home","cta-label":unref(t).contact?.ctaButton.text},{text:withCtx((f,c,F,R)=>{if(c)c(`${ssrInterpolate(unref(t).contact?.ctaButton.text)}`);else return [createTextVNode(toDisplayString(unref(t).contact?.ctaButton.text),1)]}),_:1},w,b));else return [createVNode(E,{color:unref(t).contact?.ctaButton.color,link:unref(t).contact?.ctaButton.link,"cta-id":"contact-rdv-home","cta-label":unref(t).contact?.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]}),_:1},B,S));else return [createVNode(ge,null,{top:withCtx(()=>[createVNode(ce)]),title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.title),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.description),1)]),bottom:withCtx(()=>[createVNode(E,{color:unref(t).contact?.ctaButton.color,link:unref(t).contact?.ctaButton.link,"cta-id":"contact-rdv-home","cta-label":unref(t).contact?.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]),_:1})]}),_:1},j,L)),k("</section>");else return [createVNode("section",{class:"py-0 my-0 px-2 px-md-4"},[unref(t)&&unref(t).experienceCarousel?.experiences?.length>0?(openBlock(),createBlock(oe,{key:0,"experiences-data":unref(t).experienceCarousel.experiences},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).experienceCarousel.title),1)]),_:1},8,["experiences-data"])):createCommentVNode("",true),createVNode(D$2,{color:"soft-blush"},{default:withCtx(()=>[createVNode(G,{voyages:unref(t).franceTrips.voyagesFrance,"list-name":unref(t).franceTrips.title},{default:withCtx(()=>[createVNode(U,{"text-color":"primary","slider-name":"home-france-trips"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).franceTrips.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).franceTrips.voyagesFrance,_=>(openBlock(),createBlock(lt$1,{key:_._id},{default:withCtx(()=>[createVNode(d,{voyage:_,"dates-by-slug":unref(p),"item-list-name":unref(t).franceTrips.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]),_:1}),createVNode(D$2,{color:"primary"},{default:withCtx(()=>[createVNode(x,{categories:unref(t).followDesires.categoriesFollowDesires,"promotion-name":unref(t).followDesires.title},{title:withCtx(()=>[createVNode("h4",{class:"text-white"},toDisplayString(unref(t).followDesires.title),1)]),_:1},8,["categories","promotion-name"])]),_:1}),createVNode(D$2,{color:"white"},{default:withCtx(()=>[createVNode(W,{"display-cta-button":true,"image-desktop-right":true,"image-src":unref(t).travelDifferently.image},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).travelDifferently.title),1)]),"content-cols":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).travelDifferently.features,_=>(openBlock(),createBlock(P,{key:_._id,icon:_.icon,"side-by-side":false},{text:withCtx(()=>[createTextVNode(toDisplayString(_.text),1)]),_:2},1032,["icon"]))),128))]),"cta-button":withCtx(()=>[createVNode(E,{color:unref(t).travelDifferently.ctaButton.color,link:unref(t).travelDifferently.ctaButton.link,"cta-id":"travel-differently-home","cta-label":unref(t).travelDifferently.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).travelDifferently.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]),_:1},8,["image-src"])]),_:1}),createVNode(D$2,{color:"grey-light"},{default:withCtx(()=>[createVNode(G,{voyages:unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,"list-name":unref(t).guaranteedDepartures.title},{default:withCtx(()=>[createVNode(U,{"text-color":"primary","slider-name":"home-departs-garantis"},{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).guaranteedDepartures.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).guaranteedDepartures.voyagesGuaranteedDepartures,_=>(openBlock(),createBlock(lt$1,{key:_._id},{default:withCtx(()=>[createVNode(d,{voyage:_,"dates-by-slug":unref(p),"item-list-name":unref(t).guaranteedDepartures.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"]),createVNode("div",{class:"d-flex justify-center mb-5 mt-8"},[createVNode(we,{height:"60",variant:"tonal",class:"bg-primary text-white text-body-1 d-inline font-weight-bold",onClick:H},{default:withCtx(()=>[createTextVNode(toDisplayString(unref(t).guaranteedDepartures.ctaButton.text),1)]),_:1})])]),_:1}),createVNode(D$2,{color:"white"},{default:withCtx(()=>[createVNode(G,{voyages:unref(t).summerTravel.voyagesSummerTravel,"list-name":unref(t).summerTravel.title},{default:withCtx(()=>[createVNode(U,{"text-color":"primary","slider-name":"home-ete"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).summerTravel.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).summerTravel.voyagesSummerTravel,_=>(openBlock(),createBlock(lt$1,{key:_._id},{default:withCtx(()=>[createVNode(d,{voyage:_,"dates-by-slug":unref(p),"item-list-name":unref(t).summerTravel.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]),_:1}),createVNode(D$2,{color:"soft-blush"},{default:withCtx(()=>[createVNode(me,null,{default:withCtx(()=>[unref(t).newsletter?(openBlock(),createBlock(be,{key:0},{title:withCtx(()=>[createVNode(N,{value:unref(t).newsletter.title},null,8,["value"])]),subtitle:withCtx(()=>[createVNode(N,{class:"text-grey",value:unref(t).newsletter.subtitle},null,8,["value"])]),_:1})):createCommentVNode("",true)]),_:1})]),_:1}),createVNode(D$2,{"white-text":"",color:"primary"},{default:withCtx(()=>[createVNode(G,{voyages:unref(t).unforgettableTravels.voyagesUnforgettableTravels,"list-name":unref(t).unforgettableTravels.title},{default:withCtx(()=>[createVNode(U,{"text-color":"white","slider-name":"home-voyages-inoubliables"},{title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).unforgettableTravels.title),1)]),"carousel-item":withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(t).unforgettableTravels.voyagesUnforgettableTravels,_=>(openBlock(),createBlock(lt$1,{key:_._id},{default:withCtx(()=>[createVNode(d,{voyage:_,"dates-by-slug":unref(p),"item-list-name":unref(t).unforgettableTravels.title},null,8,["voyage","dates-by-slug","item-list-name"])]),_:2},1024))),128))]),_:1})]),_:1},8,["voyages","list-name"])]),_:1}),createVNode(D$2,{color:"white"},{default:withCtx(()=>[createVNode(de,null,{title:withCtx(()=>[createVNode("span",{style:{color:"rgba(43, 76, 82, 1)"}},toDisplayString(unref(t).reviews.title),1)]),cta:withCtx(()=>[createTextVNode(toDisplayString(unref(t).reviews.ctaText),1)]),_:1})]),_:1}),createVNode(D$2,{color:"grey-light-2"},{default:withCtx(()=>[createVNode(ge,null,{top:withCtx(()=>[createVNode(ce)]),title:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.title),1)]),description:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.description),1)]),bottom:withCtx(()=>[createVNode(E,{color:unref(t).contact?.ctaButton.color,link:unref(t).contact?.ctaButton.link,"cta-id":"contact-rdv-home","cta-label":unref(t).contact?.ctaButton.text},{text:withCtx(()=>[createTextVNode(toDisplayString(unref(t).contact?.ctaButton.text),1)]),_:1},8,["color","link","cta-label"])]),_:1})]),_:1})])]}),_:1},ie)),X("</div>");}}},Se=Ie.setup;Ie.setup=(m,T)=>{const z=useSSRContext();return (z.modules||(z.modules=new Set)).add("pages/index.vue"),Se?Se(m,T):void 0};

export { Ie as default };
//# sourceMappingURL=index-C2RJ7ect.mjs.map

import { s as se } from './SearchHeroSection-Dd8KGmAj.mjs';
import { Q as Qt, G as Gt } from './SearchField-D9CnF2nN.mjs';
import { computed, ref, withAsyncContext, watch, mergeProps, withCtx, unref, createVNode, toDisplayString, isRef, createTextVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import Mc from 'lodash';
import { o } from './getDateStatus-D9pJy1lO.mjs';
import { _ as Lu, b as gl, h as Er, a0 as cn, k as pt, b8 as vn, d as bt, u as up, a as Qc, V as fi, e as Zn, f as lt, aK as Jn, a1 as gi, U as we } from './server.mjs';
import O from 'groq';
import { H } from './VCheckbox-DhSck0sf.mjs';
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
import './HorizontalCarousel-CNMnzhwc.mjs';
import './CustomChevronBtn-Dt0H0OcB.mjs';
import '@vueuse/core';
import './useTravelDates-CuwXkECi.mjs';
import './NextDepartureCard-BK1ybO5H.mjs';
import '@mdi/js';
import './VLazy-X1Hg2eeI.mjs';
import './VTooltip-C6zmCnYG.mjs';
import './VDivider-BvWzDmzk.mjs';
import './VoyageCard-DEYu6Ww-.mjs';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'vue-dompurify-html';
import '@date-io/dayjs';
import 'search-insights';
import 'perfect-debounce';
import './CtaCardSheet-Bl0SoBB6.mjs';
import './sanity-image-nuxt-DuqwncgS.mjs';
import './NuxtImg-qXjnjbL3.mjs';
import './VAutocomplete-GoRVrwxJ.mjs';
import './VSelect-CFMQ_QoL.mjs';
import './VList-AvZPU_ZY.mjs';
import './ssrBoot-755kmDGm.mjs';
import './VListItemTitle-DS3Mch2w.mjs';

const oe={__name:"index",__ssrInlineRender:true,async setup(ce){let l,y;const{lgAndUp:V}=gl(),{trackSearchBar:de,trackViewItemList:ve}=Er(),{formatVoyagesForGtm:he}=cn();pt({meta:[{name:"html-attrs",content:"lang=fr"},{name:"robots",content:"noindex, follow"},{name:"canonical",content:"https://www.odysway.com/voyages"}]});const ue=vn(),n=bt(),o$1=computed(()=>n.query),d=ref(n.query.confirmed==="true"),F=up(),_e=O`*[_type == "search"][0]{
  oneTrip,
  multipleTrips,
  resetButton,
  image,
  searchHero
}`,{data:g}=([l,y]=withAsyncContext(()=>Qc("search-content-page",()=>F.fetch(_e))),l=await l,y(),l),{data:ie}=Qc("fetchedDestination",()=>{if(n.query.destination){const t=O`*[_type == "destination" && slug.current == $slug][0]{
      title,
      interjection,
      image
    }`;return F.fetch(t,{slug:n.query.destination})}return null},{watch:[o$1],immediate:true});console.log("fetchedDestination",ie.value);const A=t=>t.charAt(0).toUpperCase()+t.slice(1),me=["","Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],j=computed(()=>{if(!o$1.value.from)return "";const t=o$1.value.from.split(",").map(Number).filter(i=>i>0&&i<=12);return t.length===0?"":t.map(i=>me[i]).join(" - ")});function we$1(t,r){return r?t.filter(i=>i.destinations?.some(c=>c.title.includes(r))):t}const Ve=O`*[_type == "search"][0]{
  travelTypes
}`,{data:pe}=([l,y]=withAsyncContext(()=>Qc("travelTypes",()=>F.fetch(Ve))),l=await l,y(),l),fe={GROUP:pe.value?.travelTypes?.group,INDIVIDUAL:pe.value?.travelTypes?.individual};function Te(t,r){if(!r)return t;const c={[fe.GROUP]:m=>m.availabilityTypes?.includes("groupe"),[fe.INDIVIDUAL]:m=>m.availabilityTypes?.includes("privatisation")}[r];return c?t.filter(c):t}function $e(t,r){if(!r)return t;const i=r.split(",").map(Number).filter(_=>_>0&&_<=12);if(i.length===0)return t;const c=["","janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"],m=i.map(_=>c[_]);return t.filter(_=>{const S=_.monthlyAvailability;if(!Array.isArray(S))return  false;const p=S.map(b=>b.replace(/[\u200B-\u200F\uFEFF]/g,""));return m.some(b=>p.includes(b))})}const ke=O`*[_type == "region"]{
  _id,
  nom,
  "slug": slug.current
}`,{data:I}=([l,y]=withAsyncContext(()=>Qc("regions",()=>F.fetch(ke))),l=await l,y(),l),qe=O`*[_type == "destination"]{
  _id,
  title,
  "slug": slug.current,
  isTopDestination,
  regions[]-> {
    nom
  }
}`,{data:Q}=([l,y]=withAsyncContext(()=>Qc("destinations",()=>F.fetch(qe))),l=await l,y(),l),{data:ze}=([l,y]=withAsyncContext(()=>Qc("travels-by-date",()=>$fetch("/api/v1/booking/travels-by-date"))),l=await l,y(),l),{data:Ce}=([l,y]=withAsyncContext(async()=>Qc(`search-${JSON.stringify(n.query)}`,async()=>{let t=null,r=null,i=false,c=false;if(n.query.destination){const b=I.value.find(k=>k.slug===n.query.destination);if(b)i=true,r=b.slug;else if(n.query.destination==="top-destination")i=true,c=true;else {const k=Q.value.find(f=>f.slug===n.query.destination);k&&(t=k.title);}}const m=n.query.travelType||null,_=n.query.from||null,S=O`*[
      _type == "voyage" && (
        !('custom' in availabilityTypes)
      )
    ]|order(orderRank){
      ...,
      _id,
      title,
      "slug": slug.current,
      image,
      rating,
      comments,
      duration,
      pricing,
      availabilityTypes,
      monthlyAvailability,
      destinations[]-> {
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
      }
    }`;let p=await F.fetch(S);if(i){let b=[];if(c)b=Q.value.filter(f=>f.isTopDestination);else {const f=I.value.find(x=>x.slug===r);f&&(b=Q.value.filter(x=>x.regions&&x.regions.some(B=>B.nom===f.nom)));}const k=b.map(f=>f.title);p=p.filter(f=>f.destinations?.some(x=>k.includes(x.title)));}else p=we$1(p,t);return p=Te(p,m),p=$e(p,_),Mc.uniqBy(p,"slug")},{watch:[o$1,I,Q]})),l=await l,y(),l);function De(t,r,i){if(!r||!Array.isArray(i)||i.length===0)return t;const c=new Set;return i.forEach(m=>{if(!Array.isArray(m.dates))return;m.dates.some(S=>o(S)?.status==="confirmed")&&c.add(m.slug);}),t.filter(m=>c.has(m.slug))}const E=computed(()=>{const t=Ce.value||[];return De(t,d.value,ze.value||[])}),T=computed(()=>E.value?.length||0);watch([d],()=>{let t=null;if(n.query.destination){const i=Q.value?.find(c=>c.slug===n.query.destination);if(i)t=i.title;else {const c=I.value?.find(m=>m.slug===n.query.destination);c?t=c.nom:t=A(n.query.destination);}}let r=null;if(n.query.from){const i=n.query.from.split(",").map(Number).filter(c=>c>0&&c<=12);i.length>0&&(r=i.map(c=>me[c]).join(", "));}de({destination:t,typeVoyage:n.query.travelType||null,periode:r,voyageGaranti:d.value});},{deep:true});const K=computed(()=>{let t="Search Results";return n.query.destination&&(t+=` - ${A(n.query.destination)}`),n.query.travelType&&(t+=` - ${n.query.travelType}`),n.query.from&&(t+=` - ${j.value}`),d.value&&(t+=" - Départs garantis"),t}),ye=ref(null);watch(E,t=>{if(t&&t.length>0){const r=t.map(i=>i._id).sort().join(",");if(r!==ye.value){ye.value=r;const i=he(t);i&&i.length>0&&ve({currency:"EUR",items:i,itemListName:K.value});}}},{immediate:true});function M(){de({destination:null,typeVoyage:null,periode:null,voyageGaranti:false}),ue.push({path:"/voyages",query:null});}return watch(d,t=>{const r={...n.query};t?r.confirmed="true":delete r.confirmed,ue.push({path:n.path,query:Object.keys(r).length>0?r:void 0});}),watch(()=>n.query.confirmed,t=>{d.value=t==="true";}),(t,r,i,c)=>{const m=se,_=Gt;r(ssrRenderComponent(fi,mergeProps({class:"py-0 my-0 px-2 px-md-4",fluid:""},c),{default:withCtx((S,p,b,k)=>{if(p)p(ssrRenderComponent(m,{destination:unref(ie),"page-content":unref(g)},{default:withCtx((f,x,B,J)=>{if(x)x(ssrRenderComponent(Qt,null,null,B,J));else return [createVNode(Qt)]}),_:1},b,k)),p(ssrRenderComponent(Zn,{class:"pb-0 pt-4 mt-md-12"},{default:withCtx((f,x,B,J)=>{if(x)x(ssrRenderComponent(lt,{cols:"12",class:"px-4 px-md-12 d-flex ga-2 align-center flex-wrap"},{default:withCtx((se,v,L,z)=>{if(v)v(`<span class="text-primary text-h3 font-weight-bold mr-2 mr-md-5" data-v-1f8ddcbd${z}>${ssrInterpolate(unref(T)<=1?`${unref(T)} ${unref(g)?.oneTrip||"voyage"}`:`${unref(T)}
            ${unref(g)?.multipleTrips||"voyages"}`)}</span><div class="d-flex align-center flex-wrap ga-2" data-v-1f8ddcbd${z}>`),unref(o$1).destination?v(ssrRenderComponent(Jn,{variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:withCtx((q,h,Y,R)=>{if(h)h(`<span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-sm-3 pb-1" data-v-1f8ddcbd${R}>${ssrInterpolate(A(unref(o$1).destination))}</span>`);else return [createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-sm-3 pb-1"},toDisplayString(A(unref(o$1).destination)),1)]}),_:1},L,z)):v("<!---->"),unref(o$1).travelType?v(ssrRenderComponent(Jn,{variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable","onClick:close":q=>t.chip=false},{default:withCtx((q,h,Y,R)=>{if(h)h(`<span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1" data-v-1f8ddcbd${R}>${ssrInterpolate(unref(o$1).travelType)}</span>`);else return [createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},toDisplayString(unref(o$1).travelType),1)]}),_:1},L,z)):v("<!---->"),unref(o$1).from?v(ssrRenderComponent(Jn,{variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:withCtx((q,h,Y,R)=>{if(h)h(`<span class="d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1" data-v-1f8ddcbd${R}>${ssrInterpolate(unref(j))}</span>`);else return [createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},toDisplayString(unref(j)),1)]}),_:1},L,z)):v("<!---->"),v("</div>"),v(ssrRenderComponent(gi,null,null,L,z)),v(`<div class="d-flex justify-end ml-auto align-center ga-3 flex-wrap" data-v-1f8ddcbd${z}>`),v(ssrRenderComponent(H,{modelValue:unref(d),"onUpdate:modelValue":q=>isRef(d)?d.value=q:null,"hide-details":"",color:"primary",density:"compact",label:"Voir tous les départs garantis","content-class":"text-subtitle-2 text-sm-body-1"},{label:withCtx((q,h,Y,R)=>{if(h)h(`<span class="text-subtitle-2 text-sm-body-1" data-v-1f8ddcbd${R}> Voir tous les départs garantis </span>`);else return [createVNode("span",{class:"text-subtitle-2 text-sm-body-1"}," Voir tous les départs garantis ")]}),_:1},L,z)),v(ssrRenderComponent(we,{color:"primary",variant:"outlined",size:"large",class:"text-subtitle-2 text-sm-body-1 reset-btn-size",onClick:M},{default:withCtx((q,h,Y,R)=>{if(h)h(`${ssrInterpolate(unref(g)?.resetButton||"Réinitialiser")}`);else return [createTextVNode(toDisplayString(unref(g)?.resetButton||"Réinitialiser"),1)]}),_:1},L,z)),v("</div>");else return [createVNode("span",{class:"text-primary text-h3 font-weight-bold mr-2 mr-md-5"},toDisplayString(unref(T)<=1?`${unref(T)} ${unref(g)?.oneTrip||"voyage"}`:`${unref(T)}
            ${unref(g)?.multipleTrips||"voyages"}`),1),createVNode("div",{class:"d-flex align-center flex-wrap ga-2"},[unref(o$1).destination?(openBlock(),createBlock(Jn,{key:0,variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:withCtx(()=>[createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-sm-3 pb-1"},toDisplayString(A(unref(o$1).destination)),1)]),_:1},8,["size"])):createCommentVNode("",true),unref(o$1).travelType?(openBlock(),createBlock(Jn,{key:1,variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable","onClick:close":q=>t.chip=false},{default:withCtx(()=>[createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},toDisplayString(unref(o$1).travelType),1)]),_:1},8,["size","onClick:close"])):createCommentVNode("",true),unref(o$1).from?(openBlock(),createBlock(Jn,{key:2,variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:withCtx(()=>[createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},toDisplayString(unref(j)),1)]),_:1},8,["size"])):createCommentVNode("",true)]),createVNode(gi),createVNode("div",{class:"d-flex justify-end ml-auto align-center ga-3 flex-wrap"},[createVNode(H,{modelValue:unref(d),"onUpdate:modelValue":q=>isRef(d)?d.value=q:null,"hide-details":"",color:"primary",density:"compact",label:"Voir tous les départs garantis","content-class":"text-subtitle-2 text-sm-body-1"},{label:withCtx(()=>[createVNode("span",{class:"text-subtitle-2 text-sm-body-1"}," Voir tous les départs garantis ")]),_:1},8,["modelValue","onUpdate:modelValue"]),createVNode(we,{color:"primary",variant:"outlined",size:"large",class:"text-subtitle-2 text-sm-body-1 reset-btn-size",onClick:M},{default:withCtx(()=>[createTextVNode(toDisplayString(unref(g)?.resetButton||"Réinitialiser"),1)]),_:1})])]}),_:1},B,J));else return [createVNode(lt,{cols:"12",class:"px-4 px-md-12 d-flex ga-2 align-center flex-wrap"},{default:withCtx(()=>[createVNode("span",{class:"text-primary text-h3 font-weight-bold mr-2 mr-md-5"},toDisplayString(unref(T)<=1?`${unref(T)} ${unref(g)?.oneTrip||"voyage"}`:`${unref(T)}
            ${unref(g)?.multipleTrips||"voyages"}`),1),createVNode("div",{class:"d-flex align-center flex-wrap ga-2"},[unref(o$1).destination?(openBlock(),createBlock(Jn,{key:0,variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:withCtx(()=>[createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-sm-3 pb-1"},toDisplayString(A(unref(o$1).destination)),1)]),_:1},8,["size"])):createCommentVNode("",true),unref(o$1).travelType?(openBlock(),createBlock(Jn,{key:1,variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable","onClick:close":se=>t.chip=false},{default:withCtx(()=>[createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},toDisplayString(unref(o$1).travelType),1)]),_:1},8,["size","onClick:close"])):createCommentVNode("",true),unref(o$1).from?(openBlock(),createBlock(Jn,{key:2,variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:withCtx(()=>[createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},toDisplayString(unref(j)),1)]),_:1},8,["size"])):createCommentVNode("",true)]),createVNode(gi),createVNode("div",{class:"d-flex justify-end ml-auto align-center ga-3 flex-wrap"},[createVNode(H,{modelValue:unref(d),"onUpdate:modelValue":se=>isRef(d)?d.value=se:null,"hide-details":"",color:"primary",density:"compact",label:"Voir tous les départs garantis","content-class":"text-subtitle-2 text-sm-body-1"},{label:withCtx(()=>[createVNode("span",{class:"text-subtitle-2 text-sm-body-1"}," Voir tous les départs garantis ")]),_:1},8,["modelValue","onUpdate:modelValue"]),createVNode(we,{color:"primary",variant:"outlined",size:"large",class:"text-subtitle-2 text-sm-body-1 reset-btn-size",onClick:M},{default:withCtx(()=>[createTextVNode(toDisplayString(unref(g)?.resetButton||"Réinitialiser"),1)]),_:1})])]),_:1})]}),_:1},b,k)),p(ssrRenderComponent(fi,{class:"py-0 px-0 px-md-8 mt-3",fluid:""},{default:withCtx((f,x,B,J)=>{if(x)x(ssrRenderComponent(_,{voyages:unref(E),"is-search":true,"prefer-confirmed-date":unref(d),"item-list-name":unref(K)},null,B,J));else return [createVNode(_,{voyages:unref(E),"is-search":true,"prefer-confirmed-date":unref(d),"item-list-name":unref(K)},null,8,["voyages","prefer-confirmed-date","item-list-name"])]}),_:1},b,k));else return [createVNode(m,{destination:unref(ie),"page-content":unref(g)},{default:withCtx(()=>[createVNode(Qt)]),_:1},8,["destination","page-content"]),createVNode(Zn,{class:"pb-0 pt-4 mt-md-12"},{default:withCtx(()=>[createVNode(lt,{cols:"12",class:"px-4 px-md-12 d-flex ga-2 align-center flex-wrap"},{default:withCtx(()=>[createVNode("span",{class:"text-primary text-h3 font-weight-bold mr-2 mr-md-5"},toDisplayString(unref(T)<=1?`${unref(T)} ${unref(g)?.oneTrip||"voyage"}`:`${unref(T)}
            ${unref(g)?.multipleTrips||"voyages"}`),1),createVNode("div",{class:"d-flex align-center flex-wrap ga-2"},[unref(o$1).destination?(openBlock(),createBlock(Jn,{key:0,variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:withCtx(()=>[createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-sm-3 pb-1"},toDisplayString(A(unref(o$1).destination)),1)]),_:1},8,["size"])):createCommentVNode("",true),unref(o$1).travelType?(openBlock(),createBlock(Jn,{key:1,variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable","onClick:close":f=>t.chip=false},{default:withCtx(()=>[createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},toDisplayString(unref(o$1).travelType),1)]),_:1},8,["size","onClick:close"])):createCommentVNode("",true),unref(o$1).from?(openBlock(),createBlock(Jn,{key:2,variant:"flat",size:unref(V)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:withCtx(()=>[createVNode("span",{class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},toDisplayString(unref(j)),1)]),_:1},8,["size"])):createCommentVNode("",true)]),createVNode(gi),createVNode("div",{class:"d-flex justify-end ml-auto align-center ga-3 flex-wrap"},[createVNode(H,{modelValue:unref(d),"onUpdate:modelValue":f=>isRef(d)?d.value=f:null,"hide-details":"",color:"primary",density:"compact",label:"Voir tous les départs garantis","content-class":"text-subtitle-2 text-sm-body-1"},{label:withCtx(()=>[createVNode("span",{class:"text-subtitle-2 text-sm-body-1"}," Voir tous les départs garantis ")]),_:1},8,["modelValue","onUpdate:modelValue"]),createVNode(we,{color:"primary",variant:"outlined",size:"large",class:"text-subtitle-2 text-sm-body-1 reset-btn-size",onClick:M},{default:withCtx(()=>[createTextVNode(toDisplayString(unref(g)?.resetButton||"Réinitialiser"),1)]),_:1})])]),_:1})]),_:1}),createVNode(fi,{class:"py-0 px-0 px-md-8 mt-3",fluid:""},{default:withCtx(()=>[createVNode(_,{voyages:unref(E),"is-search":true,"prefer-confirmed-date":unref(d),"item-list-name":unref(K)},null,8,["voyages","prefer-confirmed-date","item-list-name"])]),_:1})]}),_:1},i));}}},be=oe.setup;oe.setup=(ce,l)=>{const y=useSSRContext();return (y.modules||(y.modules=new Set)).add("pages/voyages/index.vue"),be?be(ce,l):void 0};const It=Lu(oe,[["__scopeId","data-v-1f8ddcbd"]]);

export { It as default };
//# sourceMappingURL=index-ChS_dDaD.mjs.map

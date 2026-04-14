import{_ as O}from"./BFZMOqdn.js";import{_ as B,d as R,u as w,r as b,g as T,w as I,a as S,b as A,k as E,P as M,o as n,e as p,f as t,i as r,N as v,h as e,C as _,B as z,m as u,l as k,t as d,n as h,s as f,v as q,V as L,L as Q,ac as F}from"./C_h2DYOn.js";import{V as G}from"./CBC7X1jE.js";import{u as K}from"./DFakivn3.js";import"./D-Vwsrgj.js";import"./B1pha2ri.js";import"./2eRY76U3.js";const U={class:"d-flex align-center justify-center"},H={key:0,class:"text-white text-h3 pa-10 text-shadow"},J={key:0},W={__name:"ConfirmationContainer",async setup(P){let c,m;const s=R(),x=w(),{trackPurchase:i}=Q(),y=b(s.query.isoption==="true"),D=b(s.query.devis==="true"),V=T`*[_type == "voyage" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  image,
  "destinations": destinations[]-> {
    _id,
    title
  },
  "experienceType": experienceType-> {
    _id,
    title
  },
  "categories": categories[]-> {
    _id,
    title
  },
  monthlyAvailability,
  availabilityTypes,
  pricing {
    startingPrice,
    pricePerPerson
  },
  startingPrice,
  promoChildren,
  indivRoomPrice
}`,{data:a,status:$}=([c,m]=I(()=>S(`voyage-${s.query.voyage}`,()=>x.fetch(V,{slug:s.query.voyage}))),c=await c,m(),c),{mdAndUp:N}=A();return E(async()=>{if(s.query.purchase==="true"&&s.query.booked_id&&!y.value){const l=`gtm_tracked_${s.query.booked_id}`;if(!sessionStorage.getItem(l))try{const o=await $fetch(`/api/v1/booking/purchase-data?booked_id=${s.query.booked_id}`);!o.isOption&&o.shouldTrack&&a.value&&(sessionStorage.setItem(l,"1"),i({transactionId:o.transactionId,paymentType:o.paymentType,totalValue:o.totalValue,optinNewsletter:o.optinNewsletter,userData:o.userData,voyage:a.value,dynamicDealValues:o.dynamicDealValues}))}catch(o){console.error("Error tracking purchase:",o)}}!s.query.isoption&&localStorage.getItem("consent")==="granted"&&s.query.purchase==="true"&&setTimeout(()=>{},100)}),(l,g)=>{const o=O,C=M("v-btn-secondary");return n(),p(L,null,{default:t(()=>[r(v,{justify:"center",class:"text-center"},{default:t(()=>[e($)==="success"&&e(a)?(n(),p(_,{key:0,cols:"12",xl:"10"},{default:t(()=>[r(v,{justify:"center",align:"center"},{default:t(()=>[e(a)?(n(),p(_,{key:0,cols:"12"},{default:t(()=>[e(a).image?.asset?(n(),p(o,{key:0,"asset-id":e(a).image.asset._ref,auto:"format"},{default:t(({src:j})=>[r(z,{rounded:"xl",class:"d-flex align-end",src:j,alt:e(a).image.alt||e(a).title,height:e(N)?"348px":"250px",cover:""},{default:t(()=>[u("div",U,[e(a)?(n(),k("h3",H,d(e(a).title),1)):h("",!0)])]),_:1},8,["src","alt","height"])]),_:1},8,["asset-id"])):h("",!0)]),_:1})):h("",!0),r(_,{cols:"12",sm:"6",md:"9"},{default:t(()=>[u("div",null,[e(y)?f(l.$slots,"title_option",{key:0},void 0,!0):f(l.$slots,"title_default",{key:1},void 0,!0)])]),_:3})]),_:3}),r(v,{class:"mt-8"},{default:t(()=>[r(_,{cols:"12"},{default:t(()=>[e(y)?f(l.$slots,"accroche_option",{key:0},void 0,!0):e(D)?f(l.$slots,"accroche_devis",{key:1},void 0,!0):f(l.$slots,"accroche_default",{key:2},void 0,!0)]),_:3})]),_:3}),r(v,{justify:"center"},{default:t(()=>[r(_,{cols:"auto",class:"mt-8"},{default:t(()=>[r(C,{to:"/thematiques",nuxt:"",size:"x-large",class:"text-decoration-none"},{default:t(()=>[...g[0]||(g[0]=[q(" Retour aux voyages ",-1)])]),_:1})]),_:1})]),_:1})]),_:3})):e($)==="pending"?(n(),p(_,{key:1,cols:"12"},{default:t(()=>[r(G,{type:"card"})]),_:1})):(n(),p(_,{key:2,cols:"12",class:"d-flex flex-column justify-center align-center ga-2"},{default:t(()=>[e(a)?(n(),k("h3",J,d(e(a).title),1)):h("",!0),f(l.$slots,"error",{},void 0,!0),r(C,{to:"/",nuxt:"",size:"x-large"},{default:t(()=>[...g[1]||(g[1]=[q(" Retour aux voyages ",-1)])]),_:1})]),_:3}))]),_:3})]),_:3})}}},X=B(W,[["__scopeId","data-v-ad48d4e4"]]),Y={key:1,class:"d-flex justify-center align-center"},ne={__name:"confirmation",async setup(P){let c,m;const s=w(),x=T`*[_type == "confirmation" && slug.current == "confirmation"][0]{
  titleOption,
  titleDefault,
  titleError,
  errorMessage,
  accrocheOption,
  accrocheDefault,
  accrocheDevis
}`,{data:i,status:y}=([c,m]=I(()=>S("confirmation-page",()=>s.fetch(x))),c=await c,m(),c);return K({seoData:{robotsIndex:!1,robotsFollow:!1}}),(D,V)=>{const a=X;return n(),k("div",null,[e(i)&&e(y)==="success"?(n(),p(a,{key:0},{title_option:t(()=>[u("h1",null,d(e(i).titleOption),1)]),title_default:t(()=>[u("h1",null,d(e(i).titleDefault),1)]),error:t(()=>[u("h1",null,d(e(i).titleError),1),u("p",null,d(e(i).errorMessage),1)]),accroche_option:t(()=>[u("p",null,d(e(i).accrocheOption),1)]),accroche_default:t(()=>[u("p",null,d(e(i).accrocheDefault),1)]),accroche_devis:t(()=>[u("p",null,d(e(i).accrocheDevis),1)]),_:1})):e(y)==="pending"?(n(),k("div",Y,[r(F,{indeterminate:""})])):h("",!0)])}}};export{ne as default};

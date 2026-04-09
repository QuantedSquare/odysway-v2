import{_ as ce}from"./DHkiWKsE.js";import{_ as de,a as me}from"./B3OUA3mF.js";import{_ as pe,b as fe,N as ye,aj as ge,d as he,r as M,u as ve,g as q,w as V,a as h,P as C,e as S,f as p,V as K,an as _e,c as D,o as B,i as g,h as r,O as xe,D as be,m as v,t as N,$ as z,p as I,a1 as Te,a9 as qe,H as Ve,x as we,M as De,ak as Ne}from"./BL9fbG64.js";import{g as Ae}from"./D9pJy1lO.js";import{V as ke}from"./CA1PVuNM.js";import"./DQN8drov.js";import"./D2y-zQ2J.js";import"./rK2S_7Sw.js";import"./BG69C3vn.js";import"./BLZOjkac.js";import"./CUzVmzla.js";import"./XJK7mQDn.js";import"./bzvY4d47.js";import"./CrvLZNZ-.js";import"./C5rMqzIG.js";import"./BDat7HJs.js";import"./CqdWF_o8.js";import"./U5S_1qbW.js";import"./CtKYGlKH.js";import"./CEE8k1hT.js";import"./BijPqpoI.js";import"./DWX7X6Ub.js";import"./CqMooMqM.js";const Ce={class:"text-primary text-h3 font-weight-bold mr-2 mr-md-5"},Se={class:"d-flex align-center flex-wrap ga-2"},Be={class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-sm-3 pb-1"},Fe={class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},$e={class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},Re={class:"d-flex justify-end ml-auto align-center ga-3 flex-wrap"},je={__name:"index",async setup(ze){let s,l;const{lgAndUp:F}=fe(),{trackSearchBar:L,trackViewItemList:Y}=De(),{formatVoyagesForGtm:X}=Ne();ye({meta:[{name:"html-attrs",content:"lang=fr"},{name:"robots",content:"noindex, follow"},{name:"canonical",content:"https://www.odysway.com/voyages"}]});const U=ge(),i=he(),f=D(()=>i.query),c=M(i.query.confirmed==="true"),_=ve(),Z=q`*[_type == "search"][0]{
  oneTrip,
  multipleTrips,
  resetButton,
  image,
  searchHero
}`,{data:A}=([s,l]=V(()=>h("search-content-page",()=>_.fetch(Z))),s=await s,l(),s),{data:G}=h("fetchedDestination",()=>{if(i.query.destination){const e=q`*[_type == "destination" && slug.current == $slug][0]{
      title,
      interjection,
      image
    }`;return _.fetch(e,{slug:i.query.destination})}return null},{watch:[f],immediate:!0});console.log("fetchedDestination",G.value);const $=e=>e.charAt(0).toUpperCase()+e.slice(1),O=["","Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],Q=D(()=>{if(!f.value.from)return"";const e=f.value.from.split(",").map(Number).filter(a=>a>0&&a<=12);return e.length===0?"":e.map(a=>O[a]).join(" - ")});function W(e,t){return t?e.filter(a=>a.destinations?.some(n=>n.title.includes(t))):e}const ee=q`*[_type == "search"][0]{
  travelTypes
}`,{data:E}=([s,l]=V(()=>h("travelTypes",()=>_.fetch(ee))),s=await s,l(),s),H={GROUP:E.value?.travelTypes?.group,INDIVIDUAL:E.value?.travelTypes?.individual};function te(e,t){if(!t)return e;const n={[H.GROUP]:o=>o.availabilityTypes?.includes("groupe"),[H.INDIVIDUAL]:o=>o.availabilityTypes?.includes("privatisation")}[t];return n?e.filter(n):e}function ae(e,t){if(!t)return e;const a=t.split(",").map(Number).filter(y=>y>0&&y<=12);if(a.length===0)return e;const n=["","janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"],o=a.map(y=>n[y]);return e.filter(y=>{const x=y.monthlyAvailability;if(!Array.isArray(x))return!1;const u=x.map(d=>d.replace(/[\u200B-\u200F\uFEFF]/g,""));return o.some(d=>u.includes(d))})}const ie=q`*[_type == "region"]{
  _id,
  nom,
  "slug": slug.current
}`,{data:k}=([s,l]=V(()=>h("regions",()=>_.fetch(ie))),s=await s,l(),s),se=q`*[_type == "destination"]{
  _id,
  title,
  "slug": slug.current,
  isTopDestination,
  regions[]-> {
    nom
  }
}`,{data:w}=([s,l]=V(()=>h("destinations",()=>_.fetch(se))),s=await s,l(),s),{data:ne}=([s,l]=V(()=>h("travels-by-date",()=>$fetch("/api/v1/booking/travels-by-date"))),s=await s,l(),s),{data:re}=([s,l]=V(async()=>h(`search-${JSON.stringify(i.query)}`,async()=>{let e=null,t=null,a=!1,n=!1;if(i.query.destination){const d=k.value.find(b=>b.slug===i.query.destination);if(d)a=!0,t=d.slug;else if(i.query.destination==="top-destination")a=!0,n=!0;else{const b=w.value.find(m=>m.slug===i.query.destination);b&&(e=b.title)}}const o=i.query.travelType||null,y=i.query.from||null,x=q`*[
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
    }`;let u=await _.fetch(x);if(a){let d=[];if(n)d=w.value.filter(m=>m.isTopDestination);else{const m=k.value.find(T=>T.slug===t);m&&(d=w.value.filter(T=>T.regions&&T.regions.some(ue=>ue.nom===m.nom)))}const b=d.map(m=>m.title);u=u.filter(m=>m.destinations?.some(T=>b.includes(T.title)))}else u=W(u,e);return u=te(u,o),u=ae(u,y),_e.uniqBy(u,"slug")},{watch:[f,k,w]})),s=await s,l(),s);function oe(e,t,a){if(!t||!Array.isArray(a)||a.length===0)return e;const n=new Set;return a.forEach(o=>{if(!Array.isArray(o.dates))return;o.dates.some(x=>Ae(x)?.status==="confirmed")&&n.add(o.slug)}),e.filter(o=>n.has(o.slug))}const R=D(()=>{const e=re.value||[];return oe(e,c.value,ne.value||[])}),j=D(()=>R.value?.length||0);C([c],()=>{let e=null;if(i.query.destination){const a=w.value?.find(n=>n.slug===i.query.destination);if(a)e=a.title;else{const n=k.value?.find(o=>o.slug===i.query.destination);n?e=n.nom:e=$(i.query.destination)}}let t=null;if(i.query.from){const a=i.query.from.split(",").map(Number).filter(n=>n>0&&n<=12);a.length>0&&(t=a.map(n=>O[n]).join(", "))}L({destination:e,typeVoyage:i.query.travelType||null,periode:t,voyageGaranti:c.value})},{deep:!0});const J=D(()=>{let e="Search Results";return i.query.destination&&(e+=` - ${$(i.query.destination)}`),i.query.travelType&&(e+=` - ${i.query.travelType}`),i.query.from&&(e+=` - ${Q.value}`),c.value&&(e+=" - Départs garantis"),e}),P=M(null);C(R,e=>{if(e&&e.length>0){const t=e.map(a=>a._id).sort().join(",");if(t!==P.value){P.value=t;const a=X(e);a&&a.length>0&&Y({currency:"EUR",items:a,itemListName:J.value})}}},{immediate:!0});function le(){L({destination:null,typeVoyage:null,periode:null,voyageGaranti:!1}),U.push({path:"/voyages",query:null})}return C(c,e=>{const t={...i.query};e?t.confirmed="true":delete t.confirmed,U.push({path:i.path,query:Object.keys(t).length>0?t:void 0})}),C(()=>i.query.confirmed,e=>{c.value=e==="true"}),(e,t)=>{const a=ce,n=me;return B(),S(K,{class:"py-0 my-0 px-2 px-md-4",fluid:""},{default:p(()=>[g(a,{destination:r(G),"page-content":r(A)},{default:p(()=>[g(de)]),_:1},8,["destination","page-content"]),g(xe,{class:"pb-0 pt-4 mt-md-12"},{default:p(()=>[g(be,{cols:"12",class:"px-4 px-md-12 d-flex ga-2 align-center flex-wrap"},{default:p(()=>[v("span",Ce,N(r(j)<=1?`${r(j)} ${r(A)?.oneTrip||"voyage"}`:`${r(j)}
            ${r(A)?.multipleTrips||"voyages"}`),1),v("div",Se,[r(f).destination?(B(),S(z,{key:0,variant:"flat",size:r(F)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:p(()=>[v("span",Be,N($(r(f).destination)),1)]),_:1},8,["size"])):I("",!0),r(f).travelType?(B(),S(z,{key:1,variant:"flat",size:r(F)?"x-large":"large",color:"secondary-light-2",density:"comfortable","onClick:close":t[0]||(t[0]=o=>e.chip=!1)},{default:p(()=>[v("span",Fe,N(r(f).travelType),1)]),_:1},8,["size"])):I("",!0),r(f).from?(B(),S(z,{key:2,variant:"flat",size:r(F)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:p(()=>[v("span",$e,N(r(Q)),1)]),_:1},8,["size"])):I("",!0)]),g(Te),v("div",Re,[g(ke,{modelValue:r(c),"onUpdate:modelValue":t[1]||(t[1]=o=>qe(c)?c.value=o:null),"hide-details":"",color:"primary",density:"compact",label:"Voir tous les départs garantis","content-class":"text-subtitle-2 text-sm-body-1"},{label:p(()=>[...t[2]||(t[2]=[v("span",{class:"text-subtitle-2 text-sm-body-1"}," Voir tous les départs garantis ",-1)])]),_:1},8,["modelValue"]),g(Ve,{color:"primary",variant:"outlined",size:"large",class:"text-subtitle-2 text-sm-body-1 reset-btn-size",onClick:le},{default:p(()=>[we(N(r(A)?.resetButton||"Réinitialiser"),1)]),_:1})])]),_:1})]),_:1}),g(K,{class:"py-0 px-0 px-md-8 mt-3",fluid:""},{default:p(()=>[g(n,{voyages:r(R),"is-search":!0,"prefer-confirmed-date":r(c),"item-list-name":r(J)},null,8,["voyages","prefer-confirmed-date","item-list-name"])]),_:1})]),_:1})}}},ot=pe(je,[["__scopeId","data-v-1f8ddcbd"]]);export{ot as default};

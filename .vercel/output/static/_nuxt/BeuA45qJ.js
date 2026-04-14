import{_ as ce}from"./CfsMHgvw.js";import{_ as de,a as me}from"./ChDnKUib.js";import{_ as pe,b as fe,M as ye,at as ge,d as he,r as P,u as ve,g as q,w as V,a as h,O as k,e as S,f as p,V as K,ax as _e,c as N,o as B,i as g,h as r,N as xe,C as be,m as v,t as D,Z as I,n as j,a0 as Te,a8 as qe,G as Ve,v as we,L as Ne,au as De}from"./C_h2DYOn.js";import{g as Ae}from"./COvYSwLT.js";import{V as Ce}from"./CCiv0k4S.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./CykoxQ89.js";import"./B9ff861V.js";import"./CObX9U3n.js";import"./DIeuEC5d.js";import"./BLs7WySm.js";import"./qaQVVOdr.js";import"./Bk05Vh6f.js";import"./C6XDyYT_.js";import"./ChxT7FyK.js";import"./BFZMOqdn.js";import"./D-Vwsrgj.js";import"./DpXb_68Z.js";import"./ChEw6W4A.js";import"./BT7uebgC.js";import"./BjsqtvLj.js";import"./xxKVO4VZ.js";const ke={class:"text-primary text-h3 font-weight-bold mr-2 mr-md-5"},Se={class:"d-flex align-center flex-wrap ga-2"},Be={class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-sm-3 pb-1"},Fe={class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},Re={class:"d-flex align-center text-white text-caption text-sm-subtitle-1 px-3 pb-1"},$e={class:"d-flex justify-end ml-auto align-center ga-3 flex-wrap"},ze={__name:"index",async setup(Ie){let s,l;const{lgAndUp:F}=fe(),{trackSearchBar:L,trackViewItemList:Y}=Ne(),{formatVoyagesForGtm:Z}=De();ye({meta:[{name:"html-attrs",content:"lang=fr"},{name:"robots",content:"noindex, follow"},{name:"canonical",content:"https://www.odysway.com/voyages"}]});const G=ge(),i=he(),f=N(()=>i.query),c=P(i.query.confirmed==="true"),_=ve(),X=q`*[_type == "search"][0]{
  oneTrip,
  multipleTrips,
  resetButton,
  image,
  searchHero
}`,{data:A}=([s,l]=V(()=>h("search-content-page",()=>_.fetch(X))),s=await s,l(),s),{data:U}=h("fetchedDestination",()=>{if(i.query.destination){const e=q`*[_type == "destination" && slug.current == $slug][0]{
      title,
      interjection,
      image
    }`;return _.fetch(e,{slug:i.query.destination})}return null},{watch:[f],immediate:!0});console.log("fetchedDestination",U.value);const R=e=>e.charAt(0).toUpperCase()+e.slice(1),O=["","Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],Q=N(()=>{if(!f.value.from)return"";const e=f.value.from.split(",").map(Number).filter(a=>a>0&&a<=12);return e.length===0?"":e.map(a=>O[a]).join(" - ")});function W(e,t){return t?e.filter(a=>a.destinations?.some(n=>n.title.includes(t))):e}const ee=q`*[_type == "search"][0]{
  travelTypes
}`,{data:E}=([s,l]=V(()=>h("travelTypes",()=>_.fetch(ee))),s=await s,l(),s),J={GROUP:E.value?.travelTypes?.group,INDIVIDUAL:E.value?.travelTypes?.individual};function te(e,t){if(!t)return e;const n={[J.GROUP]:o=>o.availabilityTypes?.includes("groupe"),[J.INDIVIDUAL]:o=>o.availabilityTypes?.includes("privatisation")}[t];return n?e.filter(n):e}function ae(e,t){if(!t)return e;const a=t.split(",").map(Number).filter(y=>y>0&&y<=12);if(a.length===0)return e;const n=["","janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"],o=a.map(y=>n[y]);return e.filter(y=>{const x=y.monthlyAvailability;if(!Array.isArray(x))return!1;const u=x.map(d=>d.replace(/[\u200B-\u200F\uFEFF]/g,""));return o.some(d=>u.includes(d))})}const ie=q`*[_type == "region"]{
  _id,
  nom,
  "slug": slug.current
}`,{data:C}=([s,l]=V(()=>h("regions",()=>_.fetch(ie))),s=await s,l(),s),se=q`*[_type == "destination"]{
  _id,
  title,
  "slug": slug.current,
  isTopDestination,
  regions[]-> {
    nom
  }
}`,{data:w}=([s,l]=V(()=>h("destinations",()=>_.fetch(se))),s=await s,l(),s),{data:ne}=([s,l]=V(()=>h("travels-by-date",()=>$fetch("/api/v1/booking/travels-by-date"))),s=await s,l(),s),{data:re}=([s,l]=V(async()=>h(`search-${JSON.stringify(i.query)}`,async()=>{let e=null,t=null,a=!1,n=!1;if(i.query.destination){const d=C.value.find(b=>b.slug===i.query.destination);if(d)a=!0,t=d.slug;else if(i.query.destination==="top-destination")a=!0,n=!0;else{const b=w.value.find(m=>m.slug===i.query.destination);b&&(e=b.title)}}const o=i.query.travelType||null,y=i.query.from||null,x=q`*[
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
    }`;let u=await _.fetch(x);if(a){let d=[];if(n)d=w.value.filter(m=>m.isTopDestination);else{const m=C.value.find(T=>T.slug===t);m&&(d=w.value.filter(T=>T.regions&&T.regions.some(ue=>ue.nom===m.nom)))}const b=d.map(m=>m.title);u=u.filter(m=>m.destinations?.some(T=>b.includes(T.title)))}else u=W(u,e);return u=te(u,o),u=ae(u,y),_e.uniqBy(u,"slug")},{watch:[f,C,w]})),s=await s,l(),s);function oe(e,t,a){if(!t||!Array.isArray(a)||a.length===0)return e;const n=new Set;return a.forEach(o=>{if(!Array.isArray(o.dates))return;o.dates.some(x=>Ae(x)?.status==="confirmed")&&n.add(o.slug)}),e.filter(o=>n.has(o.slug))}const $=N(()=>{const e=re.value||[];return oe(e,c.value,ne.value||[])}),z=N(()=>$.value?.length||0);k([c],()=>{let e=null;if(i.query.destination){const a=w.value?.find(n=>n.slug===i.query.destination);if(a)e=a.title;else{const n=C.value?.find(o=>o.slug===i.query.destination);n?e=n.nom:e=R(i.query.destination)}}let t=null;if(i.query.from){const a=i.query.from.split(",").map(Number).filter(n=>n>0&&n<=12);a.length>0&&(t=a.map(n=>O[n]).join(", "))}L({destination:e,typeVoyage:i.query.travelType||null,periode:t,voyageGaranti:c.value})},{deep:!0});const H=N(()=>{let e="Search Results";return i.query.destination&&(e+=` - ${R(i.query.destination)}`),i.query.travelType&&(e+=` - ${i.query.travelType}`),i.query.from&&(e+=` - ${Q.value}`),c.value&&(e+=" - Départs garantis"),e}),M=P(null);k($,e=>{if(e&&e.length>0){const t=e.map(a=>a._id).sort().join(",");if(t!==M.value){M.value=t;const a=Z(e);a&&a.length>0&&Y({currency:"EUR",items:a,itemListName:H.value})}}},{immediate:!0});function le(){L({destination:null,typeVoyage:null,periode:null,voyageGaranti:!1}),G.push({path:"/voyages",query:null})}return k(c,e=>{const t={...i.query};e?t.confirmed="true":delete t.confirmed,G.push({path:i.path,query:Object.keys(t).length>0?t:void 0})}),k(()=>i.query.confirmed,e=>{c.value=e==="true"}),(e,t)=>{const a=ce,n=me;return B(),S(K,{class:"py-0 my-0 px-2 px-md-4",fluid:""},{default:p(()=>[g(a,{destination:r(U),"page-content":r(A)},{default:p(()=>[g(de)]),_:1},8,["destination","page-content"]),g(xe,{class:"pb-0 pt-4 mt-md-12"},{default:p(()=>[g(be,{cols:"12",class:"px-4 px-md-12 d-flex ga-2 align-center flex-wrap"},{default:p(()=>[v("span",ke,D(r(z)<=1?`${r(z)} ${r(A)?.oneTrip||"voyage"}`:`${r(z)}
            ${r(A)?.multipleTrips||"voyages"}`),1),v("div",Se,[r(f).destination?(B(),S(I,{key:0,variant:"flat",size:r(F)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:p(()=>[v("span",Be,D(R(r(f).destination)),1)]),_:1},8,["size"])):j("",!0),r(f).travelType?(B(),S(I,{key:1,variant:"flat",size:r(F)?"x-large":"large",color:"secondary-light-2",density:"comfortable","onClick:close":t[0]||(t[0]=o=>e.chip=!1)},{default:p(()=>[v("span",Fe,D(r(f).travelType),1)]),_:1},8,["size"])):j("",!0),r(f).from?(B(),S(I,{key:2,variant:"flat",size:r(F)?"x-large":"large",color:"secondary-light-2",density:"comfortable"},{default:p(()=>[v("span",Re,D(r(Q)),1)]),_:1},8,["size"])):j("",!0)]),g(Te),v("div",$e,[g(Ce,{modelValue:r(c),"onUpdate:modelValue":t[1]||(t[1]=o=>qe(c)?c.value=o:null),"hide-details":"",color:"primary",density:"compact",label:"Voir tous les départs garantis","content-class":"text-subtitle-2 text-sm-body-1"},{label:p(()=>[...t[2]||(t[2]=[v("span",{class:"text-subtitle-2 text-sm-body-1"}," Voir tous les départs garantis ",-1)])]),_:1},8,["modelValue"]),g(Ve,{color:"primary",variant:"outlined",size:"large",class:"text-subtitle-2 text-sm-body-1 reset-btn-size",onClick:le},{default:p(()=>[we(D(r(A)?.resetButton||"Réinitialiser"),1)]),_:1})])]),_:1})]),_:1}),g(K,{class:"py-0 px-0 px-md-8 mt-3",fluid:""},{default:p(()=>[g(n,{voyages:r($),"is-search":!0,"prefer-confirmed-date":r(c),"item-list-name":r(H)},null,8,["voyages","prefer-confirmed-date","item-list-name"])]),_:1})]),_:1})}}},ot=pe(ze,[["__scopeId","data-v-1f8ddcbd"]]);export{ot as default};

import{_ as V}from"./Y2ylXnWm.js";import{_ as S}from"./DNgvOCQF.js";import{r as b}from"./DB-riz01.js";import{Q as $,o,e as l,f as t,i as s,D as y,a3 as O,am as T,m as f,v as D,A as B,x as m,t as u,h as n,bm as I,O as N,u as q,g as A,w as L,l as c,p as i,a as R,F as j,G as E,ad as F}from"./BL9fbG64.js";import{_ as P}from"./BJunrQ22.js";import{u as U}from"./DDbkjYDv.js";import"./DQN8drov.js";import"./D2y-zQ2J.js";import"./CBDcPeBp.js";const z=["href"],G={class:"text-white"},H={__name:"RecruitementCard",props:{link:{type:String,required:!0},color:{type:String,default:"primary"}},setup(_){return(a,p)=>{const d=$("v-btn-secondary");return o(),l(N,{justify:"start",align:"center"},{default:t(()=>[s(y,{cols:"8.5"},{default:t(()=>[s(O,null,{default:t(()=>[s(T,{class:"text-primary text-wrap"},{default:t(()=>[f("a",{href:_.link,target:"_blank"},[D(a.$slots,"text")],8,z)]),_:3})]),_:3})]),_:3}),s(y,{cols:"auto"},{default:t(()=>[s(d,{href:_.link,color:_.color,size:"x-large",class:"text-white",elevation:"10"},{prepend:t(()=>[s(B,{class:"text-white"},{default:t(()=>[m(u(n(I)),1)]),_:1})]),default:t(()=>[f("div",G,[b(a.$slots,"cta",{mdcUnwrap:"p"})])]),_:3},8,["href","color"])]),_:3})]),_:3})}}},Q={key:1,class:"mt-8"},J={key:0},K={key:2,class:"d-flex justify-center align-center"},re={__name:"nous-recrutons",async setup(_){let a,p;const d=q(),h=A`*[_type == "recruitment" && slug.current == "nous-recrutons"][0]{
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
}`,{data:e,status:g}=([a,p]=L(()=>R("nous-recrutons",()=>d.fetch(h))),a=await a,p(),a);return e.value&&U({seoData:e.value?.seo,content:e.value,pageType:"website",slug:"nous-recrutons",baseUrl:"/nous-recrutons"}),(M,W)=>{const x=V,k=S,v=H,C=P;return o(),c("div",null,[n(e)?.heroImage?(o(),l(x,{key:0,"image-src":n(e).heroImage},{title:t(()=>[m(u(n(e).title),1)]),_:1},8,["image-src"])):i("",!0),n(e)?(o(),l(C,{key:1},{content:t(()=>[n(e).content?(o(),l(k,{key:0,value:n(e).content},null,8,["value"])):i("",!0),n(e).jobOffers&&n(e).jobOffers.length>0?(o(),c("div",Q,[(o(!0),c(j,null,E(n(e).jobOffers,(r,w)=>(o(),l(v,{key:w,link:r.applicationLink,class:"mb-4"},{text:t(()=>[f("p",null,[m(u(r.title)+" ",1),r.location?(o(),c("span",J," | "+u(r.location),1)):i("",!0)])]),cta:t(()=>[m(u(r.ctaText||"Postuler"),1)]),_:2},1032,["link"]))),128))])):i("",!0)]),_:1})):n(g)==="pending"?(o(),c("div",K,[s(F,{indeterminate:""})])):i("",!0)])}}};export{re as default};

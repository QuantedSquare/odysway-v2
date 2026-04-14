import{_ as V}from"./DDKZt3RU.js";import{_ as S}from"./BNmhFpZt.js";import{r as b}from"./Dl2u_VAm.js";import{P as $,o,e as l,f as t,i as s,C as y,a2 as T,aw as N,m as f,s as O,z as B,v as m,t as u,h as n,br as D,N as I,u as q,g as E,w as L,l as c,n as i,a as P,F as R,E as j,ac as z}from"./C_h2DYOn.js";import{_ as A}from"./hzcv8Xke.js";import{u as F}from"./DFakivn3.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./Ndey5mom.js";const U=["href"],H={class:"text-white"},G={__name:"RecruitementCard",props:{link:{type:String,required:!0},color:{type:String,default:"primary"}},setup(_){return(a,p)=>{const d=$("v-btn-secondary");return o(),l(I,{justify:"start",align:"center"},{default:t(()=>[s(y,{cols:"8.5"},{default:t(()=>[s(T,null,{default:t(()=>[s(N,{class:"text-primary text-wrap"},{default:t(()=>[f("a",{href:_.link,target:"_blank"},[O(a.$slots,"text")],8,U)]),_:3})]),_:3})]),_:3}),s(y,{cols:"auto"},{default:t(()=>[s(d,{href:_.link,color:_.color,size:"x-large",class:"text-white",elevation:"10"},{prepend:t(()=>[s(B,{class:"text-white"},{default:t(()=>[m(u(n(D)),1)]),_:1})]),default:t(()=>[f("div",H,[b(a.$slots,"cta",{mdcUnwrap:"p"})])]),_:3},8,["href","color"])]),_:3})]),_:3})}}},J={key:1,class:"mt-8"},K={key:0},M={key:2,class:"d-flex justify-center align-center"},re={__name:"nous-recrutons",async setup(_){let a,p;const d=q(),h=E`*[_type == "recruitment" && slug.current == "nous-recrutons"][0]{
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
}`,{data:e,status:g}=([a,p]=L(()=>P("nous-recrutons",()=>d.fetch(h))),a=await a,p(),a);return e.value&&F({seoData:e.value?.seo,content:e.value,pageType:"website",slug:"nous-recrutons",baseUrl:"/nous-recrutons"}),(Q,W)=>{const k=V,x=S,v=G,C=A;return o(),c("div",null,[n(e)?.heroImage?(o(),l(k,{key:0,"image-src":n(e).heroImage},{title:t(()=>[m(u(n(e).title),1)]),_:1},8,["image-src"])):i("",!0),n(e)?(o(),l(C,{key:1},{content:t(()=>[n(e).content?(o(),l(x,{key:0,value:n(e).content},null,8,["value"])):i("",!0),n(e).jobOffers&&n(e).jobOffers.length>0?(o(),c("div",J,[(o(!0),c(R,null,j(n(e).jobOffers,(r,w)=>(o(),l(v,{key:w,link:r.applicationLink,class:"mb-4"},{text:t(()=>[f("p",null,[m(u(r.title)+" ",1),r.location?(o(),c("span",K," | "+u(r.location),1)):i("",!0)])]),cta:t(()=>[m(u(r.ctaText||"Postuler"),1)]),_:2},1032,["link"]))),128))])):i("",!0)]),_:1})):n(g)==="pending"?(o(),c("div",M,[s(z,{indeterminate:""})])):i("",!0)])}}};export{re as default};

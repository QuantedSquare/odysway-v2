import{_ as m}from"./BNmhFpZt.js";import{_ as u}from"./hzcv8Xke.js";import{u as p,g,w as y,l as s,i as a,f,a as d,o as l,h as n,t as h,n as x}from"./C_h2DYOn.js";import{u as v}from"./DFakivn3.js";import"./B1pha2ri.js";import"./Ndey5mom.js";import"./2eRY76U3.js";const w={key:0},T={__name:"mentions-legales",async setup(b){let t,o;const r=p(),i=g`*[_type == "legalMentions" && slug.current == "mentions-legales"][0]{
  title,
  body,
  seo
}`,{data:e}=([t,o]=y(()=>d("mentions-legales",()=>r.fetch(i))),t=await t,o(),t);return e.value&&v({seoData:e.value?.seo,content:e.value,pageType:"website",slug:"mentions-legales",baseUrl:"/mentions-legales"}),(C,S)=>{const _=m,c=u;return l(),s("div",null,[a(c,null,{content:f(()=>[n(e)?(l(),s("h1",w,h(n(e).title),1)):x("",!0),a(_,{value:n(e).body},null,8,["value"])]),_:1})])}}};export{T as default};

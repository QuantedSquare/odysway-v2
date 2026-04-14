import{_ as u}from"./BNmhFpZt.js";import{_ as p}from"./hzcv8Xke.js";import{u as m,g as d,w as g,l as s,i as a,f as y,a as v,o as r,h as n,t as f,n as h}from"./C_h2DYOn.js";import{u as x}from"./DFakivn3.js";import"./B1pha2ri.js";import"./Ndey5mom.js";import"./2eRY76U3.js";const w={key:0},N={__name:"conditions-generales-de-vente",async setup(b){let t,o;const i=m(),c=d`*[_type == "conditionsGeneralesVente" && slug.current == "conditions-generales-de-vente"][0]{
  title,
  body,
  seo
}`,{data:e}=([t,o]=g(()=>v("conditions-generales-de-vente",()=>i.fetch(c))),t=await t,o(),t);return e.value&&x({seoData:e.value?.seo,content:e.value,pageType:"website",slug:"conditions-generales-de-vente",baseUrl:"/conditions-generales-de-vente"}),(C,S)=>{const _=u,l=p;return r(),s("div",null,[a(l,null,{content:y(()=>[n(e)?(r(),s("h1",w,f(n(e).title),1)):h("",!0),a(_,{value:n(e).body},null,8,["value"])]),_:1})])}}};export{N as default};

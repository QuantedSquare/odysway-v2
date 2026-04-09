import{_ as m}from"./DNgvOCQF.js";import{_ as u}from"./BJunrQ22.js";import{u as p,g,w as y,l as s,i as a,f,a as d,o as l,h as n,t as h,p as x}from"./BL9fbG64.js";import{u as v}from"./DDbkjYDv.js";import"./D2y-zQ2J.js";import"./CBDcPeBp.js";import"./DQN8drov.js";const w={key:0},T={__name:"mentions-legales",async setup(b){let t,o;const r=p(),i=g`*[_type == "legalMentions" && slug.current == "mentions-legales"][0]{
  title,
  body,
  seo
}`,{data:e}=([t,o]=y(()=>d("mentions-legales",()=>r.fetch(i))),t=await t,o(),t);return e.value&&v({seoData:e.value?.seo,content:e.value,pageType:"website",slug:"mentions-legales",baseUrl:"/mentions-legales"}),(C,S)=>{const _=m,c=u;return l(),s("div",null,[a(c,null,{content:f(()=>[n(e)?(l(),s("h1",w,h(n(e).title),1)):x("",!0),a(_,{value:n(e).body},null,8,["value"])]),_:1})])}}};export{T as default};

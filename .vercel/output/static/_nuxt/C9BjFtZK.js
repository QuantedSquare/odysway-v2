import{_ as V}from"./Bkusfz1Y.js";import{_ as D}from"./DNgvOCQF.js";import{_ as O}from"./CqdWF_o8.js";import{u as $}from"./D2y-zQ2J.js";import{o as m,l as g,i as e,f as t,O as v,D as l,v as u,aq as b,C as T,h as o,V as d,_ as x,g as j,u as q,w as I,e as k,a as A,x as f,t as y}from"./BL9fbG64.js";import{_ as B}from"./BJunrQ22.js";import{u as Q}from"./DDbkjYDv.js";import{a as z,b as E}from"./DnvDXKgj.js";import"./CBDcPeBp.js";import"./U5S_1qbW.js";import"./DQN8drov.js";const N={__name:"ConceptContainer",props:{imageSrc:{type:Object,required:!0}},setup(i){const n=$();return(s,p)=>{const c=O;return m(),g("div",null,[e(d,null,{default:t(()=>[e(v,{justify:"center"},{default:t(()=>[e(l,{cols:"12",class:""},{default:t(()=>[u(s.$slots,"text")]),_:3}),e(l,{class:"d-flex align-center"},{default:t(()=>[e(b,{size:"x-large",class:"mr-4"},{default:t(()=>[e(c,{"asset-id":i.imageSrc.asset._ref,auto:"format"},{default:t(({src:a})=>[e(T,{src:o(n)(a,{format:"webp",quality:70,width:640})},null,8,["src"])]),_:1},8,["asset-id"])]),_:1}),u(s.$slots,"founder")]),_:3})]),_:3})]),_:3})])}}},P={};function H(i,n){return m(),g("div",null,[e(d,null,{default:t(()=>[e(v,{justify:"center"},{default:t(()=>[e(l,{cols:"12",class:""},{default:t(()=>[u(i.$slots,"text")]),_:3})]),_:3})]),_:3})])}const R=Object.assign(x(P,[["render",H]]),{__name:"TextContainer"}),U={__name:"vision-voyage-odysway",async setup(i){let n,s;const p=j`*[_type == "visionVoyageOdysway"][0]{
  ...,
  ceQueOnDefend{
    content[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          _ref,
          url,
          metadata
        }
      }
    }
  },
  priseDeConscience{
    content[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          _ref,
          url,
          metadata
        }
      }
    }
  },
  teamSection{
    content[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          _ref,
          url,
          metadata
        }
      }
    }
  }
}`,c=q(),{data:a}=([n,s]=I(()=>A("vision-voyage-odysway",()=>c.fetch(p))),n=await n,s(),n);if(a.value){const r={title:"Vision Voyage Odysway",description:"Vision Voyage Odysway",image:a.value.heroSection.image};Q({seoData:a.value?.seo,content:r,pageType:"website",slug:"vision-voyage-odysway",baseUrl:"/vision-voyage-odysway",structuredData:[z({description:a.value?.seo?.metaDescription||r.description}),E()]})}return(r,W)=>{const S=V,_=D,w=N,h=R,C=B;return m(),k(d,{class:"pt-4 py-md-0 my-0 px-2 px-md-4",fluid:""},{default:t(()=>[e(S,{"displayed-img":o(a).heroSection.image,"title-color":"white"},{title:t(()=>[f(y(o(a).heroSection.title),1)]),_:1},8,["displayed-img"]),e(C,null,{content:t(()=>[e(h,{class:"focus"},{text:t(()=>[e(_,{class:"focus",value:o(a).priseDeConscience.content},null,8,["value"]),e(w,{"image-src":o(a).founderSection.image},{founder:t(()=>[f(y(o(a).founderSection.caption),1)]),_:1},8,["image-src"]),e(_,{value:o(a).ceQueOnDefend.content},null,8,["value"]),e(_,{value:o(a).teamSection.content},null,8,["value"])]),_:1})]),_:1})]),_:1})}}},ae=x(U,[["__scopeId","data-v-fd961290"]]);export{ae as default};

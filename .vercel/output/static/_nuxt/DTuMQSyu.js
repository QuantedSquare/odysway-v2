import{a as m}from"./B3OUA3mF.js";import{_ as l}from"./DhM95Zet.js";import{u as c,w as d,N as g,e as _,f as u,h as a,a as y,o as f,i as v,c as h}from"./BL9fbG64.js";import{u as x}from"./DDbkjYDv.js";import"./rK2S_7Sw.js";import"./BG69C3vn.js";import"./D9pJy1lO.js";import"./DQN8drov.js";import"./D2y-zQ2J.js";import"./BLZOjkac.js";import"./CUzVmzla.js";import"./XJK7mQDn.js";import"./bzvY4d47.js";import"./CrvLZNZ-.js";import"./C5rMqzIG.js";import"./BDat7HJs.js";import"./CqdWF_o8.js";import"./U5S_1qbW.js";import"./CtKYGlKH.js";import"./CEE8k1hT.js";import"./BijPqpoI.js";import"./DWX7X6Ub.js";import"./CqMooMqM.js";import"./DHkiWKsE.js";import"./BLYU2Do4.js";import"./Cs-ho-TV.js";const C=`
{
  "destinations": *[_type == "destination"]{
    _id,
    title,
    slug,
    "description": metaDescription,
    image,
    "voyages": *[_type == "voyage" && references(^._id) && !('custom' in availabilityTypes)]{
      _id,
      title,
      "slug": slug.current,
      image,
      duration,
      nights,
      rating,
      comments,
      availabilityTypes,
      "startingPrice": pricing.startingPrice,
      pricing {
        startingPrice
      },
      destinations[]->{
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
      },
      monthlyAvailability
    }
  },
  "pageContent": *[_type == "page_destinations"][0]{
    ...
  }
}
`,X={__name:"index",async setup(T){let i,o;const s=c(),{data:e}=([i,o]=d(()=>y("destinations",()=>s.fetch(C))),i=await i,o(),i),n=h(()=>({items:e.value?.destinations?.map(t=>({id:t._id,title:t.title,slug:t.slug?.current,image:t.image,type:"destinations",discoveryTitle:t.metaDescription||t.description||""})).filter(t=>t.image?.asset?._ref),selectedItem:null,pageTitle:e.value?.pageContent?.index?.pageTitle||"Toutes nos destinations",showOnBottom:!1}));return g({htmlAttrs:{lang:"fr"}}),e.value?.pageContent&&x({seoData:e.value?.pageContent?.seo,slug:"destinations",content:e.value?.pageContent,pageType:"website"}),(t,w)=>{const p=m,r=l;return f(),_(r,{type:"destinations","display-divider":!0,"displayed-data":a(n),"page-content":a(e).pageContent},{content:u(()=>[v(p,{voyages:a(e).destinations},null,8,["voyages"])]),_:1},8,["displayed-data","page-content"])}}};export{X as default};

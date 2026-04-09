import{a as m}from"./B3OUA3mF.js";import{_ as c}from"./DhM95Zet.js";import{u as l,w as u,N as g,e as _,f as y,h as a,a as d,o as h,i as f,c as v}from"./BL9fbG64.js";import{u as w}from"./DDbkjYDv.js";import"./rK2S_7Sw.js";import"./BG69C3vn.js";import"./D9pJy1lO.js";import"./DQN8drov.js";import"./D2y-zQ2J.js";import"./BLZOjkac.js";import"./CUzVmzla.js";import"./XJK7mQDn.js";import"./bzvY4d47.js";import"./CrvLZNZ-.js";import"./C5rMqzIG.js";import"./BDat7HJs.js";import"./CqdWF_o8.js";import"./U5S_1qbW.js";import"./CtKYGlKH.js";import"./CEE8k1hT.js";import"./BijPqpoI.js";import"./DWX7X6Ub.js";import"./CqMooMqM.js";import"./DHkiWKsE.js";import"./BLYU2Do4.js";import"./Cs-ho-TV.js";const x=`
  {
    "pageContent": *[_type == "page_thematiques"][0]{
      ...
    },
    "categories": *[_type == "category"]{
       _id,
    title,
    slug,
    description,
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
    }
  }
`,X={__name:"index",async setup(T){let i,s;const o=l(),{data:e}=([i,s]=u(async()=>d("categories-with-voyages",async()=>{try{return await o.fetch(x)||[]}catch{return[]}})),i=await i,s(),i),n=v(()=>({items:e.value?.categories?.map(t=>({id:t._id,title:t.title,slug:t.slug?.current,image:t.image,type:"thematiques",discoveryTitle:t.discoveryTitle||t.description||""})).filter(t=>t.image?.asset?._ref),selectedItem:null,pageTitle:e.value?.pageContent?.index?.pageTitle||"Toutes nos thématiques",showOnBottom:!1}));return g({htmlAttrs:{lang:"fr"}}),e.value?.pageContent&&w({seoData:e.value?.pages?.seo,content:e.value?.pages,pageType:"website",slug:"thematiques"}),(t,C)=>{const r=m,p=c;return h(),_(p,{"page-content":a(e).pageContent,"displayed-data":a(n),type:"thematiques"},{content:y(()=>[f(r,{voyages:a(e).categories},null,8,["voyages"])]),_:1},8,["page-content","displayed-data"])}}};export{X as default};

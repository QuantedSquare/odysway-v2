import{a as c}from"./B3OUA3mF.js";import{_ as m}from"./DhM95Zet.js";import{u as l,w as g,N as _,e as u,f as y,h as a,a as d,o as f,i as v,c as x}from"./BL9fbG64.js";import{u as h}from"./DDbkjYDv.js";import"./rK2S_7Sw.js";import"./BG69C3vn.js";import"./D9pJy1lO.js";import"./DQN8drov.js";import"./D2y-zQ2J.js";import"./BLZOjkac.js";import"./CUzVmzla.js";import"./XJK7mQDn.js";import"./bzvY4d47.js";import"./CrvLZNZ-.js";import"./C5rMqzIG.js";import"./BDat7HJs.js";import"./CqdWF_o8.js";import"./U5S_1qbW.js";import"./CtKYGlKH.js";import"./CEE8k1hT.js";import"./BijPqpoI.js";import"./DWX7X6Ub.js";import"./CqMooMqM.js";import"./DHkiWKsE.js";import"./BLYU2Do4.js";import"./Cs-ho-TV.js";const C=`
  {
    "pageContent": *[_type == "page_experiences"][0]{
      ...
    },
    "experiences": *[_type == "experience"]{
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
    },
    }
  }
`,X={__name:"index",async setup(T){let i,o;const s=l(),{data:t}=([i,o]=g(()=>d("experiences-with-voyages",()=>s.fetch(C))),i=await i,o(),i),n=x(()=>({items:t.value?.experiences?.map(e=>({id:e._id,title:e.title,slug:e.slug?.current,image:e.image,type:"experiences",discoveryTitle:e.discoveryTitle||e.description||""})).filter(e=>e.image?.asset?._ref),selectedItem:null,pageTitle:t.value?.pageContent?.index?.pageTitle||"Toutes nos expériences",showOnBottom:!1}));return _({htmlAttrs:{lang:"fr"}}),t.value?.pageContent&&h({seoData:t.value?.pageContent?.seo,content:t.value?.pageContent,pageType:"website",slug:"experiences"}),(e,w)=>{const p=c,r=m;return f(),u(r,{type:"experiences","displayed-data":a(n),"page-content":a(t).pageContent},{content:y(()=>[v(p,{voyages:a(t).experiences},null,8,["voyages"])]),_:1},8,["displayed-data","page-content"])}}};export{X as default};

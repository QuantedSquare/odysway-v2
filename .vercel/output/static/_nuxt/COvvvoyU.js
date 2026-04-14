import{a as c}from"./ChDnKUib.js";import{_ as m}from"./BkvSo_uw.js";import{u as l,w as g,M as _,e as u,f as y,h as a,a as d,o as f,i as v,c as x}from"./C_h2DYOn.js";import{u as h}from"./DFakivn3.js";import"./CykoxQ89.js";import"./B9ff861V.js";import"./COvYSwLT.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./CObX9U3n.js";import"./DIeuEC5d.js";import"./BLs7WySm.js";import"./qaQVVOdr.js";import"./Bk05Vh6f.js";import"./C6XDyYT_.js";import"./ChxT7FyK.js";import"./BFZMOqdn.js";import"./D-Vwsrgj.js";import"./DpXb_68Z.js";import"./ChEw6W4A.js";import"./BT7uebgC.js";import"./BjsqtvLj.js";import"./xxKVO4VZ.js";import"./CfsMHgvw.js";import"./CiyfkAXz.js";import"./DcoOdQ4K.js";const C=`
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

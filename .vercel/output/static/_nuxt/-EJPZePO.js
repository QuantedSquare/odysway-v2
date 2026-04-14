import{a as m}from"./ChDnKUib.js";import{_ as c}from"./BkvSo_uw.js";import{u as l,w as u,M as g,e as _,f as y,h as a,a as d,o as h,i as f,c as v}from"./C_h2DYOn.js";import{u as w}from"./DFakivn3.js";import"./CykoxQ89.js";import"./B9ff861V.js";import"./COvYSwLT.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./CObX9U3n.js";import"./DIeuEC5d.js";import"./BLs7WySm.js";import"./qaQVVOdr.js";import"./Bk05Vh6f.js";import"./C6XDyYT_.js";import"./ChxT7FyK.js";import"./BFZMOqdn.js";import"./D-Vwsrgj.js";import"./DpXb_68Z.js";import"./ChEw6W4A.js";import"./BT7uebgC.js";import"./BjsqtvLj.js";import"./xxKVO4VZ.js";import"./CfsMHgvw.js";import"./CiyfkAXz.js";import"./DcoOdQ4K.js";const x=`
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

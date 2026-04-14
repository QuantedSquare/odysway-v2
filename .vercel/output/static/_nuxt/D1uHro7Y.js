import{a as m}from"./ChDnKUib.js";import{_ as l}from"./BkvSo_uw.js";import{u as c,w as d,M as g,e as _,f as u,h as a,a as y,o as f,i as v,c as h}from"./C_h2DYOn.js";import{u as x}from"./DFakivn3.js";import"./CykoxQ89.js";import"./B9ff861V.js";import"./COvYSwLT.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./CObX9U3n.js";import"./DIeuEC5d.js";import"./BLs7WySm.js";import"./qaQVVOdr.js";import"./Bk05Vh6f.js";import"./C6XDyYT_.js";import"./ChxT7FyK.js";import"./BFZMOqdn.js";import"./D-Vwsrgj.js";import"./DpXb_68Z.js";import"./ChEw6W4A.js";import"./BT7uebgC.js";import"./BjsqtvLj.js";import"./xxKVO4VZ.js";import"./CfsMHgvw.js";import"./CiyfkAXz.js";import"./DcoOdQ4K.js";const C=`
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

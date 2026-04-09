import{a as B}from"./B3OUA3mF.js";import{_ as $}from"./o3kl9E5N.js";import{_ as I}from"./DNgvOCQF.js";import{_ as N}from"./BJunrQ22.js";import{_ as R}from"./DhM95Zet.js";import{d as L,u as P,w as p,P as F,e as n,f as l,h as e,a as d,c as s,o as c,m as G,p as y,x as b,t as v,i as Q,B as U,ak as E,M}from"./BL9fbG64.js";import{u as O}from"./DDbkjYDv.js";import{d as z}from"./DnvDXKgj.js";import"./rK2S_7Sw.js";import"./BG69C3vn.js";import"./D9pJy1lO.js";import"./DQN8drov.js";import"./D2y-zQ2J.js";import"./BLZOjkac.js";import"./CUzVmzla.js";import"./XJK7mQDn.js";import"./bzvY4d47.js";import"./CrvLZNZ-.js";import"./C5rMqzIG.js";import"./BDat7HJs.js";import"./CqdWF_o8.js";import"./U5S_1qbW.js";import"./CtKYGlKH.js";import"./CEE8k1hT.js";import"./BijPqpoI.js";import"./DWX7X6Ub.js";import"./CqMooMqM.js";import"./mRAfk3TE.js";import"./DB-riz01.js";import"./CBDcPeBp.js";import"./DHkiWKsE.js";import"./BLYU2Do4.js";import"./Cs-ho-TV.js";const H=`
  *[_type == "page_thematiques"][0]{
    ...
  }
`,K=`
  *[_type == "category" && slug.current == $slug][0]{
      _id,
    title,
    slug,
    image,
    "voyages": *[_type == "voyage" && references(^._id) && (
        !('custom' in availabilityTypes)
      )]{
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
    seo,
    blog->{
      _id,
      title,
      slug,
      description,
      displayedImg,
      publishedAt,
      body,
      categories[]->{
        _id,
        title
      },
      author->{
        _id,
        name,
        image,
        position
      },
      body[]{
        ...,
        _type == "image" => {
          ...,
          asset->{
            _id,
            url,
            "metadata": {
              "dimensions": metadata.dimensions,
              "lqip": metadata.lqip
            }
          }
        }
      },
      seo{
        metaTitle,
        metaDescription,
        canonicalUrl,
        focusKeyword,
        keywords,
        robotsIndex,
        robotsFollow,
        ogTitle,
        ogDescription,
        ogImage{
          asset->{
            _id,
            _ref,
            url
          },
          alt
        }
      },
      "numberOfCharacters": length(pt::text(body)),
      "estimatedWordCount": round(length(pt::text(body)) / 5),
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
    },
  }
`,W=`
  *[_type == "category"]{
    _id,
    title,
    slug,
    image,
    discoveryTitle,
    description
  }
`,Dt={__name:"[thematiqueSlug]",async setup(Z){let a,i;const{trackViewItemList:f}=M(),{formatVoyagesForGtm:w}=E(),T=L(),_=s(()=>T.params.thematiqueSlug),u=P(),{data:m}=([a,i]=p(async()=>d("page-content",async()=>{try{return await u.fetch(H)||{}}catch{return{}}})),a=await a,i(),a),{data:t}=([a,i]=p(async()=>d(()=>`category-sanity-${_.value}`,async()=>{try{return await u.fetch(K,{slug:_.value})}catch{return null}},"$5kAZ3aplFC")),a=await a,i(),a),{data:x}=([a,i]=p(async()=>d("categories-on-content-layout",async()=>{try{return await u.fetch(W)||[]}catch{return[]}})),a=await a,i(),a),q=s(()=>({items:x.value?.map(o=>({id:o._id,title:o.title,slug:o.slug?.current,image:o.image,type:"thematiques",discoveryTitle:o.discoveryTitle||o.description||""})).filter(o=>o.image?.asset?._ref),selectedItem:t.value,pageTitle:m.value?.index?.pageTitle||"Toutes nos thématiques",showOnBottom:!1})),k=s(()=>{if(!t.value?.blog)return null;const o=t.value.blog.estimatedReadingTime||0;return Math.max(1,o).toString()}),h=s(()=>(t.value?.blog?.categories||[])[0]?.title||null),C=s(()=>h.value?"secondary":null);if(F(()=>t.value?.voyages,o=>{if(o&&o.length>0){const r=w(o),g=`Thematique - ${t.value?.title||"Unknown"}`;r&&r.length>0&&f({currency:"EUR",items:r,itemListName:g})}},{immediate:!0}),t.value){const o=U();O({seoData:t.value.seo||t.value.blog?.seo||{},content:t.value,pageType:"article",slug:t.value.slug?.current,structuredData:t.value.blog?z(t.value.blog,`https://odysway.com/thematiques/${t.value.slug.current}`,o):null,breadcrumbs:[{name:"Accueil",url:"https://odysway.com"},{name:"Thématiques",url:"https://odysway.com/thematiques"},{name:t.value.title,url:`https://odysway.com/thematiques/${t.value.slug.current}`}]})}return(o,r)=>{const g=B,S=$,V=I,D=N,A=R;return c(),n(A,{"selected-category":e(t),"page-content":e(m),"display-divider":!0,"displayed-data":e(q),type:"thematiques"},{content:l(()=>[G("div",null,[e(t)?(c(),n(g,{key:0,"is-search":!0,"selected-category":e(t),voyages:e(t).voyages,"page-content":e(m)},null,8,["selected-category","voyages","page-content"])):y("",!0)]),e(t)?.blog?(c(),n(S,{key:0,class:"mt-12",title:e(t).blog.title,description:e(t).blog.description,image:e(t).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":e(h),"badge-color":e(C),"reading-time":e(k),"published-at":e(t).blog.publishedAt,author:e(t).blog.author?.name,"author-photo":e(t).blog.author?.image,"author-role":e(t).blog.author?.position},{title:l(()=>[b(v(e(t).blog.title),1)]),introduction:l(()=>[b(v(e(t).blog.description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role"])):y("",!0),e(t)?.blog?(c(),n(D,{key:1,title:e(t).blog.title,subtitle:e(t).blog.excerpt},{content:l(()=>[Q(V,{value:e(t).blog.body},null,8,["value"])]),_:1},8,["title","subtitle"])):y("",!0)]),_:1},8,["selected-category","page-content","displayed-data"])}}};export{Dt as default};

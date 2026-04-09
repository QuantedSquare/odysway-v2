import{a as N}from"./B3OUA3mF.js";import{_ as R}from"./o3kl9E5N.js";import{_ as E}from"./DNgvOCQF.js";import{_ as L}from"./BJunrQ22.js";import{_ as P}from"./DhM95Zet.js";import{d as q,g as U,u as F,w as u,P as G,e as m,f as n,h as t,a as g,c as s,o as d,m as H,i as b,x as h,t as x,p as v,B as O,ak as Q,M}from"./BL9fbG64.js";import{u as z}from"./DDbkjYDv.js";import{d as K}from"./DnvDXKgj.js";import"./rK2S_7Sw.js";import"./BG69C3vn.js";import"./D9pJy1lO.js";import"./DQN8drov.js";import"./D2y-zQ2J.js";import"./BLZOjkac.js";import"./CUzVmzla.js";import"./XJK7mQDn.js";import"./bzvY4d47.js";import"./CrvLZNZ-.js";import"./C5rMqzIG.js";import"./BDat7HJs.js";import"./CqdWF_o8.js";import"./U5S_1qbW.js";import"./CtKYGlKH.js";import"./CEE8k1hT.js";import"./BijPqpoI.js";import"./DWX7X6Ub.js";import"./CqMooMqM.js";import"./mRAfk3TE.js";import"./DB-riz01.js";import"./CBDcPeBp.js";import"./DHkiWKsE.js";import"./BLYU2Do4.js";import"./Cs-ho-TV.js";const W=`
  *[_type == "experience" && slug.current == $slug][0]{
    _id,
    title,
    badgeTitle,
    slug,
    description,
    image,
    showOnHome,
    "voyages": *[_type == "voyage" && references(^._id) && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
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
`,j=`
  *[_type == "experience"]{
    _id,
    title,
    slug,
    image,
    discoveryTitle,
    description
  }
`,$e={__name:"[experienceSlug]",async setup(J){let i,a;const{trackViewItemList:f}=M(),{formatVoyagesForGtm:T}=Q(),w=q(),y=s(()=>w.params.experienceSlug),k=U`*[_type == "page_experiences"][0]{
  ...
}`,l=F(),{data:c}=([i,a]=u(()=>g("page-content",()=>l.fetch(k))),i=await i,a(),i),{data:e}=([i,a]=u(()=>g(()=>`selected-experience-${y.value}`,()=>l.fetch(W,{slug:y.value}),"$t7kHVUqSfa")),i=await i,a(),i),{data:C}=([i,a]=u(()=>g("experiences-on-content-layout",()=>l.fetch(j))),i=await i,a(),i),S=s(()=>({items:C.value?.map(o=>({id:o._id,title:o.title,slug:o.slug?.current,image:o.image,type:"experiences",discoveryTitle:o.discoveryTitle||o.description||""})).filter(o=>o.image?.asset?._ref),selectedItem:e.value,pageTitle:c.value?.index?.pageTitle||"Toutes nos expériences",showOnBottom:!1})),V=s(()=>{if(!e.value?.blog)return null;const o=e.value.blog.estimatedReadingTime||0;return Math.max(1,o).toString()}),_=s(()=>(e.value?.blog?.categories||[])[0]?.title||null),D=s(()=>_.value?"secondary":null);if(G(()=>e.value?.voyages,o=>{if(o&&o.length>0){const r=T(o),p=`Experience - ${e.value?.title||"Unknown"}`;r&&r.length>0&&f({currency:"EUR",items:r,itemListName:p})}},{immediate:!0}),e.value){const o=O();z({seoData:e.value.seo||e.value.blog?.seo||{},content:e.value,pageType:"article",slug:e.value.slug?.current,structuredData:e.value.blog?K(e.value.blog,`https://odysway.com/experiences/${e.value.slug.current}`,o):null,breadcrumbs:[{name:"Accueil",url:"https://odysway.com"},{name:"Expériences",url:"https://odysway.com/experiences"},{name:e.value.title,url:`https://odysway.com/experiences/${e.value.slug.current}`}]})}return(o,r)=>{const p=N,B=R,$=E,A=L,I=P;return d(),m(I,{"selected-experience":t(e),"page-content":t(c),"display-divider":!0,"displayed-data":t(S),type:"experiences"},{content:n(()=>[H("div",null,[b(p,{"is-search":!0,"selected-experience":t(e),voyages:t(e).voyages,"page-content":t(c)},null,8,["selected-experience","voyages","page-content"]),t(e)?.blog?(d(),m(B,{key:0,class:"mt-12",title:t(e).blog.title,description:t(e).blog.description,image:t(e).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":t(_),"badge-color":t(D),"reading-time":t(V),"published-at":t(e).blog.publishedAt,author:t(e).blog.author?.name,"author-photo":t(e).blog.author?.image,"author-role":t(e).blog.author?.position},{title:n(()=>[h(x(t(e).blog.title),1)]),introduction:n(()=>[h(x(t(e).blog.description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role"])):v("",!0),t(e)?.blog?(d(),m(A,{key:1,title:t(e).blog.title,subtitle:t(e).blog.excerpt},{content:n(()=>[b($,{value:t(e).blog.body},null,8,["value"])]),_:1},8,["title","subtitle"])):v("",!0)])]),_:1},8,["selected-experience","page-content","displayed-data"])}}};export{$e as default};

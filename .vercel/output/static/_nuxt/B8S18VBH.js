import{a as L}from"./ChDnKUib.js";import{_ as N}from"./DXwnFpsO.js";import{_ as R}from"./BNmhFpZt.js";import{_ as E}from"./hzcv8Xke.js";import{_ as q}from"./BkvSo_uw.js";import{d as O,g as P,u as U,w as u,O as F,e as m,f as r,h as t,a as g,c as s,o as d,m as G,i as b,v as h,t as v,n as x,A as H,au as Q,L as z}from"./C_h2DYOn.js";import{u as K}from"./DFakivn3.js";import{d as M}from"./DEqiGLbl.js";import"./CykoxQ89.js";import"./B9ff861V.js";import"./COvYSwLT.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./CObX9U3n.js";import"./DIeuEC5d.js";import"./BLs7WySm.js";import"./qaQVVOdr.js";import"./Bk05Vh6f.js";import"./C6XDyYT_.js";import"./ChxT7FyK.js";import"./BFZMOqdn.js";import"./D-Vwsrgj.js";import"./DpXb_68Z.js";import"./ChEw6W4A.js";import"./BT7uebgC.js";import"./BjsqtvLj.js";import"./xxKVO4VZ.js";import"./DFPoPZQf.js";import"./Dl2u_VAm.js";import"./Ndey5mom.js";import"./CfsMHgvw.js";import"./CiyfkAXz.js";import"./DcoOdQ4K.js";const W=`
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
`,$e={__name:"[experienceSlug]",async setup(J){let i,a;const{trackViewItemList:f}=z(),{formatVoyagesForGtm:T}=Q(),w=O(),y=s(()=>w.params.experienceSlug),C=P`*[_type == "page_experiences"][0]{
  ...
}`,l=U(),{data:c}=([i,a]=u(()=>g("page-content",()=>l.fetch(C))),i=await i,a(),i),{data:e}=([i,a]=u(()=>g(()=>`selected-experience-${y.value}`,()=>l.fetch(W,{slug:y.value}),"$t7kHVUqSfa")),i=await i,a(),i),{data:k}=([i,a]=u(()=>g("experiences-on-content-layout",()=>l.fetch(j))),i=await i,a(),i),S=s(()=>({items:k.value?.map(o=>({id:o._id,title:o.title,slug:o.slug?.current,image:o.image,type:"experiences",discoveryTitle:o.discoveryTitle||o.description||""})).filter(o=>o.image?.asset?._ref),selectedItem:e.value,pageTitle:c.value?.index?.pageTitle||"Toutes nos expériences",showOnBottom:!1})),V=s(()=>{if(!e.value?.blog)return null;const o=e.value.blog.estimatedReadingTime||0;return Math.max(1,o).toString()}),_=s(()=>(e.value?.blog?.categories||[])[0]?.title||null),D=s(()=>_.value?"secondary":null);if(F(()=>e.value?.voyages,o=>{if(o&&o.length>0){const n=T(o),p=`Experience - ${e.value?.title||"Unknown"}`;n&&n.length>0&&f({currency:"EUR",items:n,itemListName:p})}},{immediate:!0}),e.value){const o=H();K({seoData:e.value.seo||e.value.blog?.seo||{},content:e.value,pageType:"article",slug:e.value.slug?.current,structuredData:e.value.blog?M(e.value.blog,`https://odysway.com/experiences/${e.value.slug.current}`,o):null,breadcrumbs:[{name:"Accueil",url:"https://odysway.com"},{name:"Expériences",url:"https://odysway.com/experiences"},{name:e.value.title,url:`https://odysway.com/experiences/${e.value.slug.current}`}]})}return(o,n)=>{const p=L,A=N,$=R,B=E,I=q;return d(),m(I,{"selected-experience":t(e),"page-content":t(c),"display-divider":!0,"displayed-data":t(S),type:"experiences"},{content:r(()=>[G("div",null,[b(p,{"is-search":!0,"selected-experience":t(e),voyages:t(e).voyages,"page-content":t(c)},null,8,["selected-experience","voyages","page-content"]),t(e)?.blog?(d(),m(A,{key:0,class:"mt-12",title:t(e).blog.title,description:t(e).blog.description,image:t(e).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":t(_),"badge-color":t(D),"reading-time":t(V),"published-at":t(e).blog.publishedAt,author:t(e).blog.author?.name,"author-photo":t(e).blog.author?.image,"author-role":t(e).blog.author?.position},{title:r(()=>[h(v(t(e).blog.title),1)]),introduction:r(()=>[h(v(t(e).blog.description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role"])):x("",!0),t(e)?.blog?(d(),m(B,{key:1,title:t(e).blog.title,subtitle:t(e).blog.excerpt},{content:r(()=>[b($,{value:t(e).blog.body},null,8,["value"])]),_:1},8,["title","subtitle"])):x("",!0)])]),_:1},8,["selected-experience","page-content","displayed-data"])}}};export{$e as default};

import{a as $}from"./ChDnKUib.js";import{_ as B}from"./DXwnFpsO.js";import{_ as I}from"./BNmhFpZt.js";import{_ as L}from"./hzcv8Xke.js";import{_ as N}from"./BkvSo_uw.js";import{d as R,u as F,w as p,O as P,e as n,f as l,h as e,a as d,c as s,o as c,m as G,n as y,v as b,t as v,i as O,A as Q,au as U,L as E}from"./C_h2DYOn.js";import{u as z}from"./DFakivn3.js";import{d as H}from"./DEqiGLbl.js";import"./CykoxQ89.js";import"./B9ff861V.js";import"./COvYSwLT.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./CObX9U3n.js";import"./DIeuEC5d.js";import"./BLs7WySm.js";import"./qaQVVOdr.js";import"./Bk05Vh6f.js";import"./C6XDyYT_.js";import"./ChxT7FyK.js";import"./BFZMOqdn.js";import"./D-Vwsrgj.js";import"./DpXb_68Z.js";import"./ChEw6W4A.js";import"./BT7uebgC.js";import"./BjsqtvLj.js";import"./xxKVO4VZ.js";import"./DFPoPZQf.js";import"./Dl2u_VAm.js";import"./Ndey5mom.js";import"./CfsMHgvw.js";import"./CiyfkAXz.js";import"./DcoOdQ4K.js";const K=`
  *[_type == "page_thematiques"][0]{
    ...
  }
`,M=`
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
`,At={__name:"[thematiqueSlug]",async setup(Z){let a,i;const{trackViewItemList:f}=E(),{formatVoyagesForGtm:w}=U(),T=R(),_=s(()=>T.params.thematiqueSlug),u=F(),{data:m}=([a,i]=p(async()=>d("page-content",async()=>{try{return await u.fetch(K)||{}}catch{return{}}})),a=await a,i(),a),{data:t}=([a,i]=p(async()=>d(()=>`category-sanity-${_.value}`,async()=>{try{return await u.fetch(M,{slug:_.value})}catch{return null}},"$5kAZ3aplFC")),a=await a,i(),a),{data:x}=([a,i]=p(async()=>d("categories-on-content-layout",async()=>{try{return await u.fetch(W)||[]}catch{return[]}})),a=await a,i(),a),q=s(()=>({items:x.value?.map(o=>({id:o._id,title:o.title,slug:o.slug?.current,image:o.image,type:"thematiques",discoveryTitle:o.discoveryTitle||o.description||""})).filter(o=>o.image?.asset?._ref),selectedItem:t.value,pageTitle:m.value?.index?.pageTitle||"Toutes nos thématiques",showOnBottom:!1})),C=s(()=>{if(!t.value?.blog)return null;const o=t.value.blog.estimatedReadingTime||0;return Math.max(1,o).toString()}),h=s(()=>(t.value?.blog?.categories||[])[0]?.title||null),k=s(()=>h.value?"secondary":null);if(P(()=>t.value?.voyages,o=>{if(o&&o.length>0){const r=w(o),g=`Thematique - ${t.value?.title||"Unknown"}`;r&&r.length>0&&f({currency:"EUR",items:r,itemListName:g})}},{immediate:!0}),t.value){const o=Q();z({seoData:t.value.seo||t.value.blog?.seo||{},content:t.value,pageType:"article",slug:t.value.slug?.current,structuredData:t.value.blog?H(t.value.blog,`https://odysway.com/thematiques/${t.value.slug.current}`,o):null,breadcrumbs:[{name:"Accueil",url:"https://odysway.com"},{name:"Thématiques",url:"https://odysway.com/thematiques"},{name:t.value.title,url:`https://odysway.com/thematiques/${t.value.slug.current}`}]})}return(o,r)=>{const g=$,S=B,V=I,A=L,D=N;return c(),n(D,{"selected-category":e(t),"page-content":e(m),"display-divider":!0,"displayed-data":e(q),type:"thematiques"},{content:l(()=>[G("div",null,[e(t)?(c(),n(g,{key:0,"is-search":!0,"selected-category":e(t),voyages:e(t).voyages,"page-content":e(m)},null,8,["selected-category","voyages","page-content"])):y("",!0)]),e(t)?.blog?(c(),n(S,{key:0,class:"mt-12",title:e(t).blog.title,description:e(t).blog.description,image:e(t).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":e(h),"badge-color":e(k),"reading-time":e(C),"published-at":e(t).blog.publishedAt,author:e(t).blog.author?.name,"author-photo":e(t).blog.author?.image,"author-role":e(t).blog.author?.position},{title:l(()=>[b(v(e(t).blog.title),1)]),introduction:l(()=>[b(v(e(t).blog.description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role"])):y("",!0),e(t)?.blog?(c(),n(A,{key:1,title:e(t).blog.title,subtitle:e(t).blog.excerpt},{content:l(()=>[O(V,{value:e(t).blog.body},null,8,["value"])]),_:1},8,["title","subtitle"])):y("",!0)]),_:1},8,["selected-category","page-content","displayed-data"])}}};export{At as default};

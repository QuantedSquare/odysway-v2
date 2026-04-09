import{a as A}from"./B3OUA3mF.js";import{_ as L}from"./o3kl9E5N.js";import{_ as P}from"./DNgvOCQF.js";import{_ as $}from"./BJunrQ22.js";import{_ as B}from"./DhM95Zet.js";import{d as F,u as N,w as p,P as O,e as u,f as c,h as i,a as y,an as M,c as s,o as d,m as U,i as _,x as b,t as h,p as v,B as j,ak as H,M as G}from"./BL9fbG64.js";import{u as Q}from"./DDbkjYDv.js";import{d as E}from"./DnvDXKgj.js";import"./rK2S_7Sw.js";import"./BG69C3vn.js";import"./D9pJy1lO.js";import"./DQN8drov.js";import"./D2y-zQ2J.js";import"./BLZOjkac.js";import"./CUzVmzla.js";import"./XJK7mQDn.js";import"./bzvY4d47.js";import"./CrvLZNZ-.js";import"./C5rMqzIG.js";import"./BDat7HJs.js";import"./CqdWF_o8.js";import"./U5S_1qbW.js";import"./CtKYGlKH.js";import"./CEE8k1hT.js";import"./BijPqpoI.js";import"./DWX7X6Ub.js";import"./CqMooMqM.js";import"./mRAfk3TE.js";import"./DB-riz01.js";import"./CBDcPeBp.js";import"./DHkiWKsE.js";import"./BLYU2Do4.js";import"./Cs-ho-TV.js";const K=`
  *[_type == "region" && slug.current == $slug][0]{
    _id,
    nom,
    slug,
    meta_description,
    image,
    interjection,
    showOnHome,
    "destinations": *[_type == "destination" && references(^._id)]{
      _id,
      title,
      slug,
      image,
      description,
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
      }
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
  *[_type == "destination" && slug.current == $slug][0]{
    _id,
    title,
    badgeTitle,
    slug,
    metaDescription,
    image,
    interjection,
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
`,Y=`
  *[_type == "destination"]{
    _id,
    title,
    nom,
    slug,
    image,
    metaDescription,
    description
  }
`,Vt={__name:"[destinationSlug]",async setup(z){let o,r;const{trackViewItemList:f}=G(),{formatVoyagesForGtm:T}=H(),w=F(),l=s(()=>w.params.destinationSlug),x=s(()=>["europe","afrique","asie","amerique-du-sud","amerique-du-nord","amerique-centrale","moyen-orient","france"].includes(l.value)),m=N(),{data:t}=([o,r]=p(async()=>y(()=>`destination-${l.value}`,async()=>{if(x.value){const e=await m.fetch(K,{slug:l.value}),a=M.flatMap(e.destinations.map(n=>n.voyages));return{interjection:e.interjection,meta_description:e.meta_description,slug:e.slug,blog:e.blog,title:e.nom,image:e?.image||a[0]?.image,voyages:a}}else return m.fetch(W,{slug:l.value})},"$LsMhCYUYi0")),o=await o,r(),o),{data:D}=([o,r]=p(()=>y("destinations-on-content-layout",()=>m.fetch(Y))),o=await o,r(),o),C=s(()=>({items:D.value?.map(e=>({id:e._id,title:e.title||e.nom,slug:e.slug?.current,image:e.image,type:"destinations",discoveryTitle:e.metaDescription||e.meta_description||e.description||""})).filter(e=>e.image?.asset?._ref),selectedItem:t.value,pageTitle:"Toutes nos destinations",showOnBottom:!1})),S=s(()=>{if(!t.value?.blog)return null;const e=t.value.blog.estimatedReadingTime||0;return Math.max(1,e).toString()}),g=s(()=>(t.value?.blog?.categories||[])[0]?.title||null),k=s(()=>g.value?"secondary":null);if(O(()=>t.value?.voyages,e=>{if(e&&e.length>0){const a=T(e),n=`Destination - ${t.value?.title||t.value?.nom||"Unknown"}`;a&&a.length>0&&f({currency:"EUR",items:a,itemListName:n})}},{immediate:!0}),t.value){const e=j();Q({seoData:t.value.seo||t.value.blog?.seo||{},content:t.value,pageType:"article",slug:t.value.slug?.current,structuredData:t.value.blog?E(t.value.blog,`https://odysway.com/destinations/${t.value.slug.current}`,e):null,breadcrumbs:[{name:"Accueil",url:"https://odysway.com"},{name:"Destinations",url:"https://odysway.com/destinations"},{name:t.value.title,url:`https://odysway.com/destinations/${t.value.slug.current}`}]})}return(e,a)=>{const n=A,I=L,R=P,V=$,q=B;return d(),u(q,{type:"destinations","selected-destination":i(t),"display-divider":!0,"displayed-data":i(C)},{content:c(()=>[U("div",null,[_(n,{"is-search":!0,voyages:i(t).voyages},null,8,["voyages"])]),i(t).blog?(d(),u(I,{key:0,class:"mt-12",title:i(t).blog.title,description:i(t).blog.description,image:i(t).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":i(g),"badge-color":i(k),"reading-time":i(S),"published-at":i(t).blog.publishedAt,author:i(t).blog.author?.name,"author-photo":i(t).blog.author?.image,"author-role":i(t).blog.author?.position},{title:c(()=>[b(h(i(t).blog.title),1)]),introduction:c(()=>[b(h(i(t).blog.description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role"])):v("",!0),i(t).blog?(d(),u(V,{key:1,title:"categorySanity.blog.title",subtitle:"categorySanity.blog.excerpt"},{content:c(()=>[_(R,{value:i(t).blog.body},null,8,["value"])]),_:1})):v("",!0)]),_:1},8,["selected-destination","displayed-data"])}}};export{Vt as default};

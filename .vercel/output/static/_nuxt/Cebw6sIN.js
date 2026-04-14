import{a as V}from"./ChDnKUib.js";import{_ as q}from"./DXwnFpsO.js";import{_ as $}from"./BNmhFpZt.js";import{_ as O}from"./hzcv8Xke.js";import{_ as P}from"./BkvSo_uw.js";import{d as B,u as F,w as p,O as N,e as u,f as c,h as i,a as y,ax as U,c as s,o as d,m as j,i as _,v as b,t as h,n as v,A as H,au as M,L as G}from"./C_h2DYOn.js";import{u as Q}from"./DFakivn3.js";import{d as E}from"./DEqiGLbl.js";import"./CykoxQ89.js";import"./B9ff861V.js";import"./COvYSwLT.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./CObX9U3n.js";import"./DIeuEC5d.js";import"./BLs7WySm.js";import"./qaQVVOdr.js";import"./Bk05Vh6f.js";import"./C6XDyYT_.js";import"./ChxT7FyK.js";import"./BFZMOqdn.js";import"./D-Vwsrgj.js";import"./DpXb_68Z.js";import"./ChEw6W4A.js";import"./BT7uebgC.js";import"./BjsqtvLj.js";import"./xxKVO4VZ.js";import"./DFPoPZQf.js";import"./Dl2u_VAm.js";import"./Ndey5mom.js";import"./CfsMHgvw.js";import"./CiyfkAXz.js";import"./DcoOdQ4K.js";const K=`
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
`,Lt={__name:"[destinationSlug]",async setup(z){let o,r;const{trackViewItemList:f}=G(),{formatVoyagesForGtm:T}=M(),w=B(),l=s(()=>w.params.destinationSlug),x=s(()=>["europe","afrique","asie","amerique-du-sud","amerique-du-nord","amerique-centrale","moyen-orient","france"].includes(l.value)),m=F(),{data:t}=([o,r]=p(async()=>y(()=>`destination-${l.value}`,async()=>{if(x.value){const e=await m.fetch(K,{slug:l.value}),a=U.flatMap(e.destinations.map(n=>n.voyages));return{interjection:e.interjection,meta_description:e.meta_description,slug:e.slug,blog:e.blog,title:e.nom,image:e?.image||a[0]?.image,voyages:a}}else return m.fetch(W,{slug:l.value})},"$LsMhCYUYi0")),o=await o,r(),o),{data:D}=([o,r]=p(()=>y("destinations-on-content-layout",()=>m.fetch(Y))),o=await o,r(),o),C=s(()=>({items:D.value?.map(e=>({id:e._id,title:e.title||e.nom,slug:e.slug?.current,image:e.image,type:"destinations",discoveryTitle:e.metaDescription||e.meta_description||e.description||""})).filter(e=>e.image?.asset?._ref),selectedItem:t.value,pageTitle:"Toutes nos destinations",showOnBottom:!1})),S=s(()=>{if(!t.value?.blog)return null;const e=t.value.blog.estimatedReadingTime||0;return Math.max(1,e).toString()}),g=s(()=>(t.value?.blog?.categories||[])[0]?.title||null),k=s(()=>g.value?"secondary":null);if(N(()=>t.value?.voyages,e=>{if(e&&e.length>0){const a=T(e),n=`Destination - ${t.value?.title||t.value?.nom||"Unknown"}`;a&&a.length>0&&f({currency:"EUR",items:a,itemListName:n})}},{immediate:!0}),t.value){const e=H();Q({seoData:t.value.seo||t.value.blog?.seo||{},content:t.value,pageType:"article",slug:t.value.slug?.current,structuredData:t.value.blog?E(t.value.blog,`https://odysway.com/destinations/${t.value.slug.current}`,e):null,breadcrumbs:[{name:"Accueil",url:"https://odysway.com"},{name:"Destinations",url:"https://odysway.com/destinations"},{name:t.value.title,url:`https://odysway.com/destinations/${t.value.slug.current}`}]})}return(e,a)=>{const n=V,A=q,I=$,L=O,R=P;return d(),u(R,{type:"destinations","selected-destination":i(t),"display-divider":!0,"displayed-data":i(C)},{content:c(()=>[j("div",null,[_(n,{"is-search":!0,voyages:i(t).voyages},null,8,["voyages"])]),i(t).blog?(d(),u(A,{key:0,class:"mt-12",title:i(t).blog.title,description:i(t).blog.description,image:i(t).blog.displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":i(g),"badge-color":i(k),"reading-time":i(S),"published-at":i(t).blog.publishedAt,author:i(t).blog.author?.name,"author-photo":i(t).blog.author?.image,"author-role":i(t).blog.author?.position},{title:c(()=>[b(h(i(t).blog.title),1)]),introduction:c(()=>[b(h(i(t).blog.description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role"])):v("",!0),i(t).blog?(d(),u(L,{key:1,title:"categorySanity.blog.title",subtitle:"categorySanity.blog.excerpt"},{content:c(()=>[_(I,{value:i(t).blog.body},null,8,["value"])]),_:1})):v("",!0)]),_:1},8,["selected-destination","displayed-data"])}}};export{Lt as default};

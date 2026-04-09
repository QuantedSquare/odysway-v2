import{_ as x}from"./o3kl9E5N.js";import{_ as w}from"./DNgvOCQF.js";import{_ as C}from"./BJunrQ22.js";import{d as S,u as T,w as k,W as B,X as D,e as n,f as r,V,a as R,o as u,h as e,x as m,t as p,p as d,i as A,c as s,B as E}from"./BL9fbG64.js";import{u as I}from"./DDbkjYDv.js";import{d as N}from"./DnvDXKgj.js";import"./mRAfk3TE.js";import"./DQN8drov.js";import"./D2y-zQ2J.js";import"./CqdWF_o8.js";import"./U5S_1qbW.js";import"./DB-riz01.js";import"./CBDcPeBp.js";const $=`
  *[_type == "blog" && slug.current == $slug][0]{
    ...,
    author->{
      _id,
      name,
      image,
      position,
      description
    },
    categories[]->{
      _id,
      title
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
    body[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          url,
          metadata
        }
      }
    },
    "numberOfCharacters": length(pt::text(body)),
    "estimatedWordCount": round(length(pt::text(body)) / 5),
    "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
  }
`,L={__name:"[blogSlug]",async setup(M){let a,l;const i=S(),g=s(()=>i.params.blogSlug),_=T(),{data:t}=([a,l]=k(()=>R("blog",()=>_.fetch($,{slug:g.value}))),a=await a,l(),a);if(!t.value)throw B({statusCode:404,statusMessage:"Page not found"});const h=s(()=>{const o=t.value?.estimatedReadingTime||0;return Math.max(1,o).toString()}),c=s(()=>(t.value?.categories||[])[0]?.title||null),y=s(()=>c.value?"secondary":null);return D(()=>{if(!t.value)return;const o=E();I({seoData:t.value.seo||{},content:t.value,pageType:"article",slug:t.value.slug?.current,structuredData:N(t.value,`https://odysway.com${i.path}`,o),breadcrumbs:[{name:"Blog",url:"https://odysway.com/blog"},{name:t.value.seo?.metaTitle||t.value.title,url:`https://odysway.com${i.path}`}]})}),(o,P)=>{const b=x,f=w,v=C;return u(),n(V,{class:"pt-4 py-md-0 my-0",fluid:""},{default:r(()=>[e(t)?(u(),n(b,{key:0,title:e(t).title,description:e(t).description,image:e(t).displayedImg,"background-color":"soft-blush","introduction-color":"grey","title-color":"primary","avatar-size":"60","blog-type":e(c),"badge-color":e(y),"reading-time":e(h),"published-at":e(t).publishedAt,author:e(t).author?.name,"author-photo":e(t).author?.image,"author-role":e(t).author?.position,"author-description":e(t).author?.description},{title:r(()=>[m(p(e(t).title),1)]),introduction:r(()=>[m(p(e(t).description),1)]),_:1},8,["title","description","image","blog-type","badge-color","reading-time","published-at","author","author-photo","author-role","author-description"])):d("",!0),e(t)?(u(),n(v,{key:1},{content:r(()=>[A(f,{value:e(t).body},null,8,["value"])]),_:1})):d("",!0)]),_:1})}}};export{L as default};

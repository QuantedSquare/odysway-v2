import{_ as d}from"./DDKZt3RU.js";import{_ as g}from"./BNmhFpZt.js";import{_ as f}from"./DBHii52w.js";import{_ as v}from"./hzcv8Xke.js";import{g as b,u as h,w as S,e as n,f as c,V as C,a as w,o as a,i as _,h as e,v as s,t as i,n as o}from"./C_h2DYOn.js";import{u as D}from"./DFakivn3.js";import{a as T,b as V}from"./DEqiGLbl.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./Ndey5mom.js";import"./Dl2u_VAm.js";const F={__name:"entreprise",async setup(N){let l,p;const k=b`*[_type == "entreprise"][0]{
  ...,
  heroSection{
    image,
    title
  },
  contentBlock1[]{
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
  contentBlock2[]{
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
  contentBlock3[]{
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
  contentBlock4[]{
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
  contentBlock5[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        _ref,
        url,
        metadata
      }
    }
  },
  ctaButton
}`,B=h(),{data:t}=([l,p]=S(()=>w("entreprise",()=>B.fetch(k))),l=await l,p(),l);if(t.value){const m={title:"Tribus par Odysway",description:"Des expériences uniques pour votre entreprise : découvrez nos séminaires et voyages Tribus",image:t.value.heroSection?.image};D({seoData:t.value?.seo,content:m,pageType:"website",slug:"entreprise",baseUrl:"/entreprise",structuredData:[T({description:t.value?.seo?.metaDescription||m.description}),V()]})}return(m,q)=>{const x=d,r=g,u=f,y=v;return a(),n(C,{class:"pt-4 py-md-0 my-0 px-2 px-md-4",fluid:""},{default:c(()=>[_(x,{"image-src":e(t).heroSection.image},{title:c(()=>[s(i(e(t).heroSection.title),1)]),_:1},8,["image-src"]),_(y,null,{content:c(()=>[e(t).contentBlock1?(a(),n(r,{key:0,value:e(t).contentBlock1,class:"mb-8"},null,8,["value"])):o("",!0),e(t).ctaButton?(a(),n(u,{key:1,link:e(t).ctaButton.link,external:e(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-1"},{text:c(()=>[s(i(e(t).ctaButton.text),1)]),_:1},8,["link","external"])):o("",!0),e(t).contentBlock2?(a(),n(r,{key:2,value:e(t).contentBlock2,class:"mb-8"},null,8,["value"])):o("",!0),e(t).ctaButton?(a(),n(u,{key:3,link:e(t).ctaButton.link,external:e(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-2"},{text:c(()=>[s(i(e(t).ctaButton.text),1)]),_:1},8,["link","external"])):o("",!0),e(t).contentBlock3?(a(),n(r,{key:4,value:e(t).contentBlock3,class:"mb-8"},null,8,["value"])):o("",!0),e(t).ctaButton?(a(),n(u,{key:5,link:e(t).ctaButton.link,external:e(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-3"},{text:c(()=>[s(i(e(t).ctaButton.text),1)]),_:1},8,["link","external"])):o("",!0),e(t).contentBlock4?(a(),n(r,{key:6,value:e(t).contentBlock4,class:"mb-8"},null,8,["value"])):o("",!0),e(t).contentBlock5?(a(),n(r,{key:7,value:e(t).contentBlock5,class:"mb-8"},null,8,["value"])):o("",!0),e(t).ctaButton?(a(),n(u,{key:8,link:e(t).ctaButton.link,external:e(t).ctaButton.external,class:"my-8","cta-id":"page-entreprise-btn-4"},{text:c(()=>[s(i(e(t).ctaButton.text),1)]),_:1},8,["link","external"])):o("",!0)]),_:1})]),_:1})}}};export{F as default};

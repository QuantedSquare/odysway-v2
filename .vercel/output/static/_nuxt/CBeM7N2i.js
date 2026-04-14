import{_ as w}from"./BKt9MEAt.js";import{d as k,u as C,w as V,a as T,o as t,e as o,f as s,i as l,N as i,h as a,C as c,s as S,v as b,H as A,l as u,F as B,E as D,n as p,G as N,V as R,c as E}from"./C_h2DYOn.js";import{r as $}from"./Dl2u_VAm.js";import"./DFPoPZQf.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./DLaRtwEQ.js";const F={key:0,class:"text-body-1 font-weight-bold mx-4 text-white"},j={key:1,class:"text-body-1 font-weight-bold mx-4 text-white"},q=`
  *[_type == "homePage"][0]{
    reviews{
      reviews[]->{
        _id,
        author,
        authorAge,
        date,
        photo,
        rating,
        text,
        voyage->{
          slug,
          title,
        }
      }
    },
  }
`,U={__name:"CommonReviewContainer",async setup(z){let n,m;const d=k(),f=C(),{data:v}=([n,m]=V(async()=>T("home-reviews",async()=>{try{return await f.fetch(q)||[]}catch(e){return console.error("Error fetching reviews:",e),[]}},{server:!0})),n=await n,m(),n),r=E(()=>v.value?.reviews?.reviews?.map(e=>({...e,voyageSlug:e.voyage?.slug?.current,voyageTitle:e.voyage?.title})).slice(0,3));return(e,_)=>{const g=w,h=A;return t(),o(R,{fluid:""},{default:s(()=>[l(i,{align:"center",class:"position-relative px-0"},{default:s(()=>[a(d).name==="index"?(t(),o(c,{key:0,cols:"12",class:"text-h2 my-4"},{default:s(()=>[S(e.$slots,"title")]),_:3})):(t(),o(c,{key:1,cols:"12",class:"text-h2 my-md-4 text-primary"},{default:s(()=>[..._[0]||(_[0]=[b(" Ils en parlent mieux que nous ",-1)])]),_:1}))]),_:3}),l(h,null,{default:s(()=>[a(r)&&a(r).length>0?(t(),o(i,{key:0},{default:s(()=>[(t(!0),u(B,null,D(a(r),(y,x)=>(t(),o(c,{key:y._id+x,cols:"12",sm:"6",md:"4",class:"px-0 px-md-3"},{default:s(()=>[l(g,{review:y},null,8,["review"])]),_:2},1024))),128))]),_:1})):p("",!0),a(r)&&a(r).length>0?(t(),o(i,{key:1,justify:"center",class:"mt-12"},{default:s(()=>[l(N,{to:"/avis-voyageurs",color:"primary",height:"62",size:"large",class:"text-decoration-none"},{default:s(()=>[a(d).name==="index"?(t(),u("div",F,[$(e.$slots,"cta",{mdcUnwrap:"p"})])):(t(),u("div",j," Afficher plus de témoignages "))]),_:3})]),_:3})):p("",!0)]),_:3})]),_:3})}}};export{U as default};

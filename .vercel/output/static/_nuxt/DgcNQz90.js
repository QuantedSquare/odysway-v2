import{_ as W}from"./C6XDyYT_.js";import{_ as j}from"./BKt9MEAt.js";import{_ as q,d as z,b as U,u as H,w as I,a as M,k as Q,O as V,db as G,dc as J,o as l,e as i,f as e,i as s,V as K,N as p,C as m,p as P,h as t,v as X,t as Y,a0 as Z,n as ee,m as te,l as B,F as A,E,aO as N,r as _,c as f,H as ae,ax as le}from"./C_h2DYOn.js";import"./DFPoPZQf.js";import"./2eRY76U3.js";import"./B1pha2ri.js";import"./DLaRtwEQ.js";const se=`
  *[_type == "review" && voyage->slug.current == $voyageSlug]{
    _id,
    author,
    authorAge,
    date,
    photo,
    rating,
    text,
    voyage->{
      _id,
      title,
      slug
    }
  }
`,oe={__name:"ReviewCarousel",props:{centerTitle:{type:Boolean,default:!1},color:{type:String,default:"secondary"},reviewsSection:{type:Object,required:!0}},async setup(u){let c,y;const g=z(),{mdAndUp:R,smAndUp:T}=U(),o=_(null),w=_(null),$=_(null),L=H(),{data:O}=([c,y]=I(()=>M("reviews-"+g.params.voyageSlug,()=>L.fetch(se,{voyageSlug:g.params.voyageSlug}),"$LiywC0s0FR")),c=await c,y(),c),n=f(()=>le.uniqBy(O.value,"text")||[]),x=()=>{N(()=>{if(o.value){const a=o.value.$el||o.value;a&&a.scrollWidth>a.clientWidth&&(w.value=a)}})};Q(()=>{x()}),V(()=>n.value,a=>{a&&a.length>0&&N()}),V(()=>o.value,()=>{o.value&&x()});const D=f(()=>R.value&&n.value&&n.value.length>3),{x:h,arrivedState:C}=G(w,{behavior:"smooth"}),{width:v}=J(o),S=f(()=>v.value&&v.value>=892?400:v?.value||300);return(a,d)=>{const k=W,b=j,F=ae;return l(),i(F,null,{default:e(()=>[s(K,{id:"reviews-container",fluid:"",class:"px-0 py-0"},{default:e(()=>[s(p,{align:"center",justify:"center",class:"px-2 px-md-0"},{default:e(()=>[s(m,{cols:"12",md:"10",class:P(["text-h4 mb-0 mt-2 mb-2 mb-md-6 font-weight-bold",{"text-md-center text-start":u.centerTitle,"d-none":t(n).length===0}])},{default:e(()=>[X(Y(u.reviewsSection.title),1)]),_:1},8,["class"]),s(Z),t(D)?(l(),i(m,{key:0,cols:"12",md:"auto",class:"d-flex ga-2"},{default:e(()=>[s(k,{"arrived-state":t(C).left,color:u.color,orientation:"left",onClick:d[0]||(d[0]=r=>h.value-=t(S))},null,8,["arrived-state","color"]),s(k,{"arrived-state":t(C).right,color:u.color,orientation:"right",onClick:d[1]||(d[1]=r=>h.value+=t(S))},null,8,["arrived-state","color"])]),_:1})):ee("",!0)]),_:1}),te("div",{ref_key:"itemsList",ref:$},[t(T)?(l(),i(p,{key:0,ref_key:"scrollContainer",ref:o,class:"flex-nowrap overflow-auto hidden-scroll mb-4"},{default:e(()=>[(l(!0),B(A,null,E(t(n),r=>(l(),i(m,{key:r.id,cols:"10",sm:"6",md:"4",class:"pr-0 pr-md-16"},{default:e(()=>[s(b,{review:r,"is-travel-page":!0},null,8,["review"])]),_:2},1024))),128))]),_:1},512)):(l(),i(p,{key:1,class:"mb-8"},{default:e(()=>[(l(!0),B(A,null,E(t(n).slice(0,3),r=>(l(),i(m,{key:r.id,cols:"12",class:"pb-0"},{default:e(()=>[s(b,{review:r,"is-travel-page":!0},null,8,["review"])]),_:2},1024))),128))]),_:1}))],512)]),_:1})]),_:1})}}},ve=q(oe,[["__scopeId","data-v-b3e41997"]]);export{ve as default};

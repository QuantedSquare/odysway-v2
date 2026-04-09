import{_ as O}from"./C5rMqzIG.js";import{_ as W}from"./AbPByZxN.js";import{_ as j,d as z,b as I,u as U,w as G,a as M,k as P,P as V,d7 as Q,d8 as H,o as l,e as i,f as e,i as s,V as J,O as p,D as m,q as K,h as t,x as X,t as Y,a1 as Z,p as ee,m as te,l as B,F as A,G as R,n as T,r as _,c as f,I as ae,an as le}from"./BL9fbG64.js";import"./mRAfk3TE.js";import"./DQN8drov.js";import"./D2y-zQ2J.js";import"./B1nwL4Bq.js";const se=`
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
`,oe={__name:"ReviewCarousel",props:{centerTitle:{type:Boolean,default:!1},color:{type:String,default:"secondary"},reviewsSection:{type:Object,required:!0}},async setup(u){let c,y;const g=z(),{mdAndUp:$,smAndUp:D}=I(),o=_(null),w=_(null),E=_(null),L=U(),{data:N}=([c,y]=G(()=>M("reviews-"+g.params.voyageSlug,()=>L.fetch(se,{voyageSlug:g.params.voyageSlug}),"$LiywC0s0FR")),c=await c,y(),c),n=f(()=>le.uniqBy(N.value,"text")||[]),x=()=>{T(()=>{if(o.value){const a=o.value.$el||o.value;a&&a.scrollWidth>a.clientWidth&&(w.value=a)}})};P(()=>{x()}),V(()=>n.value,a=>{a&&a.length>0&&T()}),V(()=>o.value,()=>{o.value&&x()});const q=f(()=>$.value&&n.value&&n.value.length>3),{x:h,arrivedState:C}=Q(w,{behavior:"smooth"}),{width:v}=H(o),S=f(()=>v.value&&v.value>=892?400:v?.value||300);return(a,d)=>{const k=O,b=W,F=ae;return l(),i(F,null,{default:e(()=>[s(J,{id:"reviews-container",fluid:"",class:"px-0 py-0"},{default:e(()=>[s(p,{align:"center",justify:"center",class:"px-2 px-md-0"},{default:e(()=>[s(m,{cols:"12",md:"10",class:K(["text-h4 mb-0 mt-2 mb-2 mb-md-6 font-weight-bold",{"text-md-center text-start":u.centerTitle,"d-none":t(n).length===0}])},{default:e(()=>[X(Y(u.reviewsSection.title),1)]),_:1},8,["class"]),s(Z),t(q)?(l(),i(m,{key:0,cols:"12",md:"auto",class:"d-flex ga-2"},{default:e(()=>[s(k,{"arrived-state":t(C).left,color:u.color,orientation:"left",onClick:d[0]||(d[0]=r=>h.value-=t(S))},null,8,["arrived-state","color"]),s(k,{"arrived-state":t(C).right,color:u.color,orientation:"right",onClick:d[1]||(d[1]=r=>h.value+=t(S))},null,8,["arrived-state","color"])]),_:1})):ee("",!0)]),_:1}),te("div",{ref_key:"itemsList",ref:E},[t(D)?(l(),i(p,{key:0,ref_key:"scrollContainer",ref:o,class:"flex-nowrap overflow-auto hidden-scroll mb-4"},{default:e(()=>[(l(!0),B(A,null,R(t(n),r=>(l(),i(m,{key:r.id,cols:"10",sm:"6",md:"4",class:"pr-0 pr-md-16"},{default:e(()=>[s(b,{review:r,"is-travel-page":!0},null,8,["review"])]),_:2},1024))),128))]),_:1},512)):(l(),i(p,{key:1,class:"mb-8"},{default:e(()=>[(l(!0),B(A,null,R(t(n).slice(0,3),r=>(l(),i(m,{key:r.id,cols:"12",class:"pb-0"},{default:e(()=>[s(b,{review:r,"is-travel-page":!0},null,8,["review"])]),_:2},1024))),128))]),_:1}))],512)]),_:1})]),_:1})}}},ve=j(oe,[["__scopeId","data-v-b3e41997"]]);export{ve as default};

import { d as bt, u as up, a as Qc, V as fi, e as Zn, f as lt, W as Up, U as we, _ as Lu, aH as xi, bm as vy, bc as ra, o as Rs, bn as fy, C as fu, Z as Pt } from './server.mjs';
import { c } from './AvatarImg-uPpuu2qe.mjs';
import { j } from './ExpandableText-DhHAMOzy.mjs';
import { withAsyncContext, computed, mergeProps, withCtx, unref, renderSlot, createTextVNode, openBlock, createBlock, createVNode, Fragment, renderList, createCommentVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderSlot, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { a as at } from './composables-Dcwg06ZS.mjs';
import { T } from './slot-Dpt2kD0O.mjs';
import '../nitro/nitro.mjs';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'algoliasearch';
import '@sanity/client';
import 'axios';
import 'jsonwebtoken';
import 'dayjs';
import '@supabase/supabase-js';
import 'stripe';
import 'crypto';
import 'zod';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'fast-xml-parser';
import 'node:url';
import 'ipx';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'vue-dompurify-html';
import '@date-io/dayjs';
import '@mdi/js';
import 'lodash';
import 'search-insights';
import '@vueuse/core';
import 'groq';
import 'perfect-debounce';
import './getImageUrl-B94zyPkX.mjs';
import '@sanity/image-url';

const F={__name:"ReviewTraveller",__ssrInlineRender:true,props:{review:{type:Object,required:true},isTravelPage:{type:Boolean,default:false}},setup(e){const o=at();function u(h){return h.replace(/\\n|\n/g," ")}return (h,D,B,b)=>{const l=c,$=Rs,C=j;D(ssrRenderComponent(xi,mergeProps({elevation:"0"},b),{default:withCtx((H,k,q,N)=>{if(k)k(ssrRenderComponent(vy,{class:"px-2"},{default:withCtx((T,x,p,y)=>{if(x)x(ssrRenderComponent(ra,{class:"d-flex align-center ga-2"},{default:withCtx((c,n,w,d)=>{if(n)n(ssrRenderComponent(l,{"avatar-img":e.review?.photo,"avatar-size":"62",name:e.review.author},null,w,d)),n(`<div class="d-flex flex-column text-truncate" data-v-dc2442ff${d}><span class="text-h5" data-v-dc2442ff${d}>${ssrInterpolate(e.review.author)}</span>`),e.review.voyageTitle&&e.review.voyageSlug?n(ssrRenderComponent($,{to:`/voyages/${e.review.voyageSlug}`,class:["text-body-2 text-primary text-truncate pb-2",{"d-none":e.isTravelPage}]},{default:withCtx((v,R,L,xe)=>{if(R)R(`${ssrInterpolate(e.review.voyageTitle)}`);else return [createTextVNode(toDisplayString(e.review.voyageTitle),1)]}),_:1},w,d)):n("<!---->"),n("</div>");else return [createVNode(l,{"avatar-img":e.review?.photo,"avatar-size":"62",name:e.review.author},null,8,["avatar-img","name"]),createVNode("div",{class:"d-flex flex-column text-truncate"},[createVNode("span",{class:"text-h5"},toDisplayString(e.review.author),1),e.review.voyageTitle&&e.review.voyageSlug?(openBlock(),createBlock($,{key:0,to:`/voyages/${e.review.voyageSlug}`,class:["text-body-2 text-primary text-truncate pb-2",{"d-none":e.isTravelPage}]},{default:withCtx(()=>[createTextVNode(toDisplayString(e.review.voyageTitle),1)]),_:1},8,["to","class"])):createCommentVNode("",true)])]}),_:1},p,y)),x(ssrRenderComponent(fy,{class:"mt-4"},{default:withCtx((c,n,w,d)=>{if(n)n(`<div class="d-inline-flex ga-1" data-v-dc2442ff${d}><!--[-->`),ssrRenderList(+e.review.rating,v=>{n(ssrRenderComponent(fu,{key:v,src:unref(o)("/icons/orange-star.svg",{format:"webp",quality:70,width:640}),alt:"Rating stars",height:"20",width:"20"},null,w,d));}),n("<!--]--></div>");else return [createVNode("div",{class:"d-inline-flex ga-1"},[(openBlock(true),createBlock(Fragment,null,renderList(+e.review.rating,v=>(openBlock(),createBlock(fu,{key:v,src:unref(o)("/icons/orange-star.svg",{format:"webp",quality:70,width:640}),alt:"Rating stars",height:"20",width:"20"},null,8,["src"]))),128))])]}),_:1},p,y));else return [createVNode(ra,{class:"d-flex align-center ga-2"},{default:withCtx(()=>[createVNode(l,{"avatar-img":e.review?.photo,"avatar-size":"62",name:e.review.author},null,8,["avatar-img","name"]),createVNode("div",{class:"d-flex flex-column text-truncate"},[createVNode("span",{class:"text-h5"},toDisplayString(e.review.author),1),e.review.voyageTitle&&e.review.voyageSlug?(openBlock(),createBlock($,{key:0,to:`/voyages/${e.review.voyageSlug}`,class:["text-body-2 text-primary text-truncate pb-2",{"d-none":e.isTravelPage}]},{default:withCtx(()=>[createTextVNode(toDisplayString(e.review.voyageTitle),1)]),_:1},8,["to","class"])):createCommentVNode("",true)])]),_:1}),createVNode(fy,{class:"mt-4"},{default:withCtx(()=>[createVNode("div",{class:"d-inline-flex ga-1"},[(openBlock(true),createBlock(Fragment,null,renderList(+e.review.rating,c=>(openBlock(),createBlock(fu,{key:c,src:unref(o)("/icons/orange-star.svg",{format:"webp",quality:70,width:640}),alt:"Rating stars",height:"20",width:"20"},null,8,["src"]))),128))])]),_:1})]}),_:1},q,N)),k(ssrRenderComponent(Pt,{class:"text-h5 font-weight-bold text-primary mb-0 mb-md-0 pb-0 line-height px-2"},{default:withCtx((T,x,p,y)=>{if(x)x(ssrRenderComponent(C,{"clamp-lines":5,"line-height":35},{default:withCtx((c,n,w,d)=>{if(n)n(`${ssrInterpolate(u(e.review.text))}`);else return [createTextVNode(toDisplayString(u(e.review.text)),1)]}),_:1},p,y));else return [createVNode(C,{"clamp-lines":5,"line-height":35},{default:withCtx(()=>[createTextVNode(toDisplayString(u(e.review.text)),1)]),_:1})]}),_:1},q,N));else return [createVNode(vy,{class:"px-2"},{default:withCtx(()=>[createVNode(ra,{class:"d-flex align-center ga-2"},{default:withCtx(()=>[createVNode(l,{"avatar-img":e.review?.photo,"avatar-size":"62",name:e.review.author},null,8,["avatar-img","name"]),createVNode("div",{class:"d-flex flex-column text-truncate"},[createVNode("span",{class:"text-h5"},toDisplayString(e.review.author),1),e.review.voyageTitle&&e.review.voyageSlug?(openBlock(),createBlock($,{key:0,to:`/voyages/${e.review.voyageSlug}`,class:["text-body-2 text-primary text-truncate pb-2",{"d-none":e.isTravelPage}]},{default:withCtx(()=>[createTextVNode(toDisplayString(e.review.voyageTitle),1)]),_:1},8,["to","class"])):createCommentVNode("",true)])]),_:1}),createVNode(fy,{class:"mt-4"},{default:withCtx(()=>[createVNode("div",{class:"d-inline-flex ga-1"},[(openBlock(true),createBlock(Fragment,null,renderList(+e.review.rating,T=>(openBlock(),createBlock(fu,{key:T,src:unref(o)("/icons/orange-star.svg",{format:"webp",quality:70,width:640}),alt:"Rating stars",height:"20",width:"20"},null,8,["src"]))),128))])]),_:1})]),_:1}),createVNode(Pt,{class:"text-h5 font-weight-bold text-primary mb-0 mb-md-0 pb-0 line-height px-2"},{default:withCtx(()=>[createVNode(C,{"clamp-lines":5,"line-height":35},{default:withCtx(()=>[createTextVNode(toDisplayString(u(e.review.text)),1)]),_:1})]),_:1})]}),_:1},B));}}},Z=F.setup;F.setup=(e,o)=>{const u=useSSRContext();return (u.modules||(u.modules=new Set)).add("components/ReviewTraveller.vue"),Z?Z(e,o):void 0};const ge=Lu(F,[["__scopeId","data-v-dc2442ff"]]),fe=`
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
`,M={__name:"CommonReviewContainer",__ssrInlineRender:true,async setup(e){let o,u;const h=bt(),D=up(),{data:B}=([o,u]=withAsyncContext(async()=>Qc("home-reviews",async()=>{try{return await D.fetch(fe)||[]}catch(l){return console.error("Error fetching reviews:",l),[]}},{server:true})),o=await o,u(),o),b=computed(()=>B.value?.reviews?.reviews?.map(l=>({...l,voyageSlug:l.voyage?.slug?.current,voyageTitle:l.voyage?.title})).slice(0,3));return (l,$,C,H)=>{const k=Up,q=ge;$(ssrRenderComponent(fi,mergeProps({fluid:""},H),{default:withCtx((N,T$1,x,p)=>{if(T$1)T$1(ssrRenderComponent(Zn,{align:"center",class:"position-relative px-0"},{default:withCtx((y,c,n,w)=>{if(c)unref(h).name==="index"?c(ssrRenderComponent(lt,{cols:"12",class:"text-h2 my-4"},{default:withCtx((d,v,R,L)=>{if(v)ssrRenderSlot(l.$slots,"title",{},null,v,R,L);else return [renderSlot(l.$slots,"title")]}),_:3},n,w)):c(ssrRenderComponent(lt,{cols:"12",class:"text-h2 my-md-4 text-primary"},{default:withCtx((d,v,R,L)=>{if(v)v(" Ils en parlent mieux que nous ");else return [createTextVNode(" Ils en parlent mieux que nous ")]}),_:1},n,w));else return [unref(h).name==="index"?(openBlock(),createBlock(lt,{key:0,cols:"12",class:"text-h2 my-4"},{default:withCtx(()=>[renderSlot(l.$slots,"title")]),_:3})):(openBlock(),createBlock(lt,{key:1,cols:"12",class:"text-h2 my-md-4 text-primary"},{default:withCtx(()=>[createTextVNode(" Ils en parlent mieux que nous ")]),_:1}))]}),_:3},x,p)),T$1(ssrRenderComponent(k,null,{},x,p));else return [createVNode(Zn,{align:"center",class:"position-relative px-0"},{default:withCtx(()=>[unref(h).name==="index"?(openBlock(),createBlock(lt,{key:0,cols:"12",class:"text-h2 my-4"},{default:withCtx(()=>[renderSlot(l.$slots,"title")]),_:3})):(openBlock(),createBlock(lt,{key:1,cols:"12",class:"text-h2 my-md-4 text-primary"},{default:withCtx(()=>[createTextVNode(" Ils en parlent mieux que nous ")]),_:1}))]),_:3}),createVNode(k,null,{default:withCtx(()=>[unref(b)&&unref(b).length>0?(openBlock(),createBlock(Zn,{key:0},{default:withCtx(()=>[(openBlock(true),createBlock(Fragment,null,renderList(unref(b),(y,c)=>(openBlock(),createBlock(lt,{key:y._id+c,cols:"12",sm:"6",md:"4",class:"px-0 px-md-3"},{default:withCtx(()=>[createVNode(q,{review:y},null,8,["review"])]),_:2},1024))),128))]),_:1})):createCommentVNode("",true),unref(b)&&unref(b).length>0?(openBlock(),createBlock(Zn,{key:1,justify:"center",class:"mt-12"},{default:withCtx(()=>[createVNode(we,{to:"/avis-voyageurs",color:"primary",height:"62",size:"large",class:"text-decoration-none"},{default:withCtx(()=>[unref(h).name==="index"?(openBlock(),createBlock("div",{key:0,class:"text-body-1 font-weight-bold mx-4 text-white"},[T(l.$slots,"cta",{mdcUnwrap:"p"})])):(openBlock(),createBlock("div",{key:1,class:"text-body-1 font-weight-bold mx-4 text-white"}," Afficher plus de témoignages "))]),_:3})]),_:3})):createCommentVNode("",true)]),_:3})]}),_:3},C));}}},G=M.setup;M.setup=(e,o)=>{const u=useSSRContext();return (u.modules||(u.modules=new Set)).add("components/content/CommonReviewContainer.vue"),G?G(e,o):void 0};

export { M as default };
//# sourceMappingURL=CommonReviewContainer-BEy_jRAF.mjs.map

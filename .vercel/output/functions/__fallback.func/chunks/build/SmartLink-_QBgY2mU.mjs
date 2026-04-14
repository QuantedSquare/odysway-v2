import { o as Rs } from './server.mjs';
import { computed, unref, mergeProps, withCtx, renderSlot, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';

const C={__name:"SmartLink",__ssrInlineRender:true,props:{to:{type:String,required:true},linkClass:{type:String,default:"text-grey"}},setup(e){const r=e,n=computed(()=>r.to.includes("https://"));return (s,u,a,i)=>{const d=Rs;unref(n)?u(ssrRenderComponent(d,mergeProps({href:e.to,external:true,target:"_blank",class:e.linkClass},i),{default:withCtx((x,t,o,l)=>{if(t)ssrRenderSlot(s.$slots,"default",{},null,t,o,l);else return [renderSlot(s.$slots,"default")]}),_:3},a)):u(ssrRenderComponent(d,mergeProps({to:e.to,class:e.linkClass},i),{default:withCtx((x,t,o,l)=>{if(t)ssrRenderSlot(s.$slots,"default",{},null,t,o,l);else return [renderSlot(s.$slots,"default")]}),_:3},a));}}},k=C.setup;C.setup=(e,r)=>{const n=useSSRContext();return (n.modules||(n.modules=new Set)).add("components/SmartLink.vue"),k?k(e,r):void 0};

export { C };
//# sourceMappingURL=SmartLink-_QBgY2mU.mjs.map

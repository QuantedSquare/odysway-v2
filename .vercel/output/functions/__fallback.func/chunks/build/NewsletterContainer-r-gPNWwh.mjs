import { ref, mergeProps, withAsyncContext, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot, ssrRenderComponent } from 'vue/server-renderer';
import { _ as Lu, u as lp, a as Jc, b as gl, W as Xc } from './server.mjs';
import { z } from 'zod';

const i={__name:"TrackableVoyageList",__ssrInlineRender:true,props:{voyages:{type:Array,required:true},listName:{type:String,required:true}},setup(n){const e=ref(null);return ref(false),(t,o,l,r)=>{o(`<div${ssrRenderAttrs(mergeProps({ref_key:"listContainer",ref:e},r))}>`),ssrRenderSlot(t.$slots,"default",{},null,o,l),o("</div>");}}},u=i.setup;i.setup=(n,e)=>{const t=useSSRContext();return (t.modules||(t.modules=new Set)).add("components/TrackableVoyageList.vue"),u?u(n,e):void 0};const a={__name:"NewsletterContainer",__ssrInlineRender:true,props:{isOnVoyage:{type:Boolean,default:false},voyage:{type:Object,default:null}},async setup(n){let e,t;const o=lp(),{data:l}=([e,t]=withAsyncContext(()=>Jc("newsletter-content",()=>o.fetch(`*[_type == "newsletter"][0]{
  emailPlaceholder,
  subscribeButton,
  successMessage,
  closeButton
}`))),e=await e,t(),e);gl();const r=ref(""),p=ref(false);return ref(false),ref(true),ref(false),computed(()=>z.string().email().safeParse(r.value).success&&!p.value),($,m,d,f)=>{m(ssrRenderComponent(Xc,f,{},d));}}},c=a.setup;a.setup=(n,e)=>{const t=useSSRContext();return (t.modules||(t.modules=new Set)).add("components/content/NewsletterContainer.vue"),c?c(n,e):void 0};const D=Lu(a,[["__scopeId","data-v-c976fa47"]]);

export { D, i };
//# sourceMappingURL=NewsletterContainer-r-gPNWwh.mjs.map

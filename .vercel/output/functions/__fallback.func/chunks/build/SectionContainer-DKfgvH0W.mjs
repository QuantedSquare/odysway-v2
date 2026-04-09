import { withCtx, renderSlot, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { _ as Lu, V as fi, e as Zn, f as lt } from './server.mjs';

const u={__name:"SectionContainer",__ssrInlineRender:true,props:{title:{type:String,default:""},subtitle:{type:String,default:""}},setup(c){return (e,n,p,m)=>{n(ssrRenderComponent(fi,m,{default:withCtx((j,d,x,S)=>{if(d)d(ssrRenderComponent(Zn,{justify:"center"},{default:withCtx((v,a,C,g)=>{if(a)a(ssrRenderComponent(lt,{cols:"12",lg:"8",class:"content-class px-0 px-md-3 text-left"},{default:withCtx((I,f,R,V)=>{if(f)ssrRenderSlot(e.$slots,"content",{},null,f,R,V);else return [renderSlot(e.$slots,"content",{},void 0,true)]}),_:3},C,g));else return [createVNode(lt,{cols:"12",lg:"8",class:"content-class px-0 px-md-3 text-left"},{default:withCtx(()=>[renderSlot(e.$slots,"content",{},void 0,true)]),_:3})]}),_:3},x,S));else return [createVNode(Zn,{justify:"center"},{default:withCtx(()=>[createVNode(lt,{cols:"12",lg:"8",class:"content-class px-0 px-md-3 text-left"},{default:withCtx(()=>[renderSlot(e.$slots,"content",{},void 0,true)]),_:3})]),_:3})]}),_:3},p));}}},_=u.setup;u.setup=(c,e)=>{const n=useSSRContext();return (n.modules||(n.modules=new Set)).add("components/content/blogs/SectionContainer.vue"),_?_(c,e):void 0};const z=Lu(u,[["__scopeId","data-v-530c1961"]]);

export { z };
//# sourceMappingURL=SectionContainer-DKfgvH0W.mjs.map

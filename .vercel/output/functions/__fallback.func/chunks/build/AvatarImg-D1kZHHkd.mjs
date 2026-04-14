import { computed, mergeProps, withCtx, unref, openBlock, createBlock, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { s } from './getImageUrl-B94zyPkX.mjs';
import { a as at } from './composables-NwuVgpqi.mjs';
import { aJ as wa, C as fu } from './server.mjs';

const c={__name:"AvatarImg",__ssrInlineRender:true,props:{avatarImg:{type:Object,default:null},avatarSize:{type:String,required:true},name:{type:String,default:null}},setup(e){const r=at(),a=computed(()=>s(e.avatarImg?.asset?._ref));return (q,g,f,d)=>{g(ssrRenderComponent(wa,mergeProps({size:e.avatarSize,color:"blue"},d),{default:withCtx((x,n,h,m)=>{if(n)unref(a)?n(ssrRenderComponent(fu,{src:unref(r)(unref(a),{format:"webp",quality:70,height:340,width:640}),"lazy-src":unref(r)(unref(a),{format:"webp",quality:10,height:340,width:640}),alt:e.name+" avatar",height:"100%",width:"100%"},null,h,m)):n(`<span${m}>${ssrInterpolate(e.name?e.name[0].toUpperCase():"")}</span>`);else return [unref(a)?(openBlock(),createBlock(fu,{key:0,src:unref(r)(unref(a),{format:"webp",quality:70,height:340,width:640}),"lazy-src":unref(r)(unref(a),{format:"webp",quality:10,height:340,width:640}),alt:e.name+" avatar",height:"100%",width:"100%"},null,8,["src","lazy-src","alt"])):(openBlock(),createBlock("span",{key:1},toDisplayString(e.name?e.name[0].toUpperCase():""),1))]}),_:1},f));}}},u=c.setup;c.setup=(e,r)=>{const a=useSSRContext();return (a.modules||(a.modules=new Set)).add("components/content/AvatarImg.vue"),u?u(e,r):void 0};

export { c };
//# sourceMappingURL=AvatarImg-D1kZHHkd.mjs.map

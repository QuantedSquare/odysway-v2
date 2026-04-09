import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderStyle, ssrInterpolate } from 'vue/server-renderer';

const r={__name:"BrandedLogo",__ssrInlineRender:true,props:{title:{type:String,required:false,default:"title"},logo:{type:String,required:false,default:"https://nuxt.com/assets/design-kit/logo-white.png"}},setup(e){return (s,t,p,i)=>{t(`<div${ssrRenderAttrs(mergeProps({style:{backgroundImage:"linear-gradient(to right, #24243e, #302b63, #0f0c29)"},class:"h-full w-full flex items-start justify-start"},i))}><div class="flex items-start justify-start h-full"><div class="flex flex-col justify-between w-full h-full p-20"><img${ssrRenderAttr("src",e.logo)} height="50"><h1 class="text-[60px] text-white font-bold text-left" style="${ssrRenderStyle({display:"block","line-clamp":"2","text-overflow":"ellipsis"})}">${ssrInterpolate(e.title)}</h1></div></div></div>`);}}},l=r.setup;r.setup=(e,s)=>{const t=useSSRContext();return (t.modules||(t.modules=new Set)).add("../node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/BrandedLogo.vue"),l?l(e,s):void 0};

export { r as default };
//# sourceMappingURL=BrandedLogo-Co9YqFbE.mjs.map

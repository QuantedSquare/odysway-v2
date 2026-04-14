import { unref, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';

const s={__name:"ProseScript",__ssrInlineRender:true,props:{src:{type:String,default:""}},setup(t){return (e,n,u,i)=>{unref(false)?n(`<div${ssrRenderAttrs(i)}> Rendering the <code>script</code> element is dangerous and is disabled by default. Consider implementing your own <code>ProseScript</code> element to have control over script rendering. </div>`):n("<!---->");}}},o=s.setup;s.setup=(t,r)=>{const e=useSSRContext();return (e.modules||(e.modules=new Set)).add("../node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseScript.vue"),o?o(t,r):void 0};const l=Object.assign(s,{__name:"ProseScript"});

export { l as default };
//# sourceMappingURL=ProseScript-CpWLdHc8.mjs.map

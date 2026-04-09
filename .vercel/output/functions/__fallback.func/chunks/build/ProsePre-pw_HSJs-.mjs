import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer';

const n={__name:"ProsePre",__ssrInlineRender:true,props:{code:{type:String,default:""},language:{type:String,default:null},filename:{type:String,default:null},highlights:{type:Array,default:()=>[]},meta:{type:String,default:null},class:{type:String,default:null}},setup(s){return (t,e,l,u)=>{e(`<pre${ssrRenderAttrs(mergeProps({class:t.$props.class},u))}>`),ssrRenderSlot(t.$slots,"default",{},null,e,l),e("</pre>");}}},r=n.setup;n.setup=(s,t)=>{const e=useSSRContext();return (e.modules||(e.modules=new Set)).add("../node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProsePre.vue"),r?r(s,t):void 0};

export { n as default };
//# sourceMappingURL=ProsePre-pw_HSJs-.mjs.map

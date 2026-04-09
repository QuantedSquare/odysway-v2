import { ssrRenderAttrs } from 'vue/server-renderer';
import { useSSRContext } from 'vue';

const n={__name:"search",__ssrInlineRender:true,setup(s){return (t,e,p,o)=>{e(`<div${ssrRenderAttrs(o)}></div>`);}}},r=n.setup;n.setup=(s,t)=>{const e=useSSRContext();return (e.modules||(e.modules=new Set)).add("pages/(search-redirection-to-voyages)/search.vue"),r?r(s,t):void 0};

export { n as default };
//# sourceMappingURL=search-k38s3ueY.mjs.map

import { ssrRenderAttrs } from 'vue/server-renderer';
import { useSSRContext } from 'vue';

const n={__name:"paiement",__ssrInlineRender:true,setup(t){return (r,e,i,o)=>{e(`<div${ssrRenderAttrs(o)}></div>`);}}},s=n.setup;n.setup=(t,r)=>{const e=useSSRContext();return (e.modules||(e.modules=new Set)).add("pages/(redirection-from-old-link)/paiement.vue"),s?s(t,r):void 0};

export { n as default };
//# sourceMappingURL=paiement-Bx3Pyu5x.mjs.map

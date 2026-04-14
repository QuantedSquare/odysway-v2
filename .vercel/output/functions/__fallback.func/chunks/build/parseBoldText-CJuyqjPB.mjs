import { computed, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { _ as Lu } from './server.mjs';

const o={__name:"CustomBadge",__ssrInlineRender:true,props:{color:{type:String,required:true}},setup(e){const t=e,s=computed(()=>`rgba(var(--v-theme-${t.color}-light))`),a=computed(()=>`rgb(var(--v-theme-${t.color}))`);return (b,c,g,p)=>{const u={style:{":--c9e74896":unref(s),":--e639e61a":unref(a)}};c(`<div${ssrRenderAttrs(mergeProps({class:"inline-block"},p,u))} data-v-bdd59dbb><div class="custom-badge" data-v-bdd59dbb><span class="custom-content" data-v-bdd59dbb></span></div></div>`);}}},d=o.setup;o.setup=(e,t)=>{const s=useSSRContext();return (s.modules||(s.modules=new Set)).add("components/content/Voyages/CustomBadge.vue"),d?d(e,t):void 0};const C=Lu(o,[["__scopeId","data-v-bdd59dbb"]]);function B(e){return e.replace(/\*\*(.*?)\*\*/g,'<span class="font-weight-bold">$1</span>')}

export { B, C };
//# sourceMappingURL=parseBoldText-CJuyqjPB.mjs.map

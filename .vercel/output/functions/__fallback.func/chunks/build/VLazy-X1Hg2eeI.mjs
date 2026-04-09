import { withDirectives, createVNode, normalizeStyle, normalizeClass } from 'vue';
import { p as ne, a2 as Xt, r as St, a3 as Ce, x as ie, a4 as Je, y as Y, a5 as $n, L as Ve, B as Ct, G as ve } from './server.mjs';

const g=Y({modelValue:Boolean,options:{type:Object,default:()=>({root:void 0,rootMargin:void 0,threshold:void 0})},...ve(),...Ct(),...Ve(),...$n({transition:"fade-transition"})},"VLazy"),C=ne()({name:"VLazy",directives:{vIntersect:Xt},props:g(),emits:{"update:modelValue":e=>true},setup(e,s){let{slots:o}=s;const{dimensionStyles:i}=St(e),a=Ce(e,"modelValue");function r(l){a.value||(a.value=l);}return ie(()=>withDirectives(createVNode(e.tag,{class:normalizeClass(["v-lazy",e.class]),style:normalizeStyle([i.value,e.style])},{default:()=>[a.value&&createVNode(Je,{transition:e.transition,appear:true},{default:()=>[o.default?.()]})]}),[[Xt,{handler:r,options:e.options},null]])),{}}});

export { C };
//# sourceMappingURL=VLazy-X1Hg2eeI.mjs.map

import { createElementVNode, normalizeStyle, normalizeClass, createVNode } from 'vue';
import { p as ne, t as He, bN as o1, b2 as rt, x as ie, r as Ct, bP as eg, y as Y, z as Te, a9 as Ee, bO as n1, G as ve, L as Ve, B as wt } from './server.mjs';
import { i } from './ssrBoot-755kmDGm.mjs';

const M=Y({...ve(),...Ee(n1(),["fullHeight"]),...Te()},"VApp"),T=ne()({name:"VApp",props:M(),setup(e,t){let{slots:a}=t;const s=He(e),{layoutClasses:l,getLayoutItem:o,items:y,layoutRef:v}=o1({...e,fullHeight:true}),{rtlClasses:d}=rt();return ie(()=>createElementVNode("div",{ref:v,class:normalizeClass(["v-application",s.themeClasses.value,l.value,d.value,e.class]),style:normalizeStyle([e.style])},[createElementVNode("div",{class:"v-application__wrap"},[a.default?.()])])),{getLayoutItem:o,items:y,theme:s}}}),_=Y({scrollable:Boolean,...ve(),...wt(),...Ve({tag:"main"})},"VMain"),x=ne()({name:"VMain",props:_(),setup(e,t){let{slots:a}=t;const{dimensionStyles:s}=Ct(e),{mainStyles:l}=eg(),{ssrBootStyles:o}=i();return ie(()=>createVNode(e.tag,{class:normalizeClass(["v-main",{"v-main--scrollable":e.scrollable},e.class]),style:normalizeStyle([l.value,o.value,s.value,e.style])},{default:()=>[e.scrollable?createElementVNode("div",{class:"v-main__scroller"},[a.default?.()]):a.default?.()]})),{}}});

export { T, x };
//# sourceMappingURL=VMain-BkgRxxw4.mjs.map

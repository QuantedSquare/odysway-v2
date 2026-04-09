import { createElementVNode, normalizeStyle, normalizeClass, createVNode } from 'vue';
import { p as ne, t as He, bN as s1, b2 as rt, x as ie, r as St, bP as tg, y as Y, z as Te, a9 as Ee, bO as r1, G as ve, L as Ve, B as Ct } from './server.mjs';
import { i } from './ssrBoot-755kmDGm.mjs';

const M=Y({...ve(),...Ee(r1(),["fullHeight"]),...Te()},"VApp"),T=ne()({name:"VApp",props:M(),setup(e,t){let{slots:a}=t;const s=He(e),{layoutClasses:l,getLayoutItem:o,items:y,layoutRef:v}=s1({...e,fullHeight:true}),{rtlClasses:d}=rt();return ie(()=>createElementVNode("div",{ref:v,class:normalizeClass(["v-application",s.themeClasses.value,l.value,d.value,e.class]),style:normalizeStyle([e.style])},[createElementVNode("div",{class:"v-application__wrap"},[a.default?.()])])),{getLayoutItem:o,items:y,theme:s}}}),_=Y({scrollable:Boolean,...ve(),...Ct(),...Ve({tag:"main"})},"VMain"),x=ne()({name:"VMain",props:_(),setup(e,t){let{slots:a}=t;const{dimensionStyles:s}=St(e),{mainStyles:l}=tg(),{ssrBootStyles:o}=i();return ie(()=>createVNode(e.tag,{class:normalizeClass(["v-main",{"v-main--scrollable":e.scrollable},e.class]),style:normalizeStyle([l.value,o.value,s.value,e.style])},{default:()=>[e.scrollable?createElementVNode("div",{class:"v-main__scroller"},[a.default?.()]):a.default?.()]})),{}}});

export { T, x };
//# sourceMappingURL=VMain-BSCIiDCd.mjs.map

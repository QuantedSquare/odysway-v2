import { ref, createElementVNode, normalizeStyle, normalizeClass } from 'vue';
import { p as ne, ar as c1, x as ie, a8 as Fn, y as Y, as as u1, G as ve } from './server.mjs';

const C=Y({...ve(),...u1()},"VForm"),z=ne()({name:"VForm",props:C(),emits:{"update:modelValue":a=>true,submit:a=>true},setup(a,n){let{slots:m,emit:l}=n;const o=c1(a),r=ref();function i(s){s.preventDefault(),o.reset();}function f(s){const t=s,e=o.validate();t.then=e.then.bind(e),t.catch=e.catch.bind(e),t.finally=e.finally.bind(e),l("submit",t),t.defaultPrevented||e.then(u=>{let{valid:c}=u;c&&r.value?.submit();}),t.preventDefault();}return ie(()=>createElementVNode("form",{ref:r,class:normalizeClass(["v-form",a.class]),style:normalizeStyle(a.style),novalidate:true,onReset:i,onSubmit:f},[m.default?.(o)])),Fn(o,r)}});

export { z };
//# sourceMappingURL=VForm-DR5MrIVn.mjs.map

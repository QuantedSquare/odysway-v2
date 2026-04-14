import { ref, useId, createVNode, mergeProps } from 'vue';
import { G as Gt, z as zt } from './VSelect-DYMDk8Cd.mjs';
import { p as ne, a3 as Ce, af as iu, x as ie, ah as am, ai as Ri, a8 as Fn, y as Y, a9 as Ee, ao as uu } from './server.mjs';

const q=Y({...Ee(uu(),["direction"]),...Ee(zt(),["inline"])},"VCheckbox"),H=ne()({name:"VCheckbox",inheritAttrs:false,props:q(),emits:{"update:modelValue":e=>true,"update:focused":e=>true},setup(e,n){let{attrs:i,slots:a}=n;const o=Ce(e,"modelValue"),{isFocused:m,focus:f,blur:V}=iu(e),t=ref(),p=useId();return ie(()=>{const[b,k]=am(i),v=Ri.filterProps(e),x=Gt.filterProps(e);return createVNode(Ri,mergeProps({ref:t,class:["v-checkbox",e.class]},b,v,{modelValue:o.value,"onUpdate:modelValue":s=>o.value=s,id:e.id||`checkbox-${p}`,focused:m.value,style:e.style}),{...a,default:s=>{let{id:h,messagesId:P,isDisabled:y,isReadonly:C,isValid:I}=s;return createVNode(Gt,mergeProps(x,{id:h.value,"aria-describedby":P.value,disabled:y.value,readonly:C.value},k,{error:I.value===false,modelValue:o.value,"onUpdate:modelValue":A=>o.value=A,onFocus:f,onBlur:V}),a)}})}),Fn({},t)}});

export { H };
//# sourceMappingURL=VCheckbox-CCkh8DFz.mjs.map

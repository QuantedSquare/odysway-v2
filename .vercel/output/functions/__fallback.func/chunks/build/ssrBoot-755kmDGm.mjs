import { shallowRef, readonly, toRef } from 'vue';

function i(){const o=shallowRef(false);return {ssrBootStyles:toRef(()=>o.value?void 0:{transition:"none !important"}),isBooted:readonly(o)}}

export { i };
//# sourceMappingURL=ssrBoot-755kmDGm.mjs.map

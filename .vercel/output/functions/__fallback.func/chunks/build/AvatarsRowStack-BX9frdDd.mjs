import { _ as Lu, u as up, a as Qc, b as gl, W as Up } from './server.mjs';
import { withAsyncContext, ref, computed, watch, nextTick, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { a as at } from './composables-Dcwg06ZS.mjs';

function q(){const n=e=>new Promise(t=>{requestAnimationFrame(()=>{const c=e();t(c);});});return {scheduleLayoutRead:n,readScrollHeight:e=>{const t=unref(e);return t?n(()=>t.scrollHeight):Promise.resolve(0)},readOffsetWidth:e=>{const t=unref(e);return t?n(()=>t.offsetWidth):Promise.resolve(0)},readLayoutProperties:(e,t)=>{const c=unref(e);return c?n(()=>{const u={};return t.forEach(o=>{u[o]=c[o];}),u}):Promise.resolve({})}}}const D=`
  *[_type == "teamMember" && name != 'Salomé']|order(orderRank) {
    name,
    description,
    image
  }
`,p={__name:"AvatarsRowStack",__ssrInlineRender:true,async setup(n){let s,i;const h=up(),{data:e}=([s,i]=withAsyncContext(async()=>Qc("team-avatars",async()=>{try{return (await h.fetch(D)).filter(a=>a.image?.asset?._ref)||[]}catch(r){return console.error("Error fetching avatars:",r),[]}},{server:true})),s=await s,i(),s);at();const t=ref(null),{width:c}=gl();computed(()=>{if(!e.value||e.value.length===0)return {width:"100px"};const r=e.value.length;return c.value<=600?{width:`${(r-1)*40+70}px`}:{width:`${(r-1)*60+100}px`}});const u=ref(null),o=ref({maxHeight:"0px",overflow:"hidden",opacity:0,transition:"max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s"}),d=ref(false);let _=null;const{readScrollHeight:x}=q();return watch(t,async r=>{if(await nextTick(),clearTimeout(_),r!==null){if(d.value||(d.value=true,await nextTick()),u.value){const a=u.value.querySelector(".avatar-info");if(a){const f=await x(a);o.value.maxHeight=f+"px",o.value.opacity=1;}}}else o.value.maxHeight="0px",o.value.opacity=0,_=setTimeout(()=>{d.value=false;},500);}),(r,a,f,g)=>{const w=Up,S={style:{":--v6ef674cb":unref(e)?.length||0}};a(ssrRenderComponent(w,mergeProps(g,S),{},f));}}},y=p.setup;p.setup=(n,s)=>{const i=useSSRContext();return (i.modules||(i.modules=new Set)).add("components/content/AvatarsRowStack.vue"),y?y(n,s):void 0};const Q=Lu(p,[["__scopeId","data-v-605deb3a"]]);

export { Q };
//# sourceMappingURL=AvatarsRowStack-BX9frdDd.mjs.map

import { ref, mergeProps, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderAttr } from 'vue/server-renderer';
import { M as publicAssetsURL } from '../nitro/nitro.mjs';
import { _ as Lu, h as Er, U as we } from './server.mjs';
import { G } from './VTooltip-C6zmCnYG.mjs';

const n=publicAssetsURL("/icons/whatsapp_logo_icon_186881.svg"),i={__name:"WhatsAppBtn",__ssrInlineRender:true,setup(p){const{trackWhatsappClick:e}=Er(),t=ref(true),c=()=>{e();};return (P,s,w,f)=>{s(`<div${ssrRenderAttrs(mergeProps({class:"whatsapp-wrapper"},f))} data-v-d377010a><span class="${ssrRenderClass([{visible:unref(t)},"whatsapp-hint"])}" data-v-d377010a> Poser une question sur le voyage ? </span>`),s(ssrRenderComponent(G,{text:"Poser une question à Odysway ? ( vous serez redirigé vers WhatsApp )",location:"top"},{activator:withCtx(({props:d},h,g,v)=>{if(h)h(ssrRenderComponent(we,mergeProps(d,{href:"https://wa.me/+33780919540",icon:"",rounded:"circle",height:"70",width:"70",color:"white",onClick:c}),{default:withCtx((S,_,q,C)=>{if(_)_(`<img${ssrRenderAttr("src",n)} alt="whatsapp" width="70" height="70" data-v-d377010a${C}>`);else return [createVNode("img",{src:n,alt:"whatsapp",width:"70",height:"70"})]}),_:2},g,v));else return [createVNode(we,mergeProps(d,{href:"https://wa.me/+33780919540",icon:"",rounded:"circle",height:"70",width:"70",color:"white",onClick:c}),{default:withCtx(()=>[createVNode("img",{src:n,alt:"whatsapp",width:"70",height:"70"})]),_:1},16)]}),_:1},w)),s("</div>");}}},u=i.setup;i.setup=(p,e)=>{const t=useSSRContext();return (t.modules||(t.modules=new Set)).add("components/WhatsAppBtn.vue"),u?u(p,e):void 0};const z=Object.assign(Lu(i,[["__scopeId","data-v-d377010a"]]),{__name:"WhatsAppBtn"});

export { z };
//# sourceMappingURL=WhatsAppBtn-CdavfN40.mjs.map

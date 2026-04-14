import Rt from '@sanity/image-url';
import { g as qe } from './server.mjs';

function s(t,e=null,n=null){const i=n||qe(),o=Rt({projectId:i.public.sanity.projectId,dataset:i.public.sanity.dataset});if(!t)return "";try{const r=o.image(t).format("webp").fit("max").width(1200);return e?r.vanityName(e).url():r.url()}catch(r){return console.error("Error generating image URL:",r),""}}

export { s };
//# sourceMappingURL=getImageUrl-B94zyPkX.mjs.map

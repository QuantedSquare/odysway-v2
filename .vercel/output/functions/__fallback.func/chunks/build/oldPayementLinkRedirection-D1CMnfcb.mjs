import { aB as executeAsync } from '../nitro/nitro.mjs';
import { bM as Wp, d as pt, ae as bu, X as sa } from './server.mjs';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'algoliasearch';
import '@sanity/client';
import 'axios';
import 'jsonwebtoken';
import 'dayjs';
import '@supabase/supabase-js';
import 'stripe';
import 'crypto';
import 'zod';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'fast-xml-parser';
import 'node:url';
import 'ipx';
import 'vue-router';
import '@unhead/addons';
import '@unhead/schema-org/vue';
import 'vue-dompurify-html';
import '@date-io/dayjs';
import '@mdi/js';
import 'lodash';
import 'search-insights';
import '@vueuse/core';
import 'groq';
import 'perfect-debounce';

const ee=Wp(async()=>{let e,r;const o=pt();let t=b(o);const{data:n,error:l}=([e,r]=executeAsync(()=>supabase.from("booked_dates").select("*").eq("deal_id",o.query.orderId)),e=await e,r(),e);if(console.log("===========existingBookedDate in oldPayementLinkRedirection.js===========",n),l){console.error("Error fetching existing booked date:",l);return}if(n&&n.length>0)return t.booked_id=n[0].id,s(t);const i=([e,r]=executeAsync(()=>bu(`/ac/deals/${o.query.orderId}`)),e=await e,r(),e);if(!i){console.error("Forbidden");return}console.log("deal in oldPayementLinkRedirection.js",i);const{data:d,error:c}=([e,r]=executeAsync(()=>supabase.from("travel_dates").select("*").eq("departure_date",i.departureDate).eq("travel_slug",i.slug)),e=await e,r(),e);if(console.log("===========existingTravelDate in oldPayementLinkRedirection.js===========",d),c){console.error("Error fetching travel date:",c);return}if(d&&d.length>0){const g=([e,r]=executeAsync(()=>f(i.slug,d[0].id,o.query.orderId)),e=await e,r(),e);return g?(t.booked_id=g.id,s(t)):void 0}const p=([e,r]=executeAsync(()=>D(i)),e=await e,r(),e);if(!p)return;const m=([e,r]=executeAsync(()=>f(i.slug,p.id,o.query.orderId)),e=await e,r(),e);if(m)return t.booked_id=m.id,s(t)});function b(e){const r={step:1};return e.query.isSold==="true"?r.type="balance":e.query.acompte==="true"?r.type="deposit":(r.type="custom",r.amount=e.query.amount),r}async function f(e,r,o){try{return await bu(`/booking/${e}/date/${r}/assign-deal`,"post",{dealId:o,booked_places:0})}catch(t){return console.error("Error assigning deal to date:",t),null}}async function D(e){try{return await bu("/booking/add-date","post",{travel_slug:e.slug,published:!1,displayed_status:"soon_confirmed",departure_date:e.departureDate,return_date:e.returnDate,starting_price:+e.basePricePerTraveler/100,max_travelers:6,min_travelers:1,early_bird:e.gotEarlyBird==="Oui",last_minute:e.gotLastMinute==="Oui",include_flight:e.includeFlight==="Oui",booked_seat:0,flight_price:+e.flightPrice/100,badges:""})}catch(r){return console.error("Error creating new booking:",r),null}}function s(e){return sa({path:"/checkout",query:e})}

export { ee as default };
//# sourceMappingURL=oldPayementLinkRedirection-D1CMnfcb.mjs.map

import { M as publicAssetsURL } from '../nitro/nitro.mjs';
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

const t=".hero[data-v-5dcee0a6]{align-items:center;display:flex;isolation:isolate;justify-content:center;min-height:100dvh;overflow:hidden;position:relative;width:100vw}.hero-image-bg[data-v-5dcee0a6]{height:100%;overflow:hidden;width:100%;z-index:0}.hero-image-bg[data-v-5dcee0a6],.hero-image-bg[data-v-5dcee0a6]:after{inset:0;pointer-events:none;position:absolute}.hero-image-bg[data-v-5dcee0a6]:after{background-image:url("+publicAssetsURL("/noise.webp")+');background-repeat:repeat;background-size:auto;content:"";mix-blend-mode:overlay;opacity:0}.hero-noise-enabled[data-v-5dcee0a6]:after{filter:brightness(.8) contrast(1.1);opacity:var(--hero-noise-opacity,.1)}.hero-image[data-v-5dcee0a6]{aspect-ratio:16/9;border:0;height:100vh;min-height:100%;min-height:460px;min-width:100%;-o-object-fit:cover;object-fit:cover;opacity:1;transition:filter .4s;width:100vw}.hero-image-dim[data-v-5dcee0a6]{filter:brightness(.8)}.hero-search[data-v-5dcee0a6]{display:block;left:50%;position:absolute;top:calc(56px + 40%);transform:translate(-50%);width:100%;z-index:3}.hero-content[data-v-5dcee0a6]{color:#fff;display:flex;flex-direction:column;gap:1rem;justify-content:center;margin-inline:auto;padding:2rem 2vw;position:relative;text-align:center;width:100%;z-index:2}.hero-content h1[data-v-5dcee0a6] p{animation:fadeSlideUp-5dcee0a6 .8s ease-out forwards;color:#fbf0ec;font-size:clamp(40px,6vw,76px);font-weight:800;letter-spacing:-1.5px;line-height:1.1;margin-block:0 12px;text-wrap:balance}.hero-content h2[data-v-5dcee0a6]{align-items:center;animation:fadeSlideUp-5dcee0a6 .8s ease-out .2s forwards;display:flex;flex-wrap:wrap;font-size:clamp(18px,2.5vw,24px);font-weight:500;gap:6px;justify-content:center;letter-spacing:.5px;line-height:1.5;margin-inline:auto;max-width:800px;text-shadow:0 2px 24px rgba(0,0,0,.5)}.custom-hero-subtitle[data-v-5dcee0a6] p{margin-bottom:0!important}@media(max-width:600px){.custom-hero-subtitle[data-v-5dcee0a6]{align-items:center;flex-direction:column;gap:10px}.typewriter-text[data-v-5dcee0a6]{margin-left:0}}@keyframes fadeSlideUp-5dcee0a6{0%{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}.glass-search-trigger[data-v-5dcee0a6]{align-items:center;animation:fadeSlideUp-5dcee0a6 .8s ease-out .4s forwards;backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);background:#fbf0ec;border:1px solid hsla(0,0%,100%,.4);border-radius:20px;box-shadow:inset 0 1px #fff6,inset 0 -1px #0000001a,0 8px 32px #0003;cursor:pointer;display:flex;height:64px;margin:0 auto;opacity:0;overflow:hidden;padding:0 28px;position:relative;transition:all .4s cubic-bezier(.25,1,.5,1);width:min(90vw,600px)}@media(max-width:600px){.glass-search-trigger[data-v-5dcee0a6]{height:45px;padding:0 16px;width:min(94vw,480px)}.search-placeholder[data-v-5dcee0a6]{font-size:12px!important}}.hero-content h2[data-v-5dcee0a6] p{color:#fbf0ec!important}.glass-search-trigger[data-v-5dcee0a6]:before{background:linear-gradient(90deg,transparent,hsla(0,0%,100%,.2),transparent);content:"";height:100%;left:-100%;position:absolute;top:0;transition:.5s;width:50%}.glass-search-trigger[data-v-5dcee0a6]:hover:before{animation:shimmer-5dcee0a6 1.5s infinite}.glass-search-trigger[data-v-5dcee0a6]:hover{background:#ffffff40;border-color:#fff9;box-shadow:inset 0 1px #ffffff80,0 12px 40px #00000040;transform:translateY(-2px) scale(1.01)}.glass-search-trigger[data-v-5dcee0a6]:active{transform:translateY(0) scale(.99)}.glass-search-trigger:hover .icon-search[data-v-5dcee0a6],.glass-search-trigger:hover .search-placeholder[data-v-5dcee0a6]{color:#fff!important}.search-placeholder[data-v-5dcee0a6]{color:rgb(var(--v-theme-primary));font-size:17px;font-weight:200;letter-spacing:.3px;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px hsla(0,0%,81%,.1);white-space:nowrap}@keyframes shimmer-5dcee0a6{to{left:200%}}.cursor[data-v-5dcee0a6],.typewriter-text[data-v-5dcee0a6]{color:rgba(var(--v-theme-secondary),.8)!important}.typewriter-text[data-v-5dcee0a6]{align-items:center;display:inline-flex;margin-left:6px;min-width:0;padding:6px 14px;position:relative;text-align:left;white-space:pre;z-index:0}.typewriter-text[data-v-5dcee0a6]:before{background:#fff;border-radius:6px;content:"";inset:0 -5px 0 -2px;opacity:0;position:absolute;transform-origin:left center;transition:opacity .18s ease,transform .18s ease;z-index:-1}.typewriter-active[data-v-5dcee0a6]:before{opacity:1}.cursor[data-v-5dcee0a6]{animation:blink-5dcee0a6 1s step-end infinite;color:#ffffffb3;display:inline-block;font-weight:100;margin-left:2px}@keyframes blink-5dcee0a6{0%,to{opacity:1}50%{opacity:0}}.hero-dev-controls[data-v-5dcee0a6]{display:flex;gap:8px;left:12px;opacity:50%;position:absolute;top:15%;z-index:10}@media(max-width:600px){.hero-dev-controls[data-v-5dcee0a6]{opacity:50%;top:90%}}.hero-dev-btn[data-v-5dcee0a6]{-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);background:#000000a6;border:1px solid hsla(0,0%,100%,.35);border-radius:6px;color:#fff;cursor:pointer;font-size:12px;padding:8px 10px;transition:all .2s ease}.hero-dev-btn[data-v-5dcee0a6]:hover{background:#000c;transform:translateY(-1px)}.hero-dev-btn[data-v-5dcee0a6]:active{background:#000000b3;transform:translateY(0)}.hero-dev-badge[data-v-5dcee0a6]{align-self:center;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);background:#ffffff1a;border:1px solid hsla(0,0%,100%,.25);border-radius:8px;color:#fff;font-size:12px;padding:6px 10px}';

const HomeHeroSectionStyles_BNOQNmON = [
  t
];

export { HomeHeroSectionStyles_BNOQNmON as default };
//# sourceMappingURL=HomeHeroSection-styles.BNOQNmON.mjs.map

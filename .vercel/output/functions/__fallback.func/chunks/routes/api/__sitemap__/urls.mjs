import { d as defineSitemapEventHandler, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import { createClient } from '@sanity/client';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'algoliasearch';
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

const urls = defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig();
  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true
  });
  const [blogPosts, voyages, destinations, experiences, categories] = await Promise.all([
    sanityClient.fetch(`*[_type == "blog"]{ "slug": slug.current, _updatedAt }`),
    sanityClient.fetch(`*[_type == "voyage"]{ "slug": slug.current, _updatedAt }`),
    sanityClient.fetch(`*[_type == "destination"]{ "slug": slug.current, _updatedAt }`),
    sanityClient.fetch(`*[_type == "experience"]{ "slug": slug.current, _updatedAt }`),
    sanityClient.fetch(`*[_type == "category"]{ "slug": slug.current, _updatedAt }`)
  ]);
  const urls = [
    // Static key pages
    { loc: "/", changefreq: "daily", priority: 1 },
    { loc: "/voyages", changefreq: "daily", priority: 0.9 },
    { loc: "/contact", changefreq: "monthly", priority: 0.8 },
    { loc: "/sur-mesure", changefreq: "monthly", priority: 0.8 },
    { loc: "/nous-recrutons", changefreq: "monthly", priority: 0.7 },
    { loc: "/cheques-vacances", changefreq: "monthly", priority: 0.7 },
    { loc: "/offre-cadeau", changefreq: "monthly", priority: 0.7 }
  ];
  for (const post of blogPosts) {
    urls.push({ loc: `/${post.slug}`, lastmod: post._updatedAt, changefreq: "monthly", priority: 0.7 });
  }
  for (const voyage of voyages) {
    urls.push({ loc: `/voyages/${voyage.slug}`, lastmod: voyage._updatedAt, changefreq: "weekly", priority: 0.9 });
  }
  for (const dest of destinations) {
    urls.push({ loc: `/destinations/${dest.slug}`, lastmod: dest._updatedAt, changefreq: "monthly", priority: 0.8 });
  }
  for (const exp of experiences) {
    urls.push({ loc: `/experiences/${exp.slug}`, lastmod: exp._updatedAt, changefreq: "monthly", priority: 0.8 });
  }
  for (const cat of categories) {
    urls.push({ loc: `/thematiques/${cat.slug}`, lastmod: cat._updatedAt, changefreq: "monthly", priority: 0.8 });
  }
  return urls;
});

export { urls as default };
//# sourceMappingURL=urls.mjs.map

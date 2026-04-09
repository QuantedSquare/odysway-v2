import { a as defineEventHandler, u as useRuntimeConfig, F as setHeader } from '../nitro/nitro.mjs';
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

const sitemaps_xml = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true
  });
  const [blogPosts, voyages, destinations, experiences, categories] = await Promise.all([
    sanityClient.fetch(`*[_type == "blog"]{
      "slug": slug.current,
      _updatedAt
    }`),
    sanityClient.fetch(`*[_type == "voyage"]{
      "slug": slug.current,
      _updatedAt
    }`),
    sanityClient.fetch(`*[_type == "destination"]{
      "slug": slug.current,
      _updatedAt
    }`),
    sanityClient.fetch(`*[_type == "experience"]{
      "slug": slug.current,
      _updatedAt
    }`),
    sanityClient.fetch(`*[_type == "category"]{
      "slug": slug.current,
      _updatedAt
    }`)
  ]);
  const sitemapUrls = [
    // Static pages
    { url: "/", lastmod: (/* @__PURE__ */ new Date()).toISOString(), changefreq: "daily", priority: 1 },
    { url: "/voyages", lastmod: (/* @__PURE__ */ new Date()).toISOString(), changefreq: "daily", priority: 0.9 },
    { url: "/contact", lastmod: (/* @__PURE__ */ new Date()).toISOString(), changefreq: "monthly", priority: 0.8 },
    { url: "/sur-mesure", lastmod: (/* @__PURE__ */ new Date()).toISOString(), changefreq: "monthly", priority: 0.8 },
    { url: "/nous-recrutons", lastmod: (/* @__PURE__ */ new Date()).toISOString(), changefreq: "monthly", priority: 0.7 },
    { url: "/cheques-vacances", lastmod: (/* @__PURE__ */ new Date()).toISOString(), changefreq: "monthly", priority: 0.7 },
    { url: "/offre-cadeau", lastmod: (/* @__PURE__ */ new Date()).toISOString(), changefreq: "monthly", priority: 0.7 },
    // Blog posts
    ...blogPosts.map((post) => ({
      url: `/${post.slug}`,
      lastmod: post._updatedAt,
      changefreq: "monthly",
      priority: 0.7
    })),
    // Voyages
    ...voyages.map((voyage) => ({
      url: `/voyages/${voyage.slug}`,
      lastmod: voyage._updatedAt,
      changefreq: "weekly",
      priority: 0.9
    })),
    // Destinations
    ...destinations.map((dest) => ({
      url: `/destinations/${dest.slug}`,
      lastmod: dest._updatedAt,
      changefreq: "monthly",
      priority: 0.8
    })),
    // Experiences
    ...experiences.map((exp) => ({
      url: `/experiences/${exp.slug}`,
      lastmod: exp._updatedAt,
      changefreq: "monthly",
      priority: 0.8
    })),
    // Categories (Thematiques)
    ...categories.map((cat) => ({
      url: `/thematiques/${cat.slug}`,
      lastmod: cat._updatedAt,
      changefreq: "monthly",
      priority: 0.8
    }))
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((item) => `  <url>
    <loc>https://odysway.com${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
  setHeader(event, "Content-Type", "application/xml");
  return sitemap;
});

export { sitemaps_xml as default };
//# sourceMappingURL=sitemaps.xml.mjs.map

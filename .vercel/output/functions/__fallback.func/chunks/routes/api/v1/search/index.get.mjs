import { y as eventHandler, u as useRuntimeConfig, g as getQuery } from '../../../../nitro/nitro.mjs';
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

const index_get = eventHandler(async (event) => {
  var _a;
  const config = useRuntimeConfig();
  event.node.req.headers["user-agent"] || "unknown";
  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true
  });
  const query = getQuery(event);
  const searchTerm = (_a = query.keyword) == null ? void 0 : _a.trim();
  if (searchTerm && searchTerm.length > 0) {
    let filterAndMapData = function(data, dataSource) {
      return data.filter((item) => {
        const name = item.title || item.nom;
        return name.toLowerCase().includes(lowerCaseSearchTerm) || item.slug.includes(lowerCaseSearchTerm);
      }).map((item) => ({
        title: item.title || item.nom,
        slug: item.slug,
        dataSource
      }));
    };
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const [destinations, regions, voyages] = await Promise.all([
      sanityClient.fetch(`*[_type == "destination"]{
        title,
        "slug": slug.current
      }`),
      sanityClient.fetch(`*[_type == "region"]{
        nom,
        "slug": slug.current
      }`),
      sanityClient.fetch(`*[_type == "voyage" && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
      )]{
        title,
        "slug": slug.current
      }`)
    ]);
    const searchResults = [
      ...filterAndMapData(destinations, "destinations"),
      ...filterAndMapData(regions, "regions"),
      ...filterAndMapData(voyages, "voyages")
    ];
    return searchResults;
  } else {
    const [destinations, regions] = await Promise.all([
      sanityClient.fetch(`*[_type == "destination"]{
        title,
        "slug": slug.current,
        isTopDestination
      }`),
      sanityClient.fetch(`*[_type == "region"]{
        nom,
        "slug": slug.current
      }`)
    ]);
    const topDestinations = destinations.filter((destination) => destination.isTopDestination).map((destination) => ({
      title: destination.title,
      slug: destination.slug,
      dataSource: "destinations"
    }));
    const regionsMap = regions.map((region) => ({
      title: region.nom,
      slug: region.slug,
      dataSource: "regions"
    }));
    return [...topDestinations, ...regionsMap];
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

import { y as eventHandler, u as useRuntimeConfig, g as getQuery } from '../../../../nitro/nitro.mjs';
import { algoliasearch } from 'algoliasearch';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
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

const embeddingSearch_get = eventHandler(async (event) => {
  var _a, _b, _c;
  const config = useRuntimeConfig();
  event.node.req.headers["user-agent"] || "unknown";
  const algoliaClient = algoliasearch(config.public.algolia.applicationId, process.env.ALGOLIA_API_READ_ID || config.public.algolia.apiKey);
  const query = getQuery(event);
  const searchTerm = (_a = query.keyword) == null ? void 0 : _a.trim();
  const optout = query.optout === "true" ? true : false;
  if (!searchTerm) {
    return [];
  }
  try {
    const { results } = await algoliaClient.search({
      requests: [
        {
          indexName: "odysway",
          query: searchTerm,
          hitsPerPage: 50,
          clickAnalytics: !optout,
          analytics: !optout
        }
      ]
    });
    const hits = ((_b = results[0]) == null ? void 0 : _b.hits) || [];
    const queryID = (_c = results[0]) == null ? void 0 : _c.queryID;
    if (hits.length === 0) {
      return [];
    }
    const allResults = hits.filter((hit) => {
      var _a2, _b2;
      if (hit.type === "voyage") {
        console.log("=======hit=========", hit);
        return ((_a2 = hit.availabilityTypes) == null ? void 0 : _a2.includes("groupe")) || ((_b2 = hit.availabilityTypes) == null ? void 0 : _b2.includes("privatisation"));
      }
      if (hit.type === "destination") {
        return (hit.voyageCount || 0) > 0;
      }
      return true;
    }).map((hit) => ({
      title: hit.title || hit.name,
      slug: hit.slug,
      dataSource: hit.type === "voyage" ? "voyages" : hit.type === "destination" ? "destinations" : "regions",
      image: hit.image,
      description: hit.description,
      availabilityTypes: hit.availabilityTypes,
      difficulty: hit.difficulty,
      voyageCount: hit.voyageCount,
      score: hit._score || 1,
      objectID: hit.objectID,
      queryID
    }));
    const sortedResults = allResults.sort((a, b) => (b.score || 0) - (a.score || 0));
    return sortedResults;
  } catch (error) {
    console.error("Error getting search results from Algolia:", error);
    return [];
  }
});

export { embeddingSearch_get as default };
//# sourceMappingURL=embedding-search.get.mjs.map

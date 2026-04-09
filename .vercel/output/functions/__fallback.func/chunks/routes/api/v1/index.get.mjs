import { y as eventHandler, u as useRuntimeConfig, g as getQuery, c as createError } from '../../../nitro/nitro.mjs';
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
  const config = useRuntimeConfig();
  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: config.public.sanity.dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: true
  });
  const query = getQuery(event);
  const slug = query.slug;
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug parameter is required"
    });
  }
  const voyage = await sanityClient.fetch(
    `*[_type == "voyage" && slug.current == $slug][0]{
      ...,
      "slug": slug.current,
      image {
        asset -> {
          url
        }
      },
      destinations[]-> {
        _id,
        title,
        iso,
        chapka
      },
      experienceType->{
        _id,
        title
      },
      categories[]->{
        _id,
        title
      },
      monthlyAvailability
    }`,
    { slug }
  );
  if (!voyage) {
    throw createError({
      statusCode: 404,
      statusMessage: "Voyage not found"
    });
  }
  return voyage;
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

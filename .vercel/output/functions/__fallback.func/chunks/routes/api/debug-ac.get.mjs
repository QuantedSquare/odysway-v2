import { a as defineEventHandler, b as activecampaign } from '../../nitro/nitro.mjs';
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

const debugAc_get = defineEventHandler(async (event) => {
  var _a;
  try {
    if (true) {
      return {
        success: true,
        count: 0,
        fields: []
      };
    }
    const meta = await activecampaign.getDealCustomFieldMeta();
    return {
      success: true,
      count: meta.length,
      fields: meta.map((f) => ({
        id: f.id,
        title: f.fieldLabel,
        type: f.fieldType,
        order: f.ordering
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: (_a = error.response) == null ? void 0 : _a.data
    };
  }
});

export { debugAc_get as default };
//# sourceMappingURL=debug-ac.get.mjs.map

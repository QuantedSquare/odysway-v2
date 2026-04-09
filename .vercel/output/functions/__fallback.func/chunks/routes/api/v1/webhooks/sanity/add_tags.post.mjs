import { a as defineEventHandler, A as getHeader, c as createError, f as readBody, u as useRuntimeConfig } from '../../../../../nitro/nitro.mjs';
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

function toTitleCase(input) {
  return input.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
function normalizeTagCandidate(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const sanitized = trimmed.replace(/[^\p{L}\p{N} \-']/gu, "");
  if (!sanitized) return null;
  return sanitized;
}
function unique(items) {
  return Array.from(new Set(items));
}
function deriveSuggestedTags(doc) {
  var _a, _b;
  if (!doc || typeof doc !== "object") return [];
  const typeName = typeof doc._type === "string" ? doc._type : void 0;
  const slugCurrent = typeof ((_a = doc == null ? void 0 : doc.slug) == null ? void 0 : _a.current) === "string" ? doc.slug.current : void 0;
  const byType = () => {
    switch (typeName) {
      case "avisVoyageurs":
        return "avis voyageur";
      case "badge":
        return "badge";
      case "blog": {
        return null;
      }
      case "category":
        return null;
      case "checkout":
        return "checkout";
      case "chequesVacances":
        return "cheque vacances";
      case "ctas":
        return "ctas";
      case "destination":
        return null;
      case "entreprise":
        return "page entreprise";
      case "experience":
        return null;
      case "faq":
        return "faq";
      case "footer":
        return "footer";
      case "header":
        return "header";
      case "homePage":
        return "Page d'accueil";
      case "offreCadeau":
        return "Offre cadeau";
      case "page_voyage":
        return "Text page voyage";
      case "recruitment":
        return "Page recrutement";
      case "region":
        return null;
      case "review":
        return "avatar review";
      case "surMesure":
        return "page sur-mesure";
      case "teamMember":
        return "team";
      case "visionVoyageOdysway":
        return "page vision";
      case "voyage":
        return null;
      default:
        return null;
    }
  };
  const chosen = byType();
  if (chosen) {
    const tag = (_b = normalizeTagCandidate(chosen)) != null ? _b : chosen;
    return [tag].filter((t) => t && t.length <= 80);
  }
  const pairs = {
    blog: "blog",
    category: "categorie",
    destination: "destination",
    experience: "experience",
    region: "region",
    voyage: "voyage"
  };
  if (typeName && Object.prototype.hasOwnProperty.call(pairs, typeName)) {
    const arr = [];
    if (slugCurrent) arr.push(normalizeTagCandidate(slugCurrent) || slugCurrent);
    const label = pairs[typeName];
    if (label) arr.push(label);
    const cleaned = unique(arr.filter((t) => t && t.length <= 80));
    if (cleaned.length > 0) return cleaned;
  }
  if (slugCurrent) return [normalizeTagCandidate(slugCurrent) || slugCurrent];
  if (typeName) return [toTitleCase(typeName)];
  return [];
}
function collectImageReferences(node, path = [], acc = []) {
  if (Array.isArray(node)) {
    node.forEach((child, index) => collectImageReferences(child, [...path, String(index)], acc));
    return acc;
  }
  if (node && typeof node === "object") {
    const obj = node;
    if (obj._type === "image" && obj.asset && typeof obj.asset === "object") {
      const assetRef = obj.asset._ref;
      if (typeof assetRef === "string" && assetRef) {
        acc.push({
          assetRef,
          alt: typeof obj.alt === "string" ? obj.alt : void 0,
          path
        });
      }
    }
    for (const [key, value] of Object.entries(obj)) {
      collectImageReferences(value, [...path, key], acc);
    }
  }
  return acc;
}
const add_tags_post = defineEventHandler(async (event) => {
  var _a;
  const secret = getHeader(event, "x-sanity-webhook-secret");
  const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN;
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized"
    });
  }
  try {
    const body = await readBody(event);
    const images = collectImageReferences(body);
    console.log(`\u2713 Found ${images.length} image reference(s) in updated content`, images);
    const suggestedTags = deriveSuggestedTags(body);
    console.log("\u2713 Suggested tags from document:", suggestedTags);
    let assetsWithTags = [];
    if (images.length > 0) {
      const config = useRuntimeConfig();
      const sanity = createClient({
        projectId: config.public.sanity.projectId,
        dataset: config.public.sanity.dataset,
        apiVersion: config.public.sanity.apiVersion,
        useCdn: false,
        token: config.public.sanity.token
      });
      const assetIds = Array.from(new Set(images.map((i) => i.assetRef)));
      const query = `*[_type == "sanity.imageAsset" && _id in $ids]{
        _id,
        originalFilename,
        url,
        // Raw tags as stored by the Media plugin (may be strings or references)
        "tagsRaw": opt.media.tags,
        // Extract tag references if they exist
        "tagRefs": opt.media.tags[]._ref
      }`;
      try {
        assetsWithTags = await sanity.fetch(query, { ids: assetIds });
        console.log("\u2713 Retrieved tags for assets:", assetsWithTags);
      } catch (err) {
        console.error("Failed to fetch tags for assets", err);
      }
    }
    const tagsDiffByAsset = (assetsWithTags || []).map((asset) => {
      const existingNames = [];
      const existingRefs = [];
      if (Array.isArray(asset.tagsRaw)) {
        asset.tagsRaw.forEach((tag) => {
          if (typeof tag === "string") {
            existingNames.push(tag);
          } else if (tag && typeof tag === "object" && "_ref" in tag) {
            existingRefs.push({
              _type: "reference",
              _ref: tag._ref,
              _weak: true
            });
          }
        });
      }
      if (Array.isArray(asset.tagRefs)) {
        asset.tagRefs.forEach((ref) => {
          if (typeof ref === "string") {
            existingRefs.push({ _type: "reference", _ref: ref, _weak: true });
          }
        });
      }
      const toKey = (s) => s.trim().toLocaleLowerCase();
      const existingSet = new Set(existingNames.map(toKey));
      const suggestedSet = new Set((suggestedTags || []).map(toKey));
      const alreadyPresent = Array.from(suggestedSet).filter((s) => existingSet.has(s));
      const missingTags = Array.from(suggestedSet).filter((s) => !existingSet.has(s));
      const humanAlready = (suggestedTags || []).filter((t) => alreadyPresent.includes(toKey(t)));
      const humanMissing = (suggestedTags || []).filter((t) => missingTags.includes(toKey(t)));
      const uniqueExistingRefs = Array.from(
        new Map(existingRefs.map((ref) => [ref._ref, ref])).values()
      );
      return {
        assetId: asset._id,
        existingTagNames: unique(existingNames),
        existingTagRefs: uniqueExistingRefs,
        suggestedTags: unique(suggestedTags || []),
        alreadyPresent: unique(humanAlready),
        missingTags: unique(humanMissing)
      };
    });
    if (tagsDiffByAsset.length > 0) {
      console.log("\u2713 Tags diff by asset summary:", tagsDiffByAsset);
      const allTagNames = unique(
        tagsDiffByAsset.flatMap((tagDiff) => [
          ...tagDiff.existingTagNames || [],
          ...tagDiff.suggestedTags || []
        ])
      ).filter(Boolean);
      const config = useRuntimeConfig();
      const sanity = createClient({
        projectId: config.public.sanity.projectId,
        dataset: config.public.sanity.dataset,
        apiVersion: config.public.sanity.apiVersion,
        useCdn: false,
        token: SANITY_WRITE_TOKEN
      });
      const tagNameToRef = /* @__PURE__ */ new Map();
      if (allTagNames.length > 0) {
        try {
          const tagQuery = `*[_type == "media.tag"]{
            _id,
            name,
            slug
          }`;
          const existingTags = await sanity.fetch(tagQuery);
          existingTags.forEach((tagDoc) => {
            var _a2, _b;
            const name = ((_a2 = tagDoc.name) == null ? void 0 : _a2.current) || ((_b = tagDoc.slug) == null ? void 0 : _b.current) || tagDoc.name || tagDoc.slug;
            if (name) {
              tagNameToRef.set(name.toLowerCase().trim(), tagDoc._id);
            }
          });
          const tagsToCreate = allTagNames.filter(
            (name) => !tagNameToRef.has(name.toLowerCase().trim())
          );
          for (const tagName of tagsToCreate) {
            try {
              const tagDoc = {
                _type: "media.tag",
                name: {
                  _type: "slug",
                  current: tagName
                }
              };
              const created = await sanity.create(tagDoc);
              tagNameToRef.set(tagName.toLowerCase().trim(), created._id);
              console.log(`\u2713 Created media.tag document for "${tagName}": ${created._id}`);
            } catch (err) {
              console.error(`Failed to create tag "${tagName}":`, err);
            }
          }
        } catch (err) {
          console.error("Error finding/creating tag documents:", err);
        }
      }
      const mutations = tagsDiffByAsset.map((tagDiff) => {
        if (!tagDiff.missingTags || tagDiff.missingTags.length === 0) return null;
        const mergedRefs = [...tagDiff.existingTagRefs || []];
        const mergedTagNames = unique([
          ...tagDiff.existingTagNames || [],
          ...tagDiff.suggestedTags || []
        ]);
        mergedTagNames.forEach((name) => {
          const tagId = tagNameToRef.get(name.toLowerCase().trim());
          if (tagId) {
            mergedRefs.push({ _type: "reference", _ref: tagId, _weak: true });
          }
        });
        const uniqueRefs = Array.from(
          new Map(mergedRefs.map((ref) => [ref._ref, ref])).values()
        );
        return {
          patch: {
            id: tagDiff.assetId,
            setIfMissing: { opt: { media: {} } },
            set: {
              "opt.media.tags": uniqueRefs
            }
          }
        };
      }).filter(Boolean);
      if (mutations.length > 0) {
        console.log("\u2713 Mutations (with tag references):", mutations.length);
        try {
          const result = await sanity.mutate(mutations);
          console.log("\u2713 Mutations applied (tag references):", result);
        } catch (error) {
          console.error("Error applying mutations:", error);
        }
      }
    }
    return {
      ok: true,
      documentId: typeof (body == null ? void 0 : body._id) === "string" ? body._id : void 0,
      documentType: typeof (body == null ? void 0 : body._type) === "string" ? body._type : void 0,
      slug: typeof ((_a = body == null ? void 0 : body.slug) == null ? void 0 : _a.current) === "string" ? body.slug.current : void 0,
      imagesCount: images.length
    };
  } catch (error) {
    console.error("Error adding tags:", error);
    throw createError({
      statusCode: 500,
      message: "Error adding tags"
    });
  }
});

export { add_tags_post as default };
//# sourceMappingURL=add_tags.post.mjs.map

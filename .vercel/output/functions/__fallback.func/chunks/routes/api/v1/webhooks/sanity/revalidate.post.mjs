import { a as defineEventHandler, A as getHeader, c as createError, f as readBody, B as updateAlgoliaIndex, u as useRuntimeConfig } from '../../../../../nitro/nitro.mjs';
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

const revalidate_post = defineEventHandler(async (event) => {
  var _a;
  const secret = getHeader(event, "x-sanity-webhook-secret");
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized"
    });
  }
  try {
    const body = await readBody(event);
    console.log("\u2713 Sanity webhook received:", body);
    const documentType = body._type;
    const slug = (_a = body.slug) == null ? void 0 : _a.current;
    const pathsToRevalidate = [];
    if (documentType === "voyage" && slug) {
      pathsToRevalidate.push(`/voyages/${slug}`);
      pathsToRevalidate.push("/voyages");
      pathsToRevalidate.push("/prochains-departs");
    } else if (documentType === "blog" && slug) {
      pathsToRevalidate.push(`/${slug}`);
      pathsToRevalidate.push("/blog");
    } else if (documentType === "destination" && slug) {
      pathsToRevalidate.push(`/destinations/${slug}`);
      pathsToRevalidate.push("/destinations");
      pathsToRevalidate.push("/voyages");
    } else if (documentType === "category" && slug) {
      pathsToRevalidate.push(`/thematiques/${slug}`);
      pathsToRevalidate.push("/thematiques");
    } else if (documentType === "experience" && slug) {
      pathsToRevalidate.push(`/experiences/${slug}`);
      pathsToRevalidate.push("/experiences");
    } else if (documentType === "homePage") {
      pathsToRevalidate.push("/");
    } else if (documentType === "entreprise") {
      pathsToRevalidate.push("/entreprise");
    } else if (documentType === "surMesure") {
      pathsToRevalidate.push("/sur-mesure");
    } else if (documentType === "visionVoyageOdysway") {
      pathsToRevalidate.push("/vision-voyage-odysway");
    } else if (documentType === "privacyPolicy") {
      pathsToRevalidate.push("/politique-de-confidentialite");
    } else if (documentType === "legalMentions") {
      pathsToRevalidate.push("/mentions-legales");
    } else if (documentType === "chequesVacances") {
      pathsToRevalidate.push("/cheques-vacances");
    } else if (documentType === "conditionsGeneralesVente") {
      pathsToRevalidate.push("/conditions-generales-de-vente");
    } else if (documentType === "confirmation") {
      pathsToRevalidate.push("/confirmation");
    } else if (documentType === "offreCadeau") {
      pathsToRevalidate.push("/offre-cadeau");
    } else if (documentType === "recruitment") {
      pathsToRevalidate.push("/nous-recrutons");
    } else if (documentType === "faq") {
      pathsToRevalidate.push("/faq");
    } else if (documentType === "avisVoyageurs") {
      pathsToRevalidate.push("/avis-voyageurs");
    } else if (documentType === "page_contact") {
      pathsToRevalidate.push("/contact");
    } else if (documentType === "search") {
      pathsToRevalidate.push("/search");
      pathsToRevalidate.push("/voyages");
      pathsToRevalidate.push("/prochains-departs");
    } else if (documentType === "checkout") {
      pathsToRevalidate.push("/checkout");
    } else if (documentType === "devis") {
      pathsToRevalidate.push("/devis");
    } else if (documentType === "page_voyage") {
      console.log("\u26A0\uFE0F  page_voyage updated - all voyage pages will update within 60s via ISR");
    } else if (documentType === "page_thematiques") {
      pathsToRevalidate.push("/thematiques");
      console.log("\u2139\uFE0F  page_thematiques updated - individual category pages update via ISR");
    } else if (documentType === "page_experiences") {
      pathsToRevalidate.push("/experiences");
      console.log("\u2139\uFE0F  page_experiences updated - individual experience pages update via ISR");
    } else if (documentType === "page_blog") {
      pathsToRevalidate.push("/blog");
    } else if (documentType === "header") {
      pathsToRevalidate.push("/");
      pathsToRevalidate.push("/destinations");
      pathsToRevalidate.push("/thematiques");
      pathsToRevalidate.push("/experiences");
      pathsToRevalidate.push("/blog");
      console.log("\u26A0\uFE0F  Header updated - revalidating main navigation pages");
    } else if (documentType === "footer") {
      pathsToRevalidate.push("/");
      pathsToRevalidate.push("/contact");
      console.log("\u26A0\uFE0F  Footer updated - revalidating main pages");
    } else if (documentType === "newsletter") {
      pathsToRevalidate.push("/");
      console.log("\u26A0\uFE0F  Newsletter content updated");
    } else if (documentType === "ctas") {
      pathsToRevalidate.push("/");
      console.log("\u26A0\uFE0F  CTAs updated");
    } else if (documentType === "voyage_card") {
      pathsToRevalidate.push("/search");
      pathsToRevalidate.push("/destinations");
      pathsToRevalidate.push("/thematiques");
      pathsToRevalidate.push("/experiences");
      console.log("\u26A0\uFE0F  Voyage card content updated - revalidating listing pages");
    } else if (["teamMember", "review", "partner", "region", "tops"].includes(documentType)) {
      console.log(`\u2139\uFE0F  ${documentType} updated - referenced content, no direct page to revalidate, revalidating some`);
      pathsToRevalidate.push("/");
      pathsToRevalidate.push("/avis-voyageurs");
      pathsToRevalidate.push("/vision-voyage-odysway");
    } else {
      console.log(`\u26A0\uFE0F  Unknown document type: ${documentType}`);
    }
    if (["voyage", "destination", "region"].includes(documentType)) {
      console.log("\u{1F504} Triggering Algolia index update for type:", documentType);
      updateAlgoliaIndex().then((res) => console.log(`\u2705 Algolia updated: ${res.count} records processed`)).catch((err) => console.error("\u274C Algolia update failed:", err));
    }
    const pathsWithTrailingSlashes = pathsToRevalidate.filter((p) => p !== "/").map((p) => `${p}/`);
    pathsToRevalidate.push(...pathsWithTrailingSlashes);
    const bypassToken = process.env.VERCEL_BYPASS_TOKEN;
    if (bypassToken && pathsToRevalidate.length > 0) {
      const config = useRuntimeConfig();
      const baseUrls = /* @__PURE__ */ new Set();
      const preprodUrl = process.env.PREPROD_SITE_URL || "https://dev.odysway.com";
      if (config.public.siteURL) baseUrls.add(config.public.siteURL);
      baseUrls.add(preprodUrl);
      console.log(`Starting revalidation for ${pathsToRevalidate.length} paths across ${baseUrls.size} base URLs with bypass token: ${bypassToken ? "SET" : "NOT SET"}`);
      const revalidationResults = [];
      for (const baseUrl of baseUrls) {
        for (const path of pathsToRevalidate) {
          try {
            const url = `${baseUrl}${path}`;
            console.log(`Attempting revalidation for ${url} (token length: ${(bypassToken == null ? void 0 : bypassToken.length) || 0})`);
            const response = await fetch(url, {
              method: "GET",
              headers: {
                "x-prerender-revalidate": bypassToken,
                "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0"
              },
              redirect: "follow"
            });
            await response.text().catch(() => {
            });
            const cacheStatus = response.headers.get("x-vercel-cache") || "UNKNOWN";
            const vercelId = response.headers.get("x-vercel-id") || "UNKNOWN";
            const isSuccess = cacheStatus === "BYPASS" || cacheStatus === "MISS" || cacheStatus === "STALE";
            console.log(`Revalidation response for ${url}:`, {
              status: response.status,
              cacheStatus,
              isSuccess,
              vercelId,
              bypassTokenLength: (bypassToken == null ? void 0 : bypassToken.length) || 0,
              headers: {
                "x-vercel-cache": cacheStatus,
                "x-vercel-id": vercelId,
                "cache-control": response.headers.get("cache-control")
              }
            });
            if (cacheStatus === "HIT") {
              console.log(`\u26A0\uFE0F  Cache HIT for ${url} - bypass token not recognized (Nuxt 3 ISR limitation)`);
              revalidationResults.push({
                baseUrl,
                path,
                status: "warning",
                cacheStatus,
                note: "HIT - will update via 60s ISR fallback"
              });
            } else if (isSuccess || response.status === 200) {
              revalidationResults.push({ baseUrl, path, status: "success", cacheStatus, note: response.status === 200 ? "Status 200" : void 0 });
            } else {
              revalidationResults.push({ baseUrl, path, status: "warning", cacheStatus });
            }
            if (pathsToRevalidate.length > 1) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`\u274C Failed to revalidate ${path} on ${baseUrl}:`, err);
            revalidationResults.push({ baseUrl, path, status: "failed", error: errorMessage });
          }
        }
      }
      const hasHits = revalidationResults.some((r) => r.cacheStatus === "HIT");
      return {
        success: true,
        message: hasHits ? "Webhook processed. Pages will update within 60 seconds via ISR." : "On-demand revalidation triggered. Changes are live!",
        documentType,
        slug,
        revalidationResults,
        note: hasHits ? "Bypass token not recognized - using 60s ISR fallback (normal for Nuxt 3)" : "Instant revalidation working",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    console.log("\u26A0\uFE0F  No VERCEL_BYPASS_TOKEN configured. Relying on time-based ISR (60s)");
    console.log("\u2713 Content updated, affected paths:", pathsToRevalidate);
    return {
      success: true,
      message: "Webhook received. Content will update within 60 seconds via ISR.",
      documentType,
      slug,
      pathsAffected: pathsToRevalidate,
      note: "For instant updates, configure VERCEL_BYPASS_TOKEN",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    console.error("\u274C Webhook error:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to process webhook"
    });
  }
});

export { revalidate_post as default };
//# sourceMappingURL=revalidate.post.mjs.map

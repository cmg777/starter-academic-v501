// geo-lang.ts — Geolocation-based language routing for carlos-mendez.org
//
// Runs ONLY for the homepage "/" (see `config.path` below). English lives at "/"
// (defaultContentLanguageInSubdir: false), so there is no "/en/". Visitors from a
// Spanish-speaking country are 302-redirected to "/es/" on their FIRST homepage
// visit, unless they have a saved manual preference. A manual choice (lang_pref,
// set by assets/js/lang-pref.js) always wins, and the auto-redirect fires at most
// once per browser (geo_seen), so it never loops or nags.
//
// SEO-safe: a 302 (not a rewrite) keeps "/" = English canonical and "/es/" =
// Spanish canonical, each with reciprocal hreflang + x-default. No user-agent
// sniffing — cookieless crawlers from non-mapped geographies simply get English.
//
// Free on Netlify's Starter tier (~1M edge invocations/month); only "/" invokes it.

import type { Config, Context } from "https://edge.netlify.com";

// Country (ISO 3166-1 alpha-2, UPPERCASE) -> language path.
// To add a language later, add lines here (e.g. Japan -> "/ja/").
const COUNTRY_TO_LANG: Record<string, string> = {
  // Spain + Equatorial Guinea
  ES: "/es/", GQ: "/es/",
  // North & Central America + Caribbean
  MX: "/es/", GT: "/es/", HN: "/es/", SV: "/es/", NI: "/es/",
  CR: "/es/", PA: "/es/", CU: "/es/", DO: "/es/", PR: "/es/",
  // South America
  CO: "/es/", VE: "/es/", EC: "/es/", PE: "/es/", BO: "/es/",
  PY: "/es/", UY: "/es/", AR: "/es/", CL: "/es/",
  // Japan
  JP: "/ja/",
};

// Languages we actually publish ("en" is the default, served at "/").
// Used to validate the override cookie so a stale value can't misroute.
const KNOWN_LANGS = new Set(["en", "es", "ja"]);

const PREF = "lang_pref"; // manual choice (set by client JS)
const SEEN = "geo_seen"; // "already auto-evaluated" marker (set here)

export default async (
  request: Request,
  context: Context,
): Promise<Response | void> => {
  const url = new URL(request.url);
  if (url.pathname !== "/") return; // homepage only (defense in depth)

  // 1) Manual choice wins forever.
  const pref = context.cookies.get(PREF);
  if (pref && KNOWN_LANGS.has(pref)) {
    if (pref === "en") return; // chose English -> stay on "/"
    return Response.redirect(new URL(`/${pref}/`, url), 302);
  }

  // 2) Already auto-evaluated this browser -> never auto-redirect again.
  if (context.cookies.get(SEEN)) return;

  // 3) Mark as seen regardless of outcome, so the auto-redirect fires at most once.
  context.cookies.set({
    name: SEEN,
    value: "1",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: true,
    sameSite: "Lax",
  });

  // 4) Geo lookup. Unknown / non-mapped country (incl. most crawlers) -> no redirect.
  const country = (context.geo?.country?.code ?? "").toUpperCase();
  const target = COUNTRY_TO_LANG[country];
  if (!target) return;

  // 5) Spanish-speaking country, no override, first visit -> 302 to /es/.
  const res = Response.redirect(new URL(target, url), 302);
  // Don't let the CDN cache this per-visitor decision and serve it to everyone.
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("Netlify-Vary", "country|cookie=lang_pref,geo_seen");
  return res;
};

export const config: Config = {
  path: "/",
  // Belt-and-suspenders: never touch assets or language subpaths.
  excludedPath: [
    "/js/*", "/css/*", "/img/*", "/media/*", "/uploads/*",
    "/*.png", "/*.jpg", "/*.jpeg", "/*.webp", "/*.svg", "/*.ico",
    "/*.json", "/*.xml", "/*.webmanifest", "/_redirects", "/_headers",
  ],
};

// Records visits that arrive from an AI assistant (ChatGPT, Perplexity,
// Gemini, Claude, Copilot and so on), including the visitor's IP address.
//
// How it works, in plain terms:
// - It looks at every page request (not images, styles or scripts).
// - If the visitor came from an AI assistant, it saves one small record to
//   Netlify Blobs, in a store called "ai-visits", one record per visit.
// - It never changes the page and never slows it down: the record is saved
//   after the page has already been sent. If saving fails for any reason,
//   the visitor still gets the page normally.
//
// Where to read the records: Netlify > this project > Data & Storage > Blobs
// > ai-visits, or the export page (see ai-visits-export.ts).

import type { Config, Context } from "@netlify/edge-functions";
import { getStore } from "https://esm.sh/@netlify/blobs@11.1.1";

// Websites of AI assistants. A visit counts if the page that sent the visitor
// (the "referrer") or the utm_source tag on the link matches one of these.
const AI_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "openai.com",
  "perplexity.ai",
  "gemini.google.com",
  "bard.google.com",
  "claude.ai",
  "copilot.microsoft.com",
  "copilot.com",
  "edgeservices.bing.com",
  "you.com",
  "poe.com",
  "grok.com",
  "meta.ai",
  "duck.ai",
  "chat.mistral.ai",
  "deepseek.com",
  "chat.deepseek.com",
];

function matchAiHost(value: string | null): string | null {
  if (!value) return null;
  let host = value.trim().toLowerCase();
  try {
    if (host.includes("://")) host = new URL(host).hostname;
  } catch {
    return null;
  }
  host = host.replace(/^www\./, "").split("/")[0];
  for (const ai of AI_HOSTS) {
    if (host === ai || host.endsWith("." + ai)) return ai;
  }
  return null;
}

export default async (request: Request, context: Context) => {
  // Only real page loads.
  if (request.method !== "GET") return;
  const accept = request.headers.get("accept") || "";
  if (!accept.includes("text/html")) return;

  const url = new URL(request.url);
  const referrer = request.headers.get("referer");
  const utmSource = url.searchParams.get("utm_source");

  const matched = matchAiHost(referrer) || matchAiHost(utmSource);
  if (!matched) return;

  const now = new Date();
  const record = {
    time_utc: now.toISOString(),
    site: context.site?.name ?? url.hostname,
    deploy_context: context.deploy?.context ?? null,
    ip: context.ip ?? null,
    ai_source: matched,
    arrived_via: matchAiHost(referrer) ? "referrer" : "utm_source",
    page: url.pathname,
    query: url.search,
    referrer: referrer,
    user_agent: request.headers.get("user-agent"),
    language: request.headers.get("accept-language"),
    city: context.geo?.city ?? null,
    state: context.geo?.subdivision?.code ?? null,
    country: context.geo?.country?.code ?? null,
    postal_code: context.geo?.postalCode ?? null,
    request_id: context.requestId ?? null,
  };

  // Key groups records into one folder per day, e.g. 2026-10-19/....
  const key = `${record.time_utc.slice(0, 10)}/${record.time_utc}-${
    record.request_id ?? crypto.randomUUID()
  }`;

  context.waitUntil(
    getStore("ai-visits")
      .setJSON(key, record)
      .catch((err: unknown) => console.log("ai-visit-log: could not save", String(err))),
  );

  // Returning nothing lets the page load exactly as it normally would.
  return;
};

export const config: Config = {
  path: "/*",
  excludedPath: [
    "/_astro/*",
    "/admin/*",
    "/ai-visits-export",
    "/*.css",
    "/*.js",
    "/*.mjs",
    "/*.json",
    "/*.xml",
    "/*.txt",
    "/*.ico",
    "/*.png",
    "/*.jpg",
    "/*.jpeg",
    "/*.webp",
    "/*.avif",
    "/*.gif",
    "/*.svg",
    "/*.woff",
    "/*.woff2",
    "/*.pdf",
    "/*.webmanifest",
  ],
  // If anything in this function ever errors, skip it and serve the page.
  onError: "bypass",
};

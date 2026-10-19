// Download every AI-assistant visit record as one spreadsheet (CSV file).
//
// Locked by default. It only works after you add an environment variable in
// Netlify called AI_LOG_KEY (Project configuration > Environment variables),
// and then only when the address includes that same value:
//   https://THIS-SITE/ai-visits-export?key=THE-VALUE-YOU-CHOSE
// Without the variable, or with the wrong value, the page answers "Not found".

import type { Config, Context } from "@netlify/edge-functions";
import { getStore } from "https://esm.sh/@netlify/blobs@11.1.1";

const COLUMNS = [
  "time_utc",
  "site",
  "ip",
  "ai_source",
  "arrived_via",
  "page",
  "query",
  "referrer",
  "user_agent",
  "language",
  "city",
  "state",
  "country",
  "postal_code",
  "deploy_context",
  "request_id",
];

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default async (request: Request, _context: Context) => {
  const notFound = new Response("Not found", { status: 404 });
  const expected = Netlify.env.get("AI_LOG_KEY");
  const given = new URL(request.url).searchParams.get("key");
  if (!expected || !given || given !== expected) return notFound;

  const store = getStore("ai-visits");
  const { blobs } = await store.list();
  const rows: Record<string, unknown>[] = [];
  for (const blob of blobs) {
    const entry = await store.get(blob.key, { type: "json" });
    if (entry) rows.push(entry as Record<string, unknown>);
  }
  rows.sort((a, b) => String(a.time_utc).localeCompare(String(b.time_utc)));

  const lines = [COLUMNS.join(",")];
  for (const row of rows) lines.push(COLUMNS.map((c) => csvCell(row[c])).join(","));

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="ai-visits.csv"',
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
};

export const config: Config = {
  path: "/ai-visits-export",
};

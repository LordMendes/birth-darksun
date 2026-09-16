#!/usr/bin/env node
/**
 * Import Digital Wanderer atlas XML into web/data/atlas/locations.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW_DIR = path.join(ROOT, "web", "data", "atlas", "wanderer-raw");
const OUT = path.join(ROOT, "web", "data", "atlas", "locations.json");
const BASE = "https://www.digitalwanderer.net/darksun/xmldata";

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function kindFromType(type) {
  switch (type) {
    case "City":
      return "city-state";
    case "Village":
      return "village";
    case "Fortress":
      return "fort";
    case "Oasis":
      return "oasis";
    case "Ruins":
      return "ruins";
    case "Special":
      return "landmark";
    default:
      return "landmark";
  }
}

function folderFromKind(kind) {
  if (kind === "landmark" || kind === "ruins") return "landmarks";
  return "settlements";
}

function parseLandmarkAttrs(xml) {
  const m = xml.match(/<landmark([^>]*)\/?>/i);
  if (!m) return null;
  const attrs = {};
  for (const [, key, val] of m[1].matchAll(/(\w+)="([^"]*)"/g)) {
    attrs[key] = val;
  }
  return attrs;
}

function parseTextBody(xml) {
  const textMatch = xml.match(/<text>([\s\S]*?)<\/text>/i);
  if (!textMatch) return null;
  const inner = textMatch[1];
  const cdata = inner.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdata) return cdata[1].trim();
  const stripped = inner.replace(/<[^>]+>/g, "").trim();
  return stripped || null;
}

async function fetchXml(name) {
  const local = path.join(RAW_DIR, `${name}.xml`);
  if (fs.existsSync(local)) {
    return fs.readFileSync(local, "utf8");
  }
  const url = `${BASE}/${name}.xml`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(local, text);
  await new Promise((r) => setTimeout(r, 100));
  return text;
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  const indexPath = path.join(RAW_DIR, "locations.xml");
  if (!fs.existsSync(indexPath)) {
    const res = await fetch(`${BASE}/locations.xml`);
    fs.writeFileSync(indexPath, await res.text());
  }
  const indexXml = fs.readFileSync(indexPath, "utf8");
  const landmarks = [...indexXml.matchAll(/<landmark([^>]*)\/>/g)].map((m) => {
    const attrs = {};
    for (const [, key, val] of m[1].matchAll(/(\w+)="([^"]*)"/g)) {
      attrs[key] = val;
    }
    return attrs;
  });

  const places = [];
  for (const lm of landmarks) {
    const id = slugify(lm.title);
    let detail = {};
    let summary = null;
    let wandererType = null;
    let population = null;
    let reference = null;

    try {
      const detailXml = await fetchXml(lm.fulltext);
      detail = parseLandmarkAttrs(detailXml) ?? {};
      summary = parseTextBody(detailXml);
      wandererType = detail.type ?? null;
      population = detail.population ?? null;
      reference = detail.ref ?? null;
    } catch (err) {
      console.warn(`Skip detail for ${lm.title}:`, err.message);
    }

    const kind = kindFromType(wandererType ?? "Special");
    const folder = folderFromKind(kind);

    places.push({
      id,
      name: lm.title,
      kind,
      wandererPixels: {
        x: Number(lm.xposition),
        y: Number(lm.yposition),
      },
      world: null,
      docSlug: `world/${folder}/${id}`,
      overlayId: null,
      wandererType,
      population: population && population !== "Unknown" ? population : null,
      summary,
      reference,
      labelPosition: lm.label === "bottom" ? "bottom" : "top",
    });
  }

  places.sort((a, b) => a.name.localeCompare(b.name, "en"));

  const catalog = {
    version: 1,
    era: "FY 10",
    scale: "2e-miles",
    places,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`Wrote ${places.length} places to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

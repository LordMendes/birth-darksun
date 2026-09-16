import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeRoute, shortestPath } from "@/lib/atlas/dijkstra";
import type { TradeGraph } from "@/lib/atlas/types";
import fs from "node:fs";
import path from "node:path";

function loadGraph(): TradeGraph {
  const file = path.join(process.cwd(), "data", "atlas", "trade-graph.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as TradeGraph;
}

describe("trade route dijkstra", () => {
  const graph = loadGraph();

  it("Tyr to Fort Skonz is 26 miles", () => {
    const route = computeRoute(graph, "tyr", "fort-skonz");
    assert.ok(route);
    assert.equal(route!.miles, 26);
  });

  it("Tyr to Urik uses trade hubs not crow-flies", () => {
    const route = computeRoute(graph, "tyr", "urik");
    assert.ok(route);
    assert.ok(route!.path.includes("fort-skonz"));
    assert.ok(route!.miles > 100);
  });

  it("Nibenay to Gulg is long via trade routes", () => {
    const pathResult = shortestPath(graph, "nibenay", "gulg");
    assert.ok(pathResult);
    const route = computeRoute(graph, "nibenay", "gulg");
    assert.ok(route!.miles > 100);
  });

  it("direction Tyr->Urik equals Urik->Tyr", () => {
    const a = computeRoute(graph, "tyr", "urik");
    const b = computeRoute(graph, "urik", "tyr");
    assert.equal(a!.miles, b!.miles);
  });
});

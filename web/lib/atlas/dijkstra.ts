import type { RouteResult, TradeGraph, TravelSpeed } from "@/lib/atlas/types";

const SPEED_FACTOR: Record<TravelSpeed, number> = {
  20: 2,
  30: 3,
  40: 4,
  50: 5,
};

const TERRAIN_MODIFIER = 0.75;
const HOURS_PER_DAY_35 = 8;

function buildAdjacency(graph: TradeGraph): Map<string, { to: string; miles: number }[]> {
  const adj = new Map<string, { to: string; miles: number }[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of graph.edges) {
    adj.get(edge.from)?.push({ to: edge.to, miles: edge.miles });
    adj.get(edge.to)?.push({ to: edge.from, miles: edge.miles });
  }
  return adj;
}

export function shortestPath(
  graph: TradeGraph,
  originId: string,
  destId: string,
): string[] | null {
  if (originId === destId) return [originId];

  const adj = buildAdjacency(graph);
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const node of graph.nodes) {
    dist.set(node.id, Infinity);
    prev.set(node.id, null);
  }
  dist.set(originId, 0);

  while (visited.size < graph.nodes.length) {
    let u: string | null = null;
    let best = Infinity;
    for (const node of graph.nodes) {
      if (visited.has(node.id)) continue;
      const d = dist.get(node.id)!;
      if (d < best) {
        best = d;
        u = node.id;
      }
    }
    if (u === null || best === Infinity) break;
    if (u === destId) break;
    visited.add(u);

    for (const { to, miles } of adj.get(u) ?? []) {
      const alt = best + miles;
      if (alt < (dist.get(to) ?? Infinity)) {
        dist.set(to, alt);
        prev.set(to, u);
      }
    }
  }

  if ((dist.get(destId) ?? Infinity) === Infinity) return null;

  const path: string[] = [];
  let cur: string | null = destId;
  while (cur) {
    path.unshift(cur);
    cur = prev.get(cur) ?? null;
  }
  return path[0] === originId ? path : null;
}

export function routeMiles(graph: TradeGraph, path: string[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const edge = graph.edges.find(
      (e) => (e.from === a && e.to === b) || (e.from === b && e.to === a),
    );
    if (!edge) throw new Error(`Missing edge ${a} -> ${b}`);
    total += edge.miles;
  }
  return total;
}

export function travelHours(miles: number, speed: TravelSpeed): number {
  const raw = miles / (SPEED_FACTOR[speed] * TERRAIN_MODIFIER);
  return Math.round(raw * 10) / 10;
}

export function travelDays35(hours: number): number {
  return Math.round((hours / HOURS_PER_DAY_35) * 10) / 10;
}

export function computeRoute(
  graph: TradeGraph,
  originId: string,
  destId: string,
  speed: TravelSpeed = 30,
): RouteResult | null {
  const path = shortestPath(graph, originId, destId);
  if (!path) return null;
  const miles = routeMiles(graph, path);
  const hours = travelHours(miles, speed);
  const nameById = new Map(graph.nodes.map((n) => [n.id, n.name]));
  return {
    path,
    pathNames: path.map((id) => nameById.get(id) ?? id),
    miles,
    hours,
    days35: travelDays35(hours),
  };
}

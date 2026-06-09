import type { Note, Todo } from "@/lib/types";
import { mapTodosToVirtualNotes } from "@/domain/todoVirtualNotes";

const GRAPH_VB_W = 1600;
const GRAPH_VB_H = 1100;
const CLUSTER_NODE_SCALE = 9;
const CLUSTER_MIN_NODE_RADIUS = 35;
const CLUSTER_MAX_NODE_RADIUS = 85;
const NODE_RADIUS = 13;
const EDGE_NODE_PADDING = 16;

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  note: Note;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  relations: string[];
}

export interface GraphCluster {
  room: string | null;
  label: string | null;
  cx: number;
  cy: number;
  r: number;
}

export interface GraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
}

interface ReferenceSignals {
  tags: Set<string>;
  rooms: Set<string>;
  noteRefs: Set<string>;
}

interface OwnerSignals {
  tags: Set<string>;
  room: string | null;
}

export interface RenderedEdge {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  weight: number;
  relations: string[];
}

export function toGraphEntries(notes: Note[], todos: Todo[]): Note[] {
  return [...notes, ...mapTodosToVirtualNotes(todos)];
}

export function buildGraph(notes: Note[]): GraphModel {
  if (notes.length === 0) return { nodes: [], edges: [], clusters: [] };

  const refs = buildReferenceSignals(notes);
  const owners = buildOwnerSignals(notes);
  const edges = buildEdges(notes, refs, owners);
  const roomWeights = buildRoomWeights(notes, edges);
  const { nodes, clusters } = buildClusteredLayout(notes, roomWeights);
  refineNodePositions(nodes, edges);

  return { nodes, clusters, edges };
}

function refineNodePositions(nodes: GraphNode[], edges: GraphEdge[]): void {
  if (nodes.length <= 1 || nodes.length > 100) return;

  const nodeById = new Map<string, GraphNode>();
  nodes.forEach((n) => nodeById.set(n.id, n));

  const pairWeight = new Map<string, number>();
  for (const e of edges) {
    const a = nodeById.get(e.from);
    const b = nodeById.get(e.to);
    if (!a || !b) continue;
    if ((a.note.room?.trim() ?? "") !== (b.note.room?.trim() ?? "")) continue;
    const key = e.from < e.to ? `${e.from}|${e.to}` : `${e.to}|${e.from}`;
    pairWeight.set(key, (pairWeight.get(key) ?? 0) + e.weight);
  }

  const anchor = new Map<string, { x: number; y: number }>();
  nodes.forEach((n) => anchor.set(n.id, { x: n.x, y: n.y }));

  const REPULSE = NODE_RADIUS * 3.4;
  const ANCHOR_K = 0.07;
  const ATTRACT_K = 0.045;
  const ITERS = 50;

  for (let iter = 0; iter < ITERS; iter++) {
    const forces = new Map<string, { fx: number; fy: number }>();
    nodes.forEach((n) => forces.set(n.id, { fx: 0, fy: 0 }));

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist < REPULSE) {
          const push = ((REPULSE - dist) / REPULSE) * 4.5;
          const fa = forces.get(a.id)!;
          const fb = forces.get(b.id)!;
          fa.fx += (dx / dist) * push;
          fa.fy += (dy / dist) * push;
          fb.fx -= (dx / dist) * push;
          fb.fy -= (dy / dist) * push;
        }
      }
    }

    pairWeight.forEach((w, key) => {
      const sep = key.indexOf("|");
      const a = nodeById.get(key.slice(0, sep));
      const b = nodeById.get(key.slice(sep + 1));
      if (!a || !b) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const attract = ATTRACT_K * w * Math.min(dist, 90);
      const fa = forces.get(a.id)!;
      const fb = forces.get(b.id)!;
      fa.fx += (dx / dist) * attract;
      fa.fy += (dy / dist) * attract;
      fb.fx -= (dx / dist) * attract;
      fb.fy -= (dy / dist) * attract;
    });

    nodes.forEach((n) => {
      const a = anchor.get(n.id)!;
      const f = forces.get(n.id)!;
      f.fx += (a.x - n.x) * ANCHOR_K;
      f.fy += (a.y - n.y) * ANCHOR_K;
    });

    const temp = 7 * Math.max(0.1, 1 - iter / ITERS);
    nodes.forEach((n) => {
      const f = forces.get(n.id)!;
      const mag = Math.hypot(f.fx, f.fy) || 1;
      const step = Math.min(mag, temp);
      n.x += (f.fx / mag) * step;
      n.y += (f.fy / mag) * step;
    });
  }
}

function buildRoomWeights(notes: Note[], edges: GraphEdge[]): Map<string, number> {
  const nodeRoom = new Map<string, string>();
  notes.forEach((n) => nodeRoom.set(n.id, n.room?.trim() || ""));

  const weights = new Map<string, number>();
  for (const edge of edges) {
    const ra = nodeRoom.get(edge.from) ?? "";
    const rb = nodeRoom.get(edge.to) ?? "";
    if (ra === rb) continue;
    const key = ra <= rb ? `${ra}§${rb}` : `${rb}§${ra}`;
    weights.set(key, (weights.get(key) ?? 0) + edge.weight);
  }
  return weights;
}

function buildClusteredLayout(
  notes: Note[],
  roomWeights: Map<string, number>,
): { nodes: GraphNode[]; clusters: GraphCluster[] } {
  const roomGroups = new Map<string, Note[]>();
  for (const note of notes) {
    const room = note.room?.trim() || "";
    const group = roomGroups.get(room) ?? [];
    group.push(note);
    roomGroups.set(room, group);
  }

  const sorted = [...roomGroups.entries()].sort(([aR, aG], [bR, bG]) => {
    if (aR === "" && bR !== "") return 1;
    if (aR !== "" && bR === "") return -1;
    return bG.length - aG.length;
  });

  const numClusters = sorted.length;
  const nodes: GraphNode[] = [];
  const clusters: GraphCluster[] = [];
  if (numClusters === 0) return { nodes, clusters };

  const maxMiniR = sorted.reduce((max, [, roomNotes]) => {
    const n = roomNotes.length;
    if (n <= 1) return max;
    return Math.max(
      max,
      Math.min(CLUSTER_MAX_NODE_RADIUS, Math.max(CLUSTER_MIN_NODE_RADIUS, n * CLUSTER_NODE_SCALE)),
    );
  }, CLUSTER_MIN_NODE_RADIUS);
  const k = (maxMiniR + NODE_RADIUS + 14) * 2 + 80;

  const cols = Math.max(1, Math.ceil(Math.sqrt(numClusters * 1.4)));
  const positions = new Map<string, { x: number; y: number }>();
  sorted.forEach(([room], ci) => {
    const col = ci % cols;
    const row = Math.floor(ci / cols);
    const h = room ? hashId(room) : 0;
    positions.set(room, {
      x: col * k + ((h % 200) / 200 - 0.5) * k * 0.1,
      y: row * k + (((h >> 9) % 200) / 200 - 0.5) * k * 0.1,
    });
  });

  const roomIds = sorted.map(([room]) => room);
  const ITERATIONS = 80;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const forces = new Map<string, { fx: number; fy: number }>();
    roomIds.forEach((id) => forces.set(id, { fx: 0, fy: 0 }));

    for (let i = 0; i < roomIds.length; i++) {
      for (let j = i + 1; j < roomIds.length; j++) {
        const pa = positions.get(roomIds[i])!;
        const pb = positions.get(roomIds[j])!;
        const dx = pa.x - pb.x;
        const dy = pa.y - pb.y;
        const dist = Math.max(Math.hypot(dx, dy), 1);
        const repulse = (k * k) / dist;
        const fa = forces.get(roomIds[i])!;
        const fb = forces.get(roomIds[j])!;
        fa.fx += (dx / dist) * repulse;
        fa.fy += (dy / dist) * repulse;
        fb.fx -= (dx / dist) * repulse;
        fb.fy -= (dy / dist) * repulse;
      }
    }

    roomWeights.forEach((weight, key) => {
      const sep = key.indexOf("§");
      const ra = key.slice(0, sep);
      const rb = key.slice(sep + 1);
      const pa = positions.get(ra);
      const pb = positions.get(rb);
      if (!pa || !pb) return;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const dist = Math.max(Math.hypot(dx, dy), 1);
      const attract = ((dist * dist) / k) * Math.log1p(weight);
      const fa = forces.get(ra);
      const fb = forces.get(rb);
      if (!fa || !fb) return;
      fa.fx += (dx / dist) * attract;
      fa.fy += (dy / dist) * attract;
      fb.fx -= (dx / dist) * attract;
      fb.fy -= (dy / dist) * attract;
    });

    roomIds.forEach((id) => {
      const p = positions.get(id)!;
      const f = forces.get(id)!;
      f.fx -= p.x * 0.04;
      f.fy -= p.y * 0.04;
    });

    const temp = k * Math.max(0.01, (1 - iter / ITERATIONS) ** 1.5);
    roomIds.forEach((id) => {
      const p = positions.get(id)!;
      const f = forces.get(id)!;
      const mag = Math.hypot(f.fx, f.fy) || 1;
      const step = Math.min(mag, temp);
      p.x += (f.fx / mag) * step;
      p.y += (f.fy / mag) * step;
    });
  }

  if (roomIds.length === 1) {
    const pos = positions.get(roomIds[0])!;
    pos.x = GRAPH_VB_W / 2;
    pos.y = GRAPH_VB_H / 2;
  } else if (roomIds.length > 1) {
    const xs = roomIds.map((id) => positions.get(id)!.x);
    const ys = roomIds.map((id) => positions.get(id)!.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = maxX - minX || k;
    const spanY = maxY - minY || k;
    const pad = 120;
    const scaleX = (GRAPH_VB_W - pad * 2) / spanX;
    const scaleY = (GRAPH_VB_H - pad * 2) / spanY;
    const scale = Math.min(scaleX, scaleY);
    const originX = GRAPH_VB_W / 2 - ((minX + maxX) / 2) * scale;
    const originY = GRAPH_VB_H / 2 - ((minY + maxY) / 2) * scale;
    roomIds.forEach((id) => {
      const p = positions.get(id)!;
      p.x = originX + p.x * scale;
      p.y = originY + p.y * scale;
    });

    const clusterExclusionR = new Map<string, number>(
      sorted.map(([room, roomNotes]) => {
        const n = roomNotes.length;
        const miniR =
          n <= 1
            ? 0
            : Math.min(
                CLUSTER_MAX_NODE_RADIUS,
                Math.max(CLUSTER_MIN_NODE_RADIUS, n * CLUSTER_NODE_SCALE),
              );
        return [room, Math.max(miniR + NODE_RADIUS + 14, NODE_RADIUS + 20) + 18];
      }),
    );
    for (let oi = 0; oi < 80; oi++) {
      let anyMoved = false;
      for (let i = 0; i < roomIds.length; i++) {
        for (let j = i + 1; j < roomIds.length; j++) {
          const pa = positions.get(roomIds[i])!;
          const pb = positions.get(roomIds[j])!;
          const minDist =
            (clusterExclusionR.get(roomIds[i]) ?? 0) + (clusterExclusionR.get(roomIds[j]) ?? 0);
          const dx = pb.x - pa.x;
          const dy = pb.y - pa.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          if (dist < minDist) {
            const push = (minDist - dist) / 2 + 0.5;
            const ux = dx / dist;
            const uy = dy / dist;
            pa.x -= ux * push;
            pa.y -= uy * push;
            pb.x += ux * push;
            pb.y += uy * push;
            anyMoved = true;
          }
        }
      }
      if (!anyMoved) break;
    }

    const cxs = roomIds.map((id) => positions.get(id)!.x);
    const cys = roomIds.map((id) => positions.get(id)!.y);
    const driftX = GRAPH_VB_W / 2 - (Math.min(...cxs) + Math.max(...cxs)) / 2;
    const driftY = GRAPH_VB_H / 2 - (Math.min(...cys) + Math.max(...cys)) / 2;
    roomIds.forEach((id) => {
      const p = positions.get(id)!;
      p.x += driftX;
      p.y += driftY;
    });
  }

  sorted.forEach(([room, roomNotes]) => {
    const pos = positions.get(room)!;
    const { x: cx, y: cy } = pos;

    const n = roomNotes.length;
    const miniR =
      n === 1
        ? 0
        : Math.min(
            CLUSTER_MAX_NODE_RADIUS,
            Math.max(CLUSTER_MIN_NODE_RADIUS, n * CLUSTER_NODE_SCALE),
          );

    roomNotes.forEach((note, ni) => {
      const noteAngle = n === 1 ? 0 : (2 * Math.PI * ni) / n - Math.PI / 2;
      const wobble = (hashId(note.id) % 14) - 7;
      nodes.push({
        id: note.id,
        note,
        x: cx + Math.cos(noteAngle) * (miniR + wobble),
        y: cy + Math.sin(noteAngle) * (miniR + wobble),
      });
    });

    if (room !== "") {
      clusters.push({
        room,
        label: room.replace(/[-_]+/g, " "),
        cx,
        cy,
        r: Math.max(miniR + NODE_RADIUS + 14, NODE_RADIUS + 20),
      });
    }
  });

  return { nodes, clusters };
}

function buildReferenceSignals(notes: Note[]): Map<string, ReferenceSignals> {
  const refs = new Map<string, ReferenceSignals>();
  notes.forEach((note) => {
    refs.set(note.id, extractReferences(note));
  });
  return refs;
}

function buildOwnerSignals(notes: Note[]): Map<string, OwnerSignals> {
  const owners = new Map<string, OwnerSignals>();
  notes.forEach((note) => {
    owners.set(note.id, {
      tags: new Set<string>(note.tags.map((t) => normalizeTag(t))),
      room: note.room ? normalizeRoom(note.room) : null,
    });
  });
  return owners;
}

function buildEdges(
  notes: Note[],
  refs: Map<string, ReferenceSignals>,
  owners: Map<string, OwnerSignals>,
): GraphEdge[] {
  const edges: GraphEdge[] = [];

  const idsByRoom = new Map<string, string[]>();
  const idsByTag = new Map<string, string[]>();
  const idBySlug = new Map<string, string>();
  const slugById = new Map<string, string>();

  notes.forEach((note) => {
    const slug = normalizeNoteSlug(note.title);
    idBySlug.set(slug, note.id);
    slugById.set(note.id, slug);
  });

  owners.forEach((owner, ownerId) => {
    if (owner.room) {
      const roomOwners = idsByRoom.get(owner.room);
      if (roomOwners) roomOwners.push(ownerId);
      else idsByRoom.set(owner.room, [ownerId]);
    }

    owner.tags.forEach((tag) => {
      const tagOwners = idsByTag.get(tag);
      if (tagOwners) tagOwners.push(ownerId);
      else idsByTag.set(tag, [ownerId]);
    });
  });

  for (const source of notes) {
    const sourceRefs = refs.get(source.id);
    if (!sourceRefs) continue;

    const candidateTargetIds = new Set<string>();

    sourceRefs.noteRefs.forEach((slug) => {
      const targetId = idBySlug.get(slug);
      if (targetId && targetId !== source.id) candidateTargetIds.add(targetId);
    });

    sourceRefs.rooms.forEach((room) => {
      const roomOwners = idsByRoom.get(room);
      if (!roomOwners) return;
      roomOwners.forEach((targetId) => candidateTargetIds.add(targetId));
    });

    sourceRefs.tags.forEach((tag) => {
      const tagOwners = idsByTag.get(tag);
      if (!tagOwners) return;
      tagOwners.forEach((targetId) => candidateTargetIds.add(targetId));
    });

    candidateTargetIds.delete(source.id);

    candidateTargetIds.forEach((targetId) => {
      const targetOwner = owners.get(targetId);
      if (!targetOwner) return;

      const targetSlug = slugById.get(targetId) ?? "";
      const edge = buildDirectedEdge(source.id, targetId, targetSlug, sourceRefs, targetOwner);
      if (edge) edges.push(edge);
    });
  }

  return edges;
}

function buildDirectedEdge(
  sourceId: string,
  targetId: string,
  targetSlug: string,
  sourceRefs: ReferenceSignals,
  targetOwner: OwnerSignals,
): GraphEdge | null {
  if (sourceRefs.noteRefs.has(targetSlug)) {
    return { from: sourceId, to: targetId, weight: 3, relations: ["note"] };
  }

  let weight = 0;
  const relations: string[] = [];

  if (targetOwner.room && sourceRefs.rooms.has(targetOwner.room)) {
    weight += 1;
    relations.push("room");
  }

  const sharedTags = intersectCount(sourceRefs.tags, targetOwner.tags);
  if (sharedTags > 0) {
    weight += Math.min(sharedTags, 2);
    relations.push("tag");
  }

  if (weight === 0) return null;
  return { from: sourceId, to: targetId, weight, relations };
}

function extractReferences(note: Note): ReferenceSignals {
  const tags = new Set<string>();
  const rooms = new Set<string>();
  const noteRefs = new Set<string>();

  const raw = `${note.title} ${note.body}`;

  const hashMatches = raw.match(/(?<!\w)#[\w-]+/g) ?? [];
  hashMatches.forEach((tok) => tags.add(normalizeTag(tok.slice(1))));

  const roomMatches = raw.match(/(?<!\w)@[\w-]+/g) ?? [];
  roomMatches.forEach((tok) => rooms.add(normalizeRoom(tok.slice(1))));

  const noteRefMatches = raw.match(/(?<!\w)\^[\w-]+/g) ?? [];
  noteRefMatches.forEach((tok) => noteRefs.add(tok.slice(1).toLowerCase()));

  return { tags, rooms, noteRefs };
}

export function indexNodes(nodes: GraphNode[]) {
  const map = new Map<string, GraphNode>();
  nodes.forEach((node) => {
    map.set(node.id, node);
  });
  return map;
}

export function edgeAppearance(relations: string[]): { stroke: string; marker: string } {
  if (relations.includes("note"))
    return { stroke: "rgba(50,190,100,0.70)", marker: "url(#graph-arrow-note)" };
  const hasRoom = relations.includes("room");
  const hasTag = relations.includes("tag");
  if (hasRoom && hasTag)
    return { stroke: "rgba(140,100,210,0.55)", marker: "url(#graph-arrow-both)" };
  if (hasRoom) return { stroke: "rgba(224,150,40,0.60)", marker: "url(#graph-arrow-room)" };
  return { stroke: "rgba(70,150,210,0.60)", marker: "url(#graph-arrow-tag)" };
}

export function buildRenderedEdges(
  edges: GraphEdge[],
  nodeById: Map<string, GraphNode>,
  clusters: GraphCluster[],
): RenderedEdge[] {
  const clusterByRoom = new Map<string, GraphCluster>();
  for (const cluster of clusters) {
    if (cluster.room) clusterByRoom.set(cluster.room, cluster);
  }

  const clusterByNoteId = new Map<string, GraphCluster>();
  for (const [id, node] of nodeById) {
    const room = node.note.room?.trim();
    if (room) {
      const cluster = clusterByRoom.get(room);
      if (cluster) clusterByNoteId.set(id, cluster);
    }
  }

  const collapsed = new Map<string, Omit<RenderedEdge, "key">>();

  for (const edge of edges) {
    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);
    if (!fromNode || !toNode) continue;

    const isDirectRef = edge.relations.includes("note");
    const fromCluster = isDirectRef ? null : clusterByNoteId.get(edge.from);
    const toCluster = isDirectRef ? null : clusterByNoteId.get(edge.to);

    const fromKey = fromCluster ? `cluster:${fromCluster.room}` : edge.from;
    const toKey = toCluster ? `cluster:${toCluster.room}` : edge.to;

    if (fromKey === toKey) continue;

    const fromX = fromCluster ? fromCluster.cx : fromNode.x;
    const fromY = fromCluster ? fromCluster.cy : fromNode.y;
    const toX = toCluster ? toCluster.cx : toNode.x;
    const toY = toCluster ? toCluster.cy : toNode.y;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy) || 1;

    const fromPad = fromCluster ? fromCluster.r : EDGE_NODE_PADDING;
    const toPad = toCluster ? toCluster.r : EDGE_NODE_PADDING;

    const x1 = fromX + (dx / dist) * fromPad;
    const y1 = fromY + (dy / dist) * fromPad;
    const x2 = toX - (dx / dist) * toPad;
    const y2 = toY - (dy / dist) * toPad;

    const key = `${fromKey}→${toKey}`;
    const existing = collapsed.get(key);
    if (existing) {
      collapsed.set(key, {
        ...existing,
        weight: Math.max(existing.weight, edge.weight),
        relations: [...new Set([...existing.relations, ...edge.relations])],
      });
    } else {
      collapsed.set(key, { x1, y1, x2, y2, weight: edge.weight, relations: edge.relations });
    }
  }

  return [...collapsed.entries()].map(([key, data]) => ({ key, ...data }));
}

export function trim(value: string, len: number) {
  if (value.length <= len) return value;
  return `${value.slice(0, len - 1)}…`;
}

function normalizeTag(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function normalizeRoom(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function normalizeNoteSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function intersectCount(a: Set<string>, b: Set<string>) {
  let count = 0;
  for (const value of a) {
    if (b.has(value)) count += 1;
  }
  return count;
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

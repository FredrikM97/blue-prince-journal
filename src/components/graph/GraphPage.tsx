import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Button } from "@/components/common/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { FilterSection } from "@/components/common/filter/FilterSection";
import { FilterToggleGrid } from "@/components/common/filter/FilterToggleGrid";
import { GroupedRoomFilterSection } from "@/components/common/filter/GroupedRoomFilterSection";
import { PageLayout } from "@/components/common/PageLayout";
import { SidePanelLeft } from "@/components/common/SidePanel";
import { MetaText } from "@/components/common/Typography";
import { Stack } from "@/components/common/general/Stack";
import { BookOpen, Eye, Key, Lightbulb, ListTodo, Maximize2, Sparkles } from "lucide-react";
import { db } from "@/data/db";
import { GraphPreviewContent } from "@/components/graph/GraphRightPanel";
import type { Note, Todo } from "@/lib/types";
import { useLiveQueryArray } from "@/hooks/useLiveQueryArray";
import {
  buildGraph,
  buildRenderedEdges,
  edgeAppearance,
  indexNodes,
  toGraphEntries,
  trim,
  type GraphCluster,
  type GraphNode,
  type RenderedEdge,
} from "@/domain/graph";
import {
  computeZoomPanFromWheelDelta,
  summarizeWheelZoomEvents,
  useNonPassiveWheel,
} from "@/hooks/useNonPassiveWheel";
import { themeVars } from "@/components/graph/themeVars";

const ALL_NOTE_TYPES = ["clue", "code", "observation", "theory", "story", "task"] as const;

const GRAPH_VB_W = 1600;
const GRAPH_VB_H = 1100;
const GRAPH_VIEWBOX = `0 0 ${GRAPH_VB_W} ${GRAPH_VB_H}`;
const NODE_RADIUS = 13;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3.0;
const NODE_ICON_SIZE = 12;

const TYPE_COLOR: Record<Note["type"], string> = {
  clue: themeVars.graphNode.clue,
  code: themeVars.graphNode.code,
  observation: themeVars.graphNode.observation,
  theory: themeVars.graphNode.theory,
  story: themeVars.graphNode.story,
  task: themeVars.graphNode.task,
};

const TYPE_ICON: Record<
  Note["type"],
  React.ComponentType<{ size?: number; className?: string }>
> = {
  clue: Lightbulb,
  code: Key,
  observation: Eye,
  theory: Sparkles,
  story: BookOpen,
  task: ListTodo,
};
export function GraphPage() {
  const notes: Note[] = useLiveQueryArray(() => db.notes.toArray());
  const todos: Todo[] = useLiveQueryArray(() => db.todos.toArray());
  const dataVersion = notes.length + todos.length;
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [hiddenRooms, setHiddenRooms] = useState<Set<string>>(new Set());
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [hideIsolated, setHideIsolated] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const graphEntries = useMemo(() => toGraphEntries(notes, todos), [notes, todos]);

  const allRooms = useMemo(() => {
    const rooms = new Set<string>();
    for (const n of graphEntries) rooms.add(n.room?.trim() || "");
    return [...rooms].sort((a, b) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)));
  }, [graphEntries]);

  const visibleEntries = useMemo(
    () =>
      hiddenRooms.size === 0 && hiddenTypes.size === 0
        ? graphEntries
        : graphEntries.filter(
            (n) =>
              (hiddenRooms.size === 0 || !hiddenRooms.has(n.room?.trim() || "")) &&
              (hiddenTypes.size === 0 || !hiddenTypes.has(n.type)),
          ),
    [graphEntries, hiddenRooms, hiddenTypes],
  );

  const { nodes, edges, clusters } = useMemo(() => buildGraph(visibleEntries), [visibleEntries]);

  // IDs of nodes that have at least one edge (used by the isolated-nodes filter)
  const connectedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const e of edges) {
      ids.add(e.from);
      ids.add(e.to);
    }
    return ids;
  }, [edges]);

  // Nodes to actually render — optionally hiding isolated (no-edge) ones
  const displayNodes = useMemo(
    () => (hideIsolated ? nodes.filter((n) => connectedNodeIds.has(n.id)) : nodes),
    [nodes, hideIsolated, connectedNodeIds],
  );

  const displayRoomSet = useMemo(
    () => new Set(displayNodes.map((node) => node.note.room?.trim() || "")),
    [displayNodes],
  );

  const visibleClusters = useMemo(
    () => clusters.filter((cluster) => displayRoomSet.has(cluster.room ?? "")),
    [clusters, displayRoomSet],
  );

  const nodeById = useMemo(() => indexNodes(displayNodes), [displayNodes]);
  const renderedEdges = useMemo(
    () => buildRenderedEdges(edges, nodeById, visibleClusters),
    [edges, nodeById, visibleClusters],
  );
  const selectedNodeId = useMemo(
    () =>
      selectedNoteId && displayNodes.some((node) => node.id === selectedNoteId)
        ? selectedNoteId
        : null,
    [displayNodes, selectedNoteId],
  );
  const selectedNode = useMemo(
    () => displayNodes.find((node) => node.id === selectedNodeId) ?? null,
    [displayNodes, selectedNodeId],
  );

  const incomingCount = selectedNode
    ? edges.filter((edge) => edge.to === selectedNode.id).length
    : 0;
  const outgoingCount = selectedNode
    ? edges.filter((edge) => edge.from === selectedNode.id).length
    : 0;

  useEffect(() => {
    if (!selectedNode) {
      setPreviewOpen(false);
      return;
    }
    setPreviewOpen(true);
  }, [selectedNode]);

  // Isolated node count — for showing the badge on the toggle
  const isolatedCount = nodes.length - connectedNodeIds.size;

  let onResetTypes: (() => void) | undefined = undefined;
  if (hiddenTypes.size > 0) onResetTypes = () => setHiddenTypes(new Set());

  let onResetRooms: (() => void) | undefined = undefined;
  if (hiddenRooms.size > 0) onResetRooms = () => setHiddenRooms(new Set());

  const typeFilterItems = ALL_NOTE_TYPES.map((type) => ({
    key: type,
    label: type,
    active: !hiddenTypes.has(type),
    dotColor: TYPE_COLOR[type],
    onToggle: () =>
      setHiddenTypes((prev) => {
        const next = new Set(prev);
        if (next.has(type)) next.delete(type);
        else next.add(type);
        return next;
      }),
  }));

  const visibilityFilterItems = [
    {
      key: "connected-only",
      label: `Connected only (${isolatedCount} hidden)`,
      active: hideIsolated,
      onToggle: () => setHideIsolated((value) => !value),
      dotColor: hideIsolated ? "#f59e0b" : "#64748b",
    },
  ];

  const canvasProps = {
    nodes: displayNodes,
    clusters: visibleClusters,
    renderedEdges,
    selectedNoteId,
    dataVersion,
    onSelectNote: setSelectedNoteId,
  };

  return (
    <>
      <PageLayout
        variant="panel"
      >
        <PageLayout.Left>
          <SidePanelLeft
            title="Graph"
            subtitle={`${displayNodes.length} entries · ${edges.length} links`}
          >
            <Stack gap="3">
              <FilterSection
                title="Types"
                collapsible
                defaultOpen
                width="fit"
                variant="compact"
                onReset={onResetTypes}
              >
                <FilterToggleGrid
                  items={typeFilterItems}
                  size="compact"
                  layout="wrap"
                  width="fit"
                  activeStyle="filled"
                />
              </FilterSection>

              {allRooms.length > 1 && (
                <GroupedRoomFilterSection
                  rooms={allRooms}
                  isRoomActive={(room) => !hiddenRooms.has(room)}
                  onToggleRoom={(room) => {
                    setHiddenRooms((prev) => {
                      const next = new Set(prev);
                      if (next.has(room)) next.delete(room);
                      else next.add(room);
                      return next;
                    });
                  }}
                  onResetAll={onResetRooms}
                  title="Rooms"
                  defaultOpen={false}
                />
              )}

              {isolatedCount > 0 && (
                <FilterSection
                  title="Visibility"
                  collapsible
                  defaultOpen
                  width="fit"
                  variant="compact"
                >
                  <FilterToggleGrid
                    items={visibilityFilterItems}
                    leftAligned
                    size="compact"
                    layout="wrap"
                    width="fit"
                    activeStyle="filled"
                  />
                </FilterSection>
              )}
            </Stack>
          </SidePanelLeft>
        </PageLayout.Left>
        <PageLayout.Middle>
          <Stack className="flex h-full min-h-0 flex-col overflow-hidden h-[calc(100dvh-5.5rem)]" gap="0">
            {nodes.length === 0 && (
              <EmptyState>
                No notes or todos yet. Add entries to build your connection graph.
              </EmptyState>
            )}
            {nodes.length > 0 && (
              <GraphCanvas
                {...canvasProps}
                actions={
                  <Button variant="outline" size="sm" onClick={() => setFullscreenOpen(true)}>
                    <Maximize2 size={13} />
                    Expand
                  </Button>
                }
              />
            )}
          </Stack>
        </PageLayout.Middle>
      </PageLayout>

      <Dialog
        open={previewOpen && Boolean(selectedNode)}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setSelectedNoteId(null);
        }}
      >
        <DialogContent variant="wide">
          <DialogHeader>
            <DialogTitle>{selectedNode ? selectedNode.note.title : "Graph entry"}</DialogTitle>
          </DialogHeader>
          <GraphPreviewContent
            noteCount={displayNodes.length}
            edgeCount={edges.length}
            selectedNote={selectedNode?.note ?? null}
            incomingCount={incomingCount}
            outgoingCount={outgoingCount}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent variant="fullscreen">
          <DialogHeader>
            <DialogTitle>Graph explorer</DialogTitle>
          </DialogHeader>
          <GraphCanvas {...canvasProps} plain />
        </DialogContent>
      </Dialog>
    </>
  );
}

function GraphCanvas({
  nodes,
  clusters,
  renderedEdges,
  selectedNoteId,
  dataVersion,
  onSelectNote,
  actions,
  plain,
}: {
  nodes: GraphNode[];
  clusters: GraphCluster[];
  renderedEdges: RenderedEdge[];
  selectedNoteId: string | null;
  dataVersion: number;
  onSelectNote: (id: string) => void;
  actions?: ReactNode;
  plain?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewportRef = useRef<SVGGElement | null>(null);
  const wheelDeltaRef = useRef(0);
  const wheelFocusRef = useRef({ x: GRAPH_VB_W / 2, y: GRAPH_VB_H / 2 });
  const wheelPinchRef = useRef(false);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{
    startSvgX: number;
    startSvgY: number;
    panX: number;
    panY: number;
  } | null>(null);

  function applyViewportTransform(nextZoom: number, nextPan: { x: number; y: number }) {
    zoomRef.current = nextZoom;
    panRef.current = nextPan;
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.setAttribute(
      "transform",
      `matrix(${nextZoom} 0 0 ${nextZoom} ${nextPan.x} ${nextPan.y})`,
    );
  }

  function toSvgPoint(clientX: number, clientY: number, element: SVGSVGElement) {
    const pt = element.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = element.getScreenCTM();
    if (!ctm) {
      const rect = element.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }
    return pt.matrixTransform(ctm.inverse());
  }

  function resetView() {
    applyViewportTransform(1, { x: 0, y: 0 });
  }

  function startDrag(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const tag = (event.target as Element).tagName.toLowerCase();
    if (tag !== "svg" && tag !== "rect") return;
    const svgPt = toSvgPoint(event.clientX, event.clientY, event.currentTarget);
    dragRef.current = {
      startSvgX: svgPt.x,
      startSvgY: svgPt.y,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    setIsDragging(true);
  }

  function updateDrag(event: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const svgPt = toSvgPoint(event.clientX, event.clientY, event.currentTarget);
    applyViewportTransform(zoomRef.current, {
      x: drag.panX + (svgPt.x - drag.startSvgX),
      y: drag.panY + (svgPt.y - drag.startSvgY),
    });
    event.preventDefault();
  }

  function stopDrag(event?: PointerEvent<SVGSVGElement>) {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  }

  useEffect(() => {
    applyViewportTransform(1, { x: 0, y: 0 });
    // Reset graph viewport when data set changes (React remount key covers svg internals).
  }, [dataVersion]);

  useNonPassiveWheel(
    svgRef,
    (events) => {
      const svg = svgRef.current;
      if (!svg) return;

      const summary = summarizeWheelZoomEvents(events, (event) =>
        toSvgPoint(event.clientX, event.clientY, svg),
      );
      if (!summary) return;

      wheelFocusRef.current = summary.focus;
      wheelPinchRef.current = summary.isPinch;
      wheelDeltaRef.current = summary.delta;

      const result = computeZoomPanFromWheelDelta({
        currentZoom: zoomRef.current,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        pan: panRef.current,
        focus: wheelFocusRef.current,
        wheelDelta: wheelDeltaRef.current,
        wheelFactor: wheelPinchRef.current ? 0.04 : 0.18,
      });
      if (!result.changed) return;
      applyViewportTransform(result.nextZoom, result.nextPan);
    },
    {
      coalesceToAnimationFrame: true,
      preventDefault: true,
    },
  );

  let frameClassName = "flex flex-col gap-2 overflow-hidden rounded-lg border border-border bg-card p-2";
  if (plain) frameClassName = "flex flex-col gap-2 overflow-hidden rounded-lg p-2";

  let svgClassName = "min-h-0 flex-1 touch-none cursor-grab";
  if (isDragging) svgClassName = "min-h-0 flex-1 touch-none cursor-grabbing";

  return (
    <Stack className={frameClassName} gap="0">
      <Stack className="flex shrink-0 items-center justify-between text-sm text-muted-foreground" gap="0">
        <MetaText as="p" size="xs" className="hidden text-xs sm:block">
          Drag to pan · scroll to zoom.
        </MetaText>
        <Stack className="flex items-center gap-1.5" gap="0">
          {actions}
          <Stack gap="0" className="flex items-center">
            <Stack gap="0" className="">
              <Button
                variant="outline"
                size="sm"
                className="rounded-r-none border-r-0 px-2"
                onClick={() => {
                  const cx = GRAPH_VB_W / 2;
                  const cy = GRAPH_VB_H / 2;
                  const z = zoomRef.current;
                  const p = panRef.current;
                  const nz = Math.max(MIN_ZOOM, parseFloat((z / 1.3).toFixed(4)));
                  applyViewportTransform(nz, {
                    x: cx - ((cx - p.x) / z) * nz,
                    y: cy - ((cy - p.y) / z) * nz,
                  });
                }}
              >
                −
              </Button>
            </Stack>
            <Stack gap="0" className="">
              <Button
                variant="outline"
                size="sm"
                className="rounded-l-none px-2"
                onClick={() => {
                  const cx = GRAPH_VB_W / 2;
                  const cy = GRAPH_VB_H / 2;
                  const z = zoomRef.current;
                  const p = panRef.current;
                  const nz = Math.min(MAX_ZOOM, parseFloat((z * 1.3).toFixed(4)));
                  applyViewportTransform(nz, {
                    x: cx - ((cx - p.x) / z) * nz,
                    y: cy - ((cy - p.y) / z) * nz,
                  });
                }}
              >
                +
              </Button>
            </Stack>
          </Stack>
          <Button variant="outline" size="sm" onClick={resetView}>
            Reset view
          </Button>
        </Stack>
      </Stack>

      <svg
        ref={svgRef}
        key={`graph-${dataVersion}`}
        viewBox={GRAPH_VIEWBOX}
        width="100%"
        height="100%"
        className={svgClassName}
        onPointerDown={startDrag}
        onPointerMove={updateDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <rect x="0" y="0" width={GRAPH_VB_W} height={GRAPH_VB_H} fill="transparent" />
        <defs>
          {(
            [
              { id: "room", fill: themeVars.graphLink.room },
              { id: "tag", fill: themeVars.graphLink.tag },
              { id: "both", fill: themeVars.graphLink.both },
              { id: "note", fill: themeVars.graphLink.note },
            ] as const
          ).map(({ id, fill }) => (
            <marker
              key={id}
              id={`graph-arrow-${id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={fill} />
            </marker>
          ))}
        </defs>

        <g ref={viewportRef} transform="matrix(1 0 0 1 0 0)">
          {clusters.map((cluster) => renderCluster(cluster))}
          {renderedEdges.map(({ key, x1, y1, x2, y2, weight, relations }) => {
            const { stroke, marker } = edgeAppearance(relations);
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            const len = Math.hypot(x2 - x1, y2 - y1) || 1;
            const curvature = Math.min(len * 0.1, 32);
            // Curve perpendicular-right relative to edge direction
            const cpx = mx + ((y1 - y2) / len) * curvature;
            const cpy = my + ((x2 - x1) / len) * curvature;
            return (
              <path
                key={key}
                d={`M ${x1},${y1} Q ${cpx},${cpy} ${x2},${y2}`}
                fill="none"
                stroke={stroke}
                strokeWidth={Math.min(1 + weight * 0.4, 2.5)}
                markerEnd={marker}
              />
            );
          })}
          {nodes.map((node) =>
            renderNode(node, {
              selected: node.id === selectedNoteId,
              onSelect: () => onSelectNote(node.id),
            }),
          )}
        </g>
      </svg>

      <Stack className="flex shrink-0 flex-wrap items-center gap-4 text-[10px] text-muted-foreground" gap="0">
        <MetaText as="span" className="font-medium uppercase tracking-wide">
          Links:
        </MetaText>
        {[
          { color: themeVars.graphLink.room, label: "room" },
          { color: themeVars.graphLink.tag, label: "tag" },
          { color: themeVars.graphLink.both, label: "room + tag" },
          { color: themeVars.graphLink.note, label: "note" },
        ].map(({ color, label }) => (
          <Stack key={label} as="span" className="flex items-center gap-1.5 uppercase tracking-wide" gap="0">
            <span
              style={{
                background: color,
                display: "inline-block",
                width: "1.5rem",
                height: "2px",
                borderRadius: "9999px",
              }}
            />
            {label}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

function renderNode(
  node: GraphNode,
  {
    selected,
    onSelect,
  }: {
    selected: boolean;
    onSelect: () => void;
  },
) {
  const Icon = TYPE_ICON[node.note.type];
  const stroke = selected ? themeVars.ring : themeVars.foreground;
  const strokeWidth = selected ? 2.2 : 1.1;
  const labelScale = 1;

  return (
    <g
      key={node.id}
      role="button"
      tabIndex={0}
      className="cursor-pointer"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <circle
        cx={node.x}
        cy={node.y}
        r={NODE_RADIUS}
        fill={TYPE_COLOR[node.note.type]}
        stroke={stroke}
        strokeWidth={strokeWidth}
      >
        <title>{node.note.title}</title>
      </circle>

      <g transform={`translate(${node.x - NODE_ICON_SIZE / 2} ${node.y - NODE_ICON_SIZE / 2})`}>
        <Icon size={NODE_ICON_SIZE} className="text-black/80" />
      </g>

      <g transform={`translate(${node.x + 18} ${node.y + 5}) scale(${labelScale})`}>
        <text fill={themeVars.foreground} fontSize="14" fontWeight="500" opacity="0.92">
          {trim(node.note.title, 22)}
        </text>
      </g>
    </g>
  );
}

function renderCluster(cluster: GraphCluster) {
  return (
    <g key={`cluster-${cluster.room}`}>
      <circle
        cx={cluster.cx}
        cy={cluster.cy}
        r={cluster.r}
        fill={themeVars.foreground}
        fillOpacity="0.03"
        stroke={themeVars.foreground}
        strokeOpacity="0.14"
        strokeWidth="1"
        strokeDasharray="5 3"
      />
      <text
        x={cluster.cx}
        y={cluster.cy + cluster.r + 13}
        fill={themeVars.foreground}
        fillOpacity="0.45"
        fontSize="10"
        textAnchor="middle"
        fontStyle="italic"
      >
        {cluster.label}
      </text>
    </g>
  );
}


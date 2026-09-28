import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  NodeResizer,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

type NarrativeNodeData = {
  title: string
  summary: string
  kindLabel: string
}

type NarrativeNode = Node<NarrativeNodeData, "chat" | "content">

const initialNodes: NarrativeNode[] = [
  {
    id: "opening-question",
    type: "chat",
    position: { x: 80, y: 120 },
    data: {
      title: "Opening question",
      summary: "What does Mara sacrifice to keep the forest awake?",
      kindLabel: "Chat node",
    },
    style: { width: 290, height: 180 },
    ariaLabel: "Chat node: Opening question",
  },
  {
    id: "forest-law",
    type: "content",
    position: { x: 490, y: 30 },
    data: {
      title: "Forest law",
      summary: "Every promise becomes a path that can be followed in reverse.",
      kindLabel: "Content node",
    },
    style: { width: 270, height: 150 },
    ariaLabel: "Content node: Forest law",
  },
  {
    id: "alternate-ending",
    type: "chat",
    position: { x: 520, y: 300 },
    data: {
      title: "Alternate ending",
      summary: "Mara keeps the forest awake, but can no longer return home.",
      kindLabel: "Chat node",
    },
    style: { width: 310, height: 190 },
    ariaLabel: "Chat node: Alternate ending",
  },
]

const initialEdges: Edge[] = [
  {
    id: "branch-premise-law",
    source: "opening-question",
    target: "forest-law",
    label: "establishes",
    markerEnd: { type: MarkerType.ArrowClosed },
    ariaLabel: "Branch from Opening question to Forest law: establishes",
  },
  {
    id: "branch-premise-ending",
    source: "opening-question",
    target: "alternate-ending",
    label: "explores",
    markerEnd: { type: MarkerType.ArrowClosed },
    ariaLabel: "Branch from Opening question to Alternate ending: explores",
  },
]

function NarrativeNodeCard({ data, selected }: NodeProps<NarrativeNode>) {
  return (
    <>
      <NodeResizer isVisible={selected} minWidth={220} minHeight={120} />
      <Handle
        type="target"
        position={Position.Left}
        aria-label={`Connect an incoming branch to ${data.title}`}
      />
      <article className="flex size-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{data.kindLabel}</p>
        <h2 className="mt-2 text-base font-semibold text-card-foreground">{data.title}</h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">{data.summary}</p>
      </article>
      <Handle
        type="source"
        position={Position.Right}
        aria-label={`Start a branch from ${data.title}`}
      />
    </>
  )
}

const nodeTypes = {
  chat: NarrativeNodeCard,
  content: NarrativeNodeCard,
}

export function CanvasSpike() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  function onConnect(connection: Connection) {
    setEdges((currentEdges) =>
      addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed } }, currentEdges),
    )
  }

  return (
    <main className="grid min-h-svh grid-rows-[auto_1fr] bg-background text-foreground">
      <header className="border-b border-border bg-card px-5 py-4 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Phase 2.1 proof</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Canvas Technology Spike</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          This is an in-memory interaction proof. It does not load, persist, or infer narrative or LLM context.
        </p>
      </header>
      <section className="grid min-h-0 lg:grid-cols-[minmax(15rem,19rem)_1fr]" aria-label="Canvas proof">
        <aside className="border-b border-border bg-muted/30 p-5 lg:border-r lg:border-b-0">
          <h2 className="font-semibold">Interaction checklist</h2>
          <ul className="mt-3 space-y-2 text-sm leading-5 text-muted-foreground">
            <li>Drag the canvas, scroll or pinch to zoom, and use the control panel to fit the view.</li>
            <li>Drag a node to reposition it. Select a node to reveal its resize handles.</li>
            <li>Drag from a right handle to a left handle to add a directed branch.</li>
            <li>Use Tab to focus nodes and branches. Enter or Space selects; arrow keys move a selected node.</li>
          </ul>
          <p className="mt-5 rounded-lg border border-border bg-card p-3 text-sm leading-5 text-muted-foreground">
            Visual placement and branches in this proof are presentation only. They do not transfer Markdown, chat,
            node summaries, branch summaries, or LLM context.
          </p>
        </aside>
        <div className="min-h-[34rem]" data-testid="canvas-spike">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
            fitView
            minZoom={0.25}
            maxZoom={2}
            nodesFocusable
            edgesFocusable
            disableKeyboardA11y={false}
            aria-label="Narrative canvas technology proof. Use the canvas controls to zoom and fit the view."
            ariaLabelConfig={{
              "controls.ariaLabel": "Canvas controls",
              "node.a11yDescription.default":
                "Press Enter or Space to select this node. Use arrow keys to move a selected node.",
            }}
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
          </ReactFlow>
        </div>
      </section>
    </main>
  )
}

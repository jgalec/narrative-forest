import {
  addEdge,
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  NodeResizer,
  Panel,
  Position,
  ReactFlow,
  useReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import { useEffect, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

import "@xyflow/react/dist/style.css"

type NarrativeNodeData = {
  title: string
  summary: string
  kind: "chat" | "content" | "sticky"
}

type NarrativeNode = Node<NarrativeNodeData, "chat" | "content" | "sticky">

type ConversationMessage = {
  id: string
  author: "assistant" | "user"
  text: string
}

type CanvasSnapshot = {
  nodes: NarrativeNode[]
  edges: Edge[]
  selectedNodeId: string
}

const initialNodes: NarrativeNode[] = [
  {
    id: "opening-question",
    type: "chat",
    position: { x: 80, y: 120 },
    data: {
      title: "Opening question",
      summary: "What does Mara sacrifice to keep the forest awake?",
      kind: "chat",
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
      kind: "content",
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
      kind: "chat",
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

const initialMessages: Record<string, ConversationMessage[]> = {
  "opening-question": [
    { id: "message-1", author: "assistant", text: "What must Mara give up to keep the forest awake?" },
    {
      id: "message-2",
      author: "user",
      text: "The sacrifice could be her ability to follow any path back home.",
    },
    {
      id: "message-3",
      author: "assistant",
      text: "That keeps the choice personal without deciding the ending yet.",
    },
    { id: "message-4", author: "user", text: "I will keep the ending open for this conversation." },
    {
      id: "message-5",
      author: "assistant",
      text: "This representative chat belongs only to the selected node.",
    },
  ],
}

const defaultFitViewOptions = {
  maxZoom: 0.9,
  padding: 0.3,
}

function NarrativeNodeCard({ data, selected }: NodeProps<NarrativeNode>) {
  const isChat = data.kind === "chat"
  const isSticky = data.kind === "sticky"

  return (
    <>
      <NodeResizer isVisible={selected} minWidth={220} minHeight={120} />
      <Handle
        type="target"
        position={Position.Left}
        aria-label={`Connect an incoming branch to ${data.title}`}
      />
      <article
        className={`flex size-full flex-col rounded-2xl border-2 p-4 shadow-sm ${
          isChat
            ? "border-primary/50 bg-primary/10"
            : isSticky
              ? "border-primary/30 bg-primary/5"
              : "border-border bg-card"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {isChat ? "Chat node" : isSticky ? "Sticky note" : "Content node"}
        </p>
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
  sticky: NarrativeNodeCard,
}

function CanvasAction({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <Button
      className="size-12 rounded-full shadow-sm"
      size="icon-lg"
      variant="outline"
      aria-label={`Canvas action: ${label}`}
      disabled={disabled}
      onClick={onClick}
      title={label}
    >
      {children}
    </Button>
  )
}

function CanvasActions({
  onAddNode,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  onAddNode: (kind: "chat" | "sticky") => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}) {
  const { fitView, zoomIn, zoomOut } = useReactFlow()

  return (
    <>
      <Panel position="top-right" className="m-6 flex flex-col gap-4">
        <CanvasAction label="Zoom in" onClick={() => zoomIn({ duration: 200 })}>
          <i className="fa-solid fa-magnifying-glass-plus text-lg" aria-hidden="true" />
        </CanvasAction>
        <CanvasAction label="Zoom out" onClick={() => zoomOut({ duration: 200 })}>
          <i className="fa-solid fa-magnifying-glass-minus text-lg" aria-hidden="true" />
        </CanvasAction>
        <CanvasAction label="Restore default view" onClick={() => fitView({ ...defaultFitViewOptions, duration: 200 })}>
          <i className="fa-solid fa-expand text-lg" aria-hidden="true" />
        </CanvasAction>
      </Panel>
      <Panel position="bottom-right" className="m-6 flex flex-col gap-4">
        <CanvasAction label="Add normal node" onClick={() => onAddNode("chat")}>
          <i className="fa-solid fa-plus text-lg" aria-hidden="true" />
        </CanvasAction>
        <CanvasAction label="Add sticky note" onClick={() => onAddNode("sticky")}>
          <i className="fa-regular fa-note-sticky text-lg" aria-hidden="true" />
        </CanvasAction>
        <CanvasAction label="Undo last canvas change" onClick={onUndo} disabled={!canUndo}>
          <i className="fa-solid fa-arrow-rotate-left text-lg" aria-hidden="true" />
        </CanvasAction>
        <CanvasAction label="Redo last canvas change" onClick={onRedo} disabled={!canRedo}>
          <i className="fa-solid fa-arrow-rotate-right text-lg" aria-hidden="true" />
        </CanvasAction>
      </Panel>
    </>
  )
}

function ConversationSidebarTrigger() {
  const { state, toggleSidebar } = useSidebar()

  return (
    <Panel position="top-left" className="m-6">
      <Button
        aria-label="Toggle conversation sidebar"
        className="size-12 rounded-full shadow-sm"
        onClick={toggleSidebar}
        size="icon-lg"
        title={state === "expanded" ? "Collapse conversation sidebar" : "Open conversation sidebar"}
        variant="outline"
      >
        <i className="fa-solid fa-comments text-lg" aria-hidden="true" />
      </Button>
    </Panel>
  )
}

function ConversationPanel({
  node,
  messages,
  draft,
  onDraftChange,
  onSend,
}: {
  node: NarrativeNode
  messages: ConversationMessage[]
  draft: string
  onDraftChange: (draft: string) => void
  onSend: () => void
}) {
  const [loadedNodeId, setLoadedNodeId] = useState<string | null>(null)
  const isLoading = loadedNodeId !== node.id

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoadedNodeId(node.id), 250)
    return () => window.clearTimeout(timeout)
  }, [node.id])

  function onDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <Sidebar
      aria-label="Conversation panel"
      className="!p-2 [&_[data-slot=sidebar-inner]]:overflow-hidden [&_[data-slot=sidebar-inner]]:rounded-[24px]"
      collapsible="offcanvas"
      role="complementary"
      side="left"
      variant="floating"
    >
      <SidebarHeader className="border-b bg-muted/50 px-4 py-4">
        <header className="flex min-h-24 flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{node.data.title}</h1>
          <p className="text-sm text-muted-foreground">{node.id}</p>
          <div className="flex flex-wrap gap-2" aria-label="Conversation tags">
            <Badge variant="secondary">Node only</Badge>
            <Badge variant="secondary">No branch context</Badge>
            <Badge variant="secondary">Local draft</Badge>
          </div>
        </header>
      </SidebarHeader>

      <SidebarContent className="p-4" aria-busy={isLoading} aria-live="polite">
        {isLoading ? (
          <div aria-label="Loading conversation" className="flex flex-1 flex-col gap-4 pb-4">
            <Skeleton className="h-16 max-w-[67%] rounded-2xl" />
            <Skeleton className="ml-auto h-16 w-[59%] rounded-2xl" />
            <Skeleton className="h-16 w-[64%] rounded-2xl" />
            <Skeleton className="ml-auto h-16 max-w-[67%] rounded-2xl" />
            <Skeleton className="h-16 w-[56%] rounded-2xl" />
          </div>
        ) : (
          <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <MessageScroller className="flex-1">
              <MessageScrollerViewport aria-label="Conversation messages">
                <MessageScrollerContent className="gap-4 pb-4">
                  {(messages.length > 0 ? messages : [{ id: "summary", author: "assistant" as const, text: node.data.summary }]).map(
                    (message) => (
                      <MessageScrollerItem
                        key={message.id}
                        messageId={message.id}
                        scrollAnchor={message.author === "user"}
                      >
                        <Message align={message.author === "user" ? "end" : "start"}>
                          <MessageContent>
                            <Bubble
                              align={message.author === "user" ? "end" : "start"}
                              className="max-w-[67%]"
                              variant={message.author === "user" ? "default" : "secondary"}
                            >
                              <BubbleContent className="border-border px-4 py-3">
                                {message.text}
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ),
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="mt-auto flex h-16 items-center gap-2 rounded-2xl border bg-background px-3 shadow-sm" aria-label="Message composer">
          <label className="sr-only" htmlFor="message-draft">
            Message draft
          </label>
          <Textarea
            className="h-10 min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
            id="message-draft"
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onDraftKeyDown}
            placeholder="Write a local message"
            rows={1}
            value={draft}
          />
          <Button
            className="cursor-not-allowed rounded-full"
            size="icon"
            variant="secondary"
            aria-label="Upload images (placeholder)"
            aria-disabled="true"
            title="Image upload will be added later"
          >
            <i className="fa-solid fa-paperclip text-sm" aria-hidden="true" />
          </Button>
          <Button
            className="rounded-full"
            size="icon"
            variant="default"
            aria-label="Send message"
            disabled={!draft.trim()}
            onClick={onSend}
            title="Send local message"
          >
            <i className="fa-regular fa-paper-plane text-sm" aria-hidden="true" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function WorkspaceCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodes[0].id)
  const [history, setHistory] = useState<CanvasSnapshot[]>([])
  const [future, setFuture] = useState<CanvasSnapshot[]>([])
  const [draft, setDraft] = useState("")
  const [messagesByNode, setMessagesByNode] = useState(initialMessages)
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? nodes[0]

  function saveCanvasState() {
    setHistory((current) => [...current, { nodes, edges, selectedNodeId }].slice(-50))
    setFuture([])
  }

  function addCanvasNode(kind: "chat" | "sticky") {
    saveCanvasState()

    const number = nodes.length + 1
    const node: NarrativeNode = {
      id: `${kind}-${number}`,
      type: kind,
      position: { x: 150 + ((number * 70) % 360), y: 160 + ((number * 90) % 280) },
      data: {
        title: kind === "sticky" ? `Sticky note ${number}` : `New node ${number}`,
        summary: kind === "sticky" ? "A temporary note for this workspace." : "A new local conversation node.",
        kind,
      },
      style: { width: kind === "sticky" ? 240 : 290, height: kind === "sticky" ? 140 : 180 },
      ariaLabel: kind === "sticky" ? `Sticky note ${number}` : `Chat node: New node ${number}`,
    }

    setNodes((current) => [...current, node])
    setSelectedNodeId(node.id)
  }

  function undoCanvasChange() {
    const previous = history.at(-1)
    if (!previous) return

    setFuture((current) => [{ nodes, edges, selectedNodeId }, ...current])
    setNodes(previous.nodes)
    setEdges(previous.edges)
    setSelectedNodeId(previous.selectedNodeId)
    setHistory((current) => current.slice(0, -1))
  }

  function redoCanvasChange() {
    const next = future[0]
    if (!next) return

    setHistory((current) => [...current, { nodes, edges, selectedNodeId }].slice(-50))
    setNodes(next.nodes)
    setEdges(next.edges)
    setSelectedNodeId(next.selectedNodeId)
    setFuture((current) => current.slice(1))
  }

  function sendMessage() {
    const text = draft.trim()
    if (!text) return

    setMessagesByNode((current) => ({
      ...current,
      [selectedNode.id]: [
        ...(current[selectedNode.id] ?? []),
        { id: `local-message-${Date.now()}`, author: "user", text },
      ],
    }))
    setDraft("")
  }

  function onConnect(connection: Connection) {
    saveCanvasState()
    setEdges((currentEdges) =>
      addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed } }, currentEdges),
    )
  }

  return (
    <SidebarProvider defaultOpen style={{ "--sidebar-width": "28.5rem" } as CSSProperties}>
      <ConversationPanel
        draft={draft}
        messages={messagesByNode[selectedNode.id] ?? []}
        node={selectedNode}
        onDraftChange={setDraft}
        onSend={sendMessage}
      />
      <SidebarInset className="min-h-svh p-2">
        <section
          className="relative min-h-[calc(100svh-1rem)] overflow-hidden rounded-[24px] border bg-muted/30 shadow-sm"
          aria-label="Workspace canvas"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
            fitView
            fitViewOptions={defaultFitViewOptions}
            minZoom={0.25}
            maxZoom={2}
            nodesFocusable
            edgesFocusable
            disableKeyboardA11y={false}
            aria-label="Narrative workspace canvas. Visual connections do not add chat or LLM context."
            ariaLabelConfig={{
              "controls.ariaLabel": "Canvas controls",
              "node.a11yDescription.default":
                "Press Enter or Space to select this node. Use arrow keys to move a selected node.",
            }}
          >
            <Background color="var(--border)" variant={BackgroundVariant.Dots} gap={18} size={1} />
            <ConversationSidebarTrigger />
            <CanvasActions
              canRedo={future.length > 0}
              canUndo={history.length > 0}
              onAddNode={addCanvasNode}
              onRedo={redoCanvasChange}
              onUndo={undoCanvasChange}
            />
          </ReactFlow>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}

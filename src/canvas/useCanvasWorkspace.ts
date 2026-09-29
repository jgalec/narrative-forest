import { addEdge, MarkerType, useEdgesState, useNodesState, type Connection } from "@xyflow/react"
import { useState } from "react"

import { initialEdges, initialMessages, initialNodes } from "@/canvas/initial-state"
import type { CanvasSnapshot, NarrativeNode, NarrativeNodeKind } from "@/canvas/types"

const maximumHistoryLength = 50

export function useCanvasWorkspace() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodes[0].id)
  const [history, setHistory] = useState<CanvasSnapshot[]>([])
  const [future, setFuture] = useState<CanvasSnapshot[]>([])
  const [draft, setDraft] = useState("")
  const [messagesByNode, setMessagesByNode] = useState(initialMessages)
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? nodes[0]

  function saveCanvasState() {
    setHistory((current) => [...current, { nodes, edges, selectedNodeId }].slice(-maximumHistoryLength))
    setFuture([])
  }

  function addCanvasNode(kind: Extract<NarrativeNodeKind, "chat" | "sticky">) {
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

    setHistory((current) => [...current, { nodes, edges, selectedNodeId }].slice(-maximumHistoryLength))
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

  return {
    nodes,
    edges,
    selectedNode,
    history,
    future,
    draft,
    messages: messagesByNode[selectedNode.id] ?? [],
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeSelect: setSelectedNodeId,
    onAddNode: addCanvasNode,
    onUndo: undoCanvasChange,
    onRedo: redoCanvasChange,
    onDraftChange: setDraft,
    onSend: sendMessage,
  }
}

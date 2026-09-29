import type { Edge, Node } from "@xyflow/react"

export type NarrativeNodeKind = "chat" | "content" | "sticky"

export type NarrativeNodeData = {
  title: string
  summary: string
  kind: NarrativeNodeKind
}

export type NarrativeNode = Node<NarrativeNodeData, NarrativeNodeKind>

export type ConversationMessage = {
  id: string
  author: "assistant" | "user"
  text: string
}

export type CanvasSnapshot = {
  nodes: NarrativeNode[]
  edges: Edge[]
  selectedNodeId: string
}

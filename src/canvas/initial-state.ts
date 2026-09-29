import { MarkerType, type Edge } from "@xyflow/react"

import type { ConversationMessage, NarrativeNode } from "@/canvas/types"

export const initialNodes: NarrativeNode[] = [
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

export const initialEdges: Edge[] = [
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

export const initialMessages: Record<string, ConversationMessage[]> = {
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

export const defaultFitViewOptions = {
  maxZoom: 0.9,
  padding: 0.3,
}

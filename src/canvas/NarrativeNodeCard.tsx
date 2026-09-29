import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react"

import type { NarrativeNode } from "@/canvas/types"

export function NarrativeNodeCard({ data, selected }: NodeProps<NarrativeNode>) {
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

export const nodeTypes = {
  chat: NarrativeNodeCard,
  content: NarrativeNodeCard,
  sticky: NarrativeNodeCard,
}

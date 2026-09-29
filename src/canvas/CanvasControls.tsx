import { Panel, useReactFlow } from "@xyflow/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

import { defaultFitViewOptions } from "@/canvas/initial-state"
import type { NarrativeNodeKind } from "@/canvas/types"

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

type CanvasActionsProps = {
  onAddNode: (kind: Extract<NarrativeNodeKind, "chat" | "sticky">) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function CanvasActions({ onAddNode, onUndo, onRedo, canUndo, canRedo }: CanvasActionsProps) {
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

export function ConversationSidebarTrigger() {
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

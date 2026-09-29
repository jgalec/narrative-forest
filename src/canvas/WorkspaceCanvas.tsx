import { Background, BackgroundVariant, MarkerType, ReactFlow } from "@xyflow/react"
import type { CSSProperties } from "react"

import { CanvasActions, ConversationSidebarTrigger } from "@/canvas/CanvasControls"
import { ConversationPanel } from "@/canvas/ConversationPanel"
import { defaultFitViewOptions } from "@/canvas/initial-state"
import { nodeTypes } from "@/canvas/NarrativeNodeCard"
import { useCanvasWorkspace } from "@/canvas/useCanvasWorkspace"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import "@xyflow/react/dist/style.css"

export function WorkspaceCanvas() {
  const workspace = useCanvasWorkspace()

  return (
    <SidebarProvider defaultOpen style={{ "--sidebar-width": "28.5rem" } as CSSProperties}>
      <ConversationPanel
        draft={workspace.draft}
        messages={workspace.messages}
        node={workspace.selectedNode}
        onDraftChange={workspace.onDraftChange}
        onSend={workspace.onSend}
      />
      <SidebarInset className="min-h-svh p-2">
        <section
          className="relative min-h-[calc(100svh-1rem)] overflow-hidden rounded-[24px] border bg-muted/30 shadow-sm"
          aria-label="Workspace canvas"
        >
          <ReactFlow
            nodes={workspace.nodes}
            edges={workspace.edges}
            nodeTypes={nodeTypes}
            onNodesChange={workspace.onNodesChange}
            onEdgesChange={workspace.onEdgesChange}
            onConnect={workspace.onConnect}
            onNodeClick={(_, node) => workspace.onNodeSelect(node.id)}
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
              canRedo={workspace.future.length > 0}
              canUndo={workspace.history.length > 0}
              onAddNode={workspace.onAddNode}
              onRedo={workspace.onRedo}
              onUndo={workspace.onUndo}
            />
          </ReactFlow>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}

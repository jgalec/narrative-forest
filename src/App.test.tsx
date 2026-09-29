// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { App } from "@/App"

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserver)
vi.stubGlobal("matchMedia", () => ({ addEventListener() {}, matches: false, removeEventListener() {} }))

afterEach(cleanup)

describe("App", () => {
  it("renders the workspace canvas shell without implicit context", () => {
    render(<App />)

    expect(screen.getByRole("region", { name: "Workspace canvas" })).toBeInTheDocument()
    expect(screen.getByRole("complementary", { name: "Conversation panel" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Opening question" })).toBeInTheDocument()
    expect(screen.getByText("Forest law")).toBeInTheDocument()
    expect(screen.getByText("Alternate ending")).toBeInTheDocument()
    for (const action of [
      "Zoom in",
      "Zoom out",
      "Restore default view",
      "Add normal node",
      "Add sticky note",
      "Undo last canvas change",
      "Redo last canvas change",
    ]) {
      expect(screen.getByRole("button", { name: `Canvas action: ${action}` })).toBeInTheDocument()
    }
    expect(screen.getByText("Node only")).toBeInTheDocument()
    expect(screen.getByText("No branch context")).toBeInTheDocument()
    expect(document.querySelectorAll('[data-slot="badge"]')).toHaveLength(3)
    expect(document.querySelectorAll('[data-slot="button"]')).toHaveLength(10)
    expect(document.querySelectorAll('[data-slot="textarea"]')).toHaveLength(1)
    expect(screen.getByRole("button", { name: "Upload images (placeholder)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Toggle conversation sidebar" })).toBeInTheDocument()
    expect(document.querySelectorAll('[data-slot="sidebar"]')).toHaveLength(1)
    expect(document.querySelectorAll(".fa-solid.fa-magnifying-glass-plus")).toHaveLength(1)
    expect(document.querySelectorAll(".fa-solid.fa-magnifying-glass-minus")).toHaveLength(1)
    expect(document.querySelectorAll(".fa-solid.fa-expand")).toHaveLength(1)
    expect(document.querySelectorAll(".fa-solid.fa-plus")).toHaveLength(1)
    expect(document.querySelectorAll(".fa-paperclip")).toHaveLength(1)
    expect(document.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(5)
    expect(screen.getByRole("button", { name: "Canvas action: Restore default view" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Workspace canvas" })).toHaveClass("bg-muted/30")
    expect(screen.getByRole("region", { name: "Workspace canvas" })).toHaveClass("rounded-[24px]")
    expect(screen.getByRole("complementary", { name: "Conversation panel" })).toHaveAttribute("data-side", "left")
    expect(document.querySelector('[data-slot="sidebar"][data-variant="floating"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="sidebar-inset"]')).toHaveClass("p-2")
    expect(document.querySelectorAll(".react-flow__handle.source")).toHaveLength(3)
    expect(document.querySelectorAll(".react-flow__handle.target")).toHaveLength(3)
  })

  it("adds local canvas nodes and messages with undo and redo", async () => {
    render(<App />)

    fireEvent.click(screen.getByRole("button", { name: "Canvas action: Add normal node" }))
    expect(screen.getAllByText("New node 4")).toHaveLength(2)

    fireEvent.click(screen.getByRole("button", { name: "Canvas action: Undo last canvas change" }))
    expect(screen.queryAllByText("New node 4")).toHaveLength(0)

    fireEvent.click(screen.getByRole("button", { name: "Canvas action: Redo last canvas change" }))
    expect(screen.getAllByText("New node 4")).toHaveLength(2)

    fireEvent.click(screen.getByRole("button", { name: "Canvas action: Add sticky note" }))
    expect(screen.getAllByText("Sticky note 5")).toHaveLength(2)

    fireEvent.change(screen.getByRole("textbox", { name: "Message draft" }), { target: { value: "Keep it local." } })
    fireEvent.click(screen.getByRole("button", { name: "Send message" }))
    expect(await screen.findByText("Keep it local.")).toBeInTheDocument()
  })
})

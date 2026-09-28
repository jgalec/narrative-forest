// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { App } from "@/App"

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserver)

describe("App", () => {
  it("renders the isolated canvas technology proof", () => {
    render(<App />)

    expect(screen.getByRole("heading", { name: "Canvas Technology Spike" })).toBeInTheDocument()
    expect(screen.getByText("Opening question")).toBeInTheDocument()
    expect(screen.getByText("Forest law")).toBeInTheDocument()
    expect(screen.getByText("Alternate ending")).toBeInTheDocument()
    expect(screen.getByTestId("canvas-spike")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Zoom In" })).toBeInTheDocument()
    expect(document.querySelectorAll(".react-flow__handle.source")).toHaveLength(3)
    expect(document.querySelectorAll(".react-flow__handle.target")).toHaveLength(3)
    expect(
      screen.getByText(/does not load, persist, or infer narrative or LLM context/i),
    ).toBeInTheDocument()
  })
})

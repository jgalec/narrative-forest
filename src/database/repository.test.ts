import { afterEach, describe, expect, it, vi } from "vitest"

import { createDatabaseClient } from "@/database/client"
import { createNodeId } from "@/database/ids"
import { applyMigrations } from "@/database/migrations"
import {
  appendMessage,
  createBranch,
  createBranchReference,
  createBranchSummary,
  createMessageReference,
  createNode,
  createNodeReference,
  createNodeSummary,
  createWorkspace,
  getBranch,
  getNode,
  listNodeMessages,
} from "@/database/repository"

describe("local domain persistence", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("keeps node content and messages independent", async () => {
    vi.stubGlobal("Worker", class Worker {})
    const database = await createDatabaseClient(":memory:")

    try {
      await applyMigrations(database.client)
      await applyMigrations(database.client)
      const workspaceId = await createWorkspace(database, { title: "Novel" })
      const firstNodeId = await createNode(database, {
        workspaceId,
        kind: "chat",
        markdown: "First outline",
      })
      const secondNodeId = await createNode(database, {
        workspaceId,
        kind: "chat",
        markdown: "Second outline",
      })
      const otherWorkspaceId = await createWorkspace(database, { title: "Separate novel" })
      const otherWorkspaceNodeId = await createNode(database, {
        workspaceId: otherWorkspaceId,
        kind: "chat",
      })

      const messageId = await appendMessage(database, {
        nodeId: firstNodeId,
        role: "user",
        content: "Develop the first outline.",
      })
      const nodeSummaryId = await createNodeSummary(database, {
        nodeId: firstNodeId,
        category: "continuity",
        content: "The first outline is still tentative.",
      })
      const nodeReferenceId = await createNodeReference(database, {
        nodeId: firstNodeId,
        targetKind: "node",
        targetId: secondNodeId,
        summaryScope: "continuity",
      })
      const messageReferenceId = await createMessageReference(database, {
        nodeId: firstNodeId,
        messageId,
      })

      expect(await getNode(database, secondNodeId)).toMatchObject({ markdown: "Second outline" })
      expect(await listNodeMessages(database, firstNodeId)).toHaveLength(1)
      expect(await listNodeMessages(database, secondNodeId)).toEqual([])
      await expect(
        createMessageReference(database, { nodeId: secondNodeId, messageId }),
      ).rejects.toThrow("must belong to its node")
      await expect(
        createBranch(database, {
          workspaceId,
          sourceNodeId: firstNodeId,
          targetNodeId: otherWorkspaceNodeId,
        }),
      ).rejects.toThrow("must belong to the branch workspace")
      expect(nodeSummaryId).toMatch(/^node-summary-/)
      expect(nodeReferenceId).toMatch(/^node-reference-/)
      expect(messageReferenceId).toMatch(/^message-reference-/)
    } finally {
      await database.client.destroy()
    }
  })

  it("stores a branch separately from its endpoint content", async () => {
    vi.stubGlobal("Worker", class Worker {})
    const database = await createDatabaseClient(":memory:")

    try {
      await applyMigrations(database.client)
      const workspaceId = await createWorkspace(database, { title: "Novel" })
      const sourceNodeId = await createNode(database, {
        workspaceId,
        kind: "chat",
        markdown: "Source Markdown",
      })
      const targetNodeId = await createNode(database, {
        workspaceId,
        kind: "chat",
        markdown: "Target Markdown",
      })
      const branchId = await createBranch(database, {
        workspaceId,
        sourceNodeId,
        targetNodeId,
        label: "Alternative",
      })
      const branchSummaryId = await createBranchSummary(database, {
        branchId,
        content: "The target is an alternative to the source.",
      })
      const branchReferenceId = await createBranchReference(database, {
        branchId,
        targetKind: "node",
        targetId: sourceNodeId,
        summaryScope: "continuity",
      })

      expect(await getBranch(database, branchId)).toMatchObject({
        id: branchId,
        sourceNodeId,
        targetNodeId,
        label: "Alternative",
      })

      const columns = await database.client.sql<{ name: string }>('PRAGMA table_info("branches")')
      expect(columns.map((column) => column.name)).not.toContain("markdown")
      expect(columns.map((column) => column.name)).not.toContain("content")
      expect(branchSummaryId).toMatch(/^branch-summary-/)
      expect(branchReferenceId).toMatch(/^branch-reference-/)
    } finally {
      await database.client.destroy()
    }
  })

  it("creates prefixed immutable IDs", () => {
    const first = createNodeId()
    const second = createNodeId()

    expect(first).toMatch(/^node-/)
    expect(second).toMatch(/^node-/)
    expect(first).not.toBe(second)
  })
})

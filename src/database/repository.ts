import { and, asc, eq } from "drizzle-orm"

import { createDatabaseClient } from "@/database/client"
import {
  createBranchId,
  createBranchReferenceId,
  createBranchSummaryId,
  createMessageId,
  createMessageReferenceId,
  createNodeId,
  createNodeReferenceId,
  createNodeSummaryId,
  createWorkspaceId,
  type BranchId,
  type MessageId,
  type NodeId,
  type WorkspaceId,
} from "@/database/ids"
import { applyMigrations } from "@/database/migrations"
import {
  branches,
  branchReferences,
  branchSummaries,
  messageReferences,
  messages,
  nodeReferences,
  nodeSummaries,
  nodes,
  type MessageRole,
  type NodeKind,
  type ReferenceTargetKind,
  workspaces,
} from "@/database/schema"

export type LocalDatabase = Awaited<ReturnType<typeof createDatabaseClient>>

type Metadata = Record<string, unknown>

export async function openLocalDatabase(databasePath?: string): Promise<LocalDatabase> {
  const database = await createDatabaseClient(databasePath)
  await applyMigrations(database.client)
  return database
}

export async function createWorkspace(
  database: LocalDatabase,
  input: { title: string; metadata?: Metadata },
): Promise<WorkspaceId> {
  const id = createWorkspaceId()
  const now = Date.now()

  await database.db
    .insert(workspaces)
    .values({
      id,
      title: input.title,
      metadataJson: JSON.stringify(input.metadata ?? {}),
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return id
}

export async function createNode(
  database: LocalDatabase,
  input: {
    workspaceId: WorkspaceId
    kind: NodeKind
    markdown?: string
    userIdentifier?: string
    metadata?: Metadata
  },
): Promise<NodeId> {
  const id = createNodeId()
  const now = Date.now()

  await database.db
    .insert(nodes)
    .values({
      id,
      workspaceId: input.workspaceId,
      kind: input.kind,
      userIdentifier: input.userIdentifier,
      markdown: input.markdown ?? "",
      metadataJson: JSON.stringify(input.metadata ?? {}),
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return id
}

export async function createBranch(
  database: LocalDatabase,
  input: {
    workspaceId: WorkspaceId
    sourceNodeId: NodeId
    targetNodeId: NodeId
    label?: string
    userIdentifier?: string
    metadata?: Metadata
  },
): Promise<BranchId> {
  const [sourceNodes, targetNodes] = await Promise.all([
    database.db
      .select({ id: nodes.id })
      .from(nodes)
      .where(and(eq(nodes.id, input.sourceNodeId), eq(nodes.workspaceId, input.workspaceId)))
      .limit(1),
    database.db
      .select({ id: nodes.id })
      .from(nodes)
      .where(and(eq(nodes.id, input.targetNodeId), eq(nodes.workspaceId, input.workspaceId)))
      .limit(1),
  ])

  if (!sourceNodes[0] || !targetNodes[0]) {
    throw new Error("Branch endpoints must belong to the branch workspace.")
  }

  const id = createBranchId()
  const now = Date.now()

  await database.db
    .insert(branches)
    .values({
      id,
      workspaceId: input.workspaceId,
      sourceNodeId: input.sourceNodeId,
      targetNodeId: input.targetNodeId,
      label: input.label,
      userIdentifier: input.userIdentifier,
      metadataJson: JSON.stringify(input.metadata ?? {}),
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return id
}

export async function appendMessage(
  database: LocalDatabase,
  input: { nodeId: NodeId; role: MessageRole; content: string },
): Promise<MessageId> {
  const id = createMessageId()

  await database.db
    .insert(messages)
    .values({
      id,
      nodeId: input.nodeId,
      role: input.role,
      content: input.content,
      createdAt: Date.now(),
    })
    .run()

  return id
}

export async function createNodeSummary(
  database: LocalDatabase,
  input: { nodeId: NodeId; category: string; content: string; isStale?: boolean; generatedAt?: number },
) {
  const id = createNodeSummaryId()
  const now = Date.now()

  await database.db
    .insert(nodeSummaries)
    .values({
      id,
      nodeId: input.nodeId,
      category: input.category,
      content: input.content,
      isStale: input.isStale ?? false,
      generatedAt: input.generatedAt,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return id
}

export async function createBranchSummary(
  database: LocalDatabase,
  input: { branchId: BranchId; content: string; isStale?: boolean; generatedAt?: number },
) {
  const id = createBranchSummaryId()
  const now = Date.now()

  await database.db
    .insert(branchSummaries)
    .values({
      id,
      branchId: input.branchId,
      content: input.content,
      isStale: input.isStale ?? false,
      generatedAt: input.generatedAt,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return id
}

export async function createNodeReference(
  database: LocalDatabase,
  input: { nodeId: NodeId; targetKind: ReferenceTargetKind; targetId: string; summaryScope: string },
) {
  const id = createNodeReferenceId()

  await database.db
    .insert(nodeReferences)
    .values({
      id,
      nodeId: input.nodeId,
      targetKind: input.targetKind,
      targetId: input.targetId,
      summaryScope: input.summaryScope,
      createdAt: Date.now(),
    })
    .run()

  return id
}

export async function createBranchReference(
  database: LocalDatabase,
  input: { branchId: BranchId; targetKind: ReferenceTargetKind; targetId: string; summaryScope: string },
) {
  const id = createBranchReferenceId()

  await database.db
    .insert(branchReferences)
    .values({
      id,
      branchId: input.branchId,
      targetKind: input.targetKind,
      targetId: input.targetId,
      summaryScope: input.summaryScope,
      createdAt: Date.now(),
    })
    .run()

  return id
}

export async function createMessageReference(
  database: LocalDatabase,
  input: { nodeId: NodeId; messageId: MessageId },
) {
  const matchingMessages = await database.db
    .select({ id: messages.id })
    .from(messages)
    .where(and(eq(messages.id, input.messageId), eq(messages.nodeId, input.nodeId)))
    .limit(1)

  if (!matchingMessages[0]) {
    throw new Error("A message reference must belong to its node.")
  }

  const id = createMessageReferenceId()

  await database.db
    .insert(messageReferences)
    .values({
      id,
      nodeId: input.nodeId,
      messageId: input.messageId,
      createdAt: Date.now(),
    })
    .run()

  return id
}

export async function getNode(database: LocalDatabase, id: NodeId) {
  return database.db.query.nodes.findFirst({ where: eq(nodes.id, id) })
}

export async function listNodeMessages(database: LocalDatabase, nodeId: NodeId) {
  return database.db.select().from(messages).where(eq(messages.nodeId, nodeId)).orderBy(asc(messages.createdAt))
}

export async function getBranch(database: LocalDatabase, id: BranchId) {
  return database.db.query.branches.findFirst({ where: eq(branches.id, id) })
}

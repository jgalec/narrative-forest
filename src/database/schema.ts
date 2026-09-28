import { foreignKey, index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"

import type {
  BranchId,
  BranchReferenceId,
  BranchSummaryId,
  MessageId,
  MessageReferenceId,
  NodeId,
  NodeReferenceId,
  NodeSummaryId,
  WorkspaceId,
} from "@/database/ids"

export type NodeKind = "chat" | "content"
export type MessageRole = "user" | "assistant" | "system"
export type ReferenceTargetKind = "node" | "branch"

export const workspaces = sqliteTable("workspaces", {
  id: text("id").$type<WorkspaceId>().primaryKey(),
  title: text("title").notNull(),
  metadataJson: text("metadata_json").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

export const nodes = sqliteTable(
  "nodes",
  {
    id: text("id").$type<NodeId>().primaryKey(),
    workspaceId: text("workspace_id")
      .$type<WorkspaceId>()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    kind: text("kind").$type<NodeKind>().notNull(),
    userIdentifier: text("user_identifier"),
    markdown: text("markdown").notNull(),
    metadataJson: text("metadata_json").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    unique("nodes_id_workspace_id_unique").on(table.id, table.workspaceId),
    index("nodes_workspace_id_idx").on(table.workspaceId),
  ],
)

export const branches = sqliteTable(
  "branches",
  {
    id: text("id").$type<BranchId>().primaryKey(),
    workspaceId: text("workspace_id")
      .$type<WorkspaceId>()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    sourceNodeId: text("source_node_id")
      .$type<NodeId>()
      .notNull(),
    targetNodeId: text("target_node_id")
      .$type<NodeId>()
      .notNull(),
    userIdentifier: text("user_identifier"),
    label: text("label"),
    metadataJson: text("metadata_json").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sourceNodeId, table.workspaceId],
      foreignColumns: [nodes.id, nodes.workspaceId],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.targetNodeId, table.workspaceId],
      foreignColumns: [nodes.id, nodes.workspaceId],
    }).onDelete("cascade"),
    index("branches_workspace_id_idx").on(table.workspaceId),
    index("branches_source_node_id_idx").on(table.sourceNodeId),
    index("branches_target_node_id_idx").on(table.targetNodeId),
  ],
)

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").$type<MessageId>().primaryKey(),
    nodeId: text("node_id")
      .$type<NodeId>()
      .notNull()
      .references(() => nodes.id, { onDelete: "cascade" }),
    role: text("role").$type<MessageRole>().notNull(),
    content: text("content").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    unique("messages_id_node_id_unique").on(table.id, table.nodeId),
    index("messages_node_id_created_at_idx").on(table.nodeId, table.createdAt),
  ],
)

export const nodeSummaries = sqliteTable(
  "node_summaries",
  {
    id: text("id").$type<NodeSummaryId>().primaryKey(),
    nodeId: text("node_id")
      .$type<NodeId>()
      .notNull()
      .references(() => nodes.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    content: text("content").notNull(),
    isStale: integer("is_stale", { mode: "boolean" }).notNull(),
    generatedAt: integer("generated_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [index("node_summaries_node_id_idx").on(table.nodeId)],
)

export const branchSummaries = sqliteTable(
  "branch_summaries",
  {
    id: text("id").$type<BranchSummaryId>().primaryKey(),
    branchId: text("branch_id")
      .$type<BranchId>()
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isStale: integer("is_stale", { mode: "boolean" }).notNull(),
    generatedAt: integer("generated_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [index("branch_summaries_branch_id_idx").on(table.branchId)],
)

export const nodeReferences = sqliteTable(
  "node_references",
  {
    id: text("id").$type<NodeReferenceId>().primaryKey(),
    nodeId: text("node_id")
      .$type<NodeId>()
      .notNull()
      .references(() => nodes.id, { onDelete: "cascade" }),
    targetKind: text("target_kind").$type<ReferenceTargetKind>().notNull(),
    targetId: text("target_id").notNull(),
    summaryScope: text("summary_scope").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("node_references_node_id_idx").on(table.nodeId)],
)

export const branchReferences = sqliteTable(
  "branch_references",
  {
    id: text("id").$type<BranchReferenceId>().primaryKey(),
    branchId: text("branch_id")
      .$type<BranchId>()
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    targetKind: text("target_kind").$type<ReferenceTargetKind>().notNull(),
    targetId: text("target_id").notNull(),
    summaryScope: text("summary_scope").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("branch_references_branch_id_idx").on(table.branchId)],
)

export const messageReferences = sqliteTable(
  "message_references",
  {
    id: text("id").$type<MessageReferenceId>().primaryKey(),
    nodeId: text("node_id")
      .$type<NodeId>()
      .notNull()
      .references(() => nodes.id, { onDelete: "cascade" }),
    messageId: text("message_id")
      .$type<MessageId>()
      .notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.messageId, table.nodeId],
      foreignColumns: [messages.id, messages.nodeId],
    }).onDelete("cascade"),
    index("message_references_node_id_idx").on(table.nodeId),
  ],
)

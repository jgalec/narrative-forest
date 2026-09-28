type BrandedId<Prefix extends string> = string & { readonly __prefix: Prefix }

export type WorkspaceId = BrandedId<"workspace">
export type NodeId = BrandedId<"node">
export type BranchId = BrandedId<"branch">
export type MessageId = BrandedId<"message">
export type NodeSummaryId = BrandedId<"node-summary">
export type BranchSummaryId = BrandedId<"branch-summary">
export type NodeReferenceId = BrandedId<"node-reference">
export type BranchReferenceId = BrandedId<"branch-reference">
export type MessageReferenceId = BrandedId<"message-reference">

function createId<Prefix extends string>(prefix: Prefix): BrandedId<Prefix> {
  return `${prefix}-${crypto.randomUUID()}` as BrandedId<Prefix>
}

export const createWorkspaceId = () => createId("workspace")
export const createNodeId = () => createId("node")
export const createBranchId = () => createId("branch")
export const createMessageId = () => createId("message")
export const createNodeSummaryId = () => createId("node-summary")
export const createBranchSummaryId = () => createId("branch-summary")
export const createNodeReferenceId = () => createId("node-reference")
export const createBranchReferenceId = () => createId("branch-reference")
export const createMessageReferenceId = () => createId("message-reference")

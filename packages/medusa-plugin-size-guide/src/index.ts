// Plugin entry point for medusa-plugin-size-guide
// Re-exports module definition so Medusa can auto-register it as a plugin

export { default as SizeGuideModule, SIZE_GUIDE_MODULE } from "./modules/size-guide"

// Workflow exports for external use
export { createSizeGuideWorkflow } from "./workflows/create-size-guide"
export { updateSizeGuideWorkflow } from "./workflows/update-size-guide"
export { deleteSizeGuideWorkflow } from "./workflows/delete-size-guide"
export { attachSizeGuideToProductWorkflow } from "./workflows/attach-size-guide"
export { detachSizeGuideFromProductWorkflow } from "./workflows/detach-size-guide"

// Type exports
export type { CreateSizeGuideInput } from "./workflows/create-size-guide"
export type { UpdateSizeGuideInput } from "./workflows/update-size-guide"
export type { AttachSizeGuideInput } from "./workflows/attach-size-guide"
export type { DetachSizeGuideInput } from "./workflows/detach-size-guide"

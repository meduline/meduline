import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SIZE_GUIDE_MODULE } from "../modules/size-guide"
import SizeGuideModuleService from "../modules/size-guide/service"

export type UpdateSizeGuideInput = {
  id: string
  name?: string
  description?: string
  type?: string | null
  instruction_image_url?: string | null
  columns?: Array<{ key: string; label: string }> | null
  entries?: Array<{
    label: string
    measurements: Record<string, string>
    sort_order?: number
  }>
}

const updateSizeGuideStep = createStep(
  "update-size-guide-step",
  async (input: UpdateSizeGuideInput, { container }) => {
    const sizeGuideService: SizeGuideModuleService = container.resolve(
      SIZE_GUIDE_MODULE
    )

    // Store original for compensation
    const original = await sizeGuideService.retrieveSizeGuide(input.id, {
      relations: ["entries"],
    })

    const updatePayload: Record<string, unknown> = {}
    if (input.name !== undefined) updatePayload.name = input.name
    if (input.description !== undefined) updatePayload.description = input.description
    if (input.type !== undefined) updatePayload.type = input.type
    if (input.instruction_image_url !== undefined) updatePayload.instruction_image_url = input.instruction_image_url
    if (input.columns !== undefined) updatePayload.columns = input.columns as unknown as Record<string, unknown>

    if (Object.keys(updatePayload).length) {
      await sizeGuideService.updateSizeGuides({
        id: input.id,
        ...updatePayload,
      })
    }

    if (input.entries !== undefined) {
      // Replace all entries: delete old, create new
      const existingEntries = await sizeGuideService.listSizeGuideEntries({
        size_guide_id: input.id,
      })
      if (existingEntries.length) {
        await sizeGuideService.deleteSizeGuideEntries(
          existingEntries.map((e) => e.id)
        )
      }
      if (input.entries.length) {
        await sizeGuideService.createSizeGuideEntries(
          input.entries.map((e, idx) => ({
            label: e.label,
            measurements: e.measurements,
            sort_order: e.sort_order ?? idx,
            size_guide_id: input.id,
          }))
        )
      }
    }

    const result = await sizeGuideService.retrieveSizeGuide(input.id, {
      relations: ["entries"],
    })

    return new StepResponse(result, original)
  },
  async (original: any, { container }) => {
    const sizeGuideService: SizeGuideModuleService = container.resolve(
      SIZE_GUIDE_MODULE
    )
    await sizeGuideService.updateSizeGuides({
      id: original.id,
      name: original.name,
      description: original.description,
      type: original.type,
      instruction_image_url: original.instruction_image_url,
      columns: original.columns,
    })
  }
)

export const updateSizeGuideWorkflow = createWorkflow(
  "update-size-guide",
  function (input: UpdateSizeGuideInput) {
    const result = updateSizeGuideStep(input)
    return new WorkflowResponse(result)
  }
)

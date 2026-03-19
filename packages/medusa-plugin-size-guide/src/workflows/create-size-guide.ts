import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SIZE_GUIDE_MODULE } from "../modules/size-guide"
import SizeGuideModuleService from "../modules/size-guide/service"

export type CreateSizeGuideInput = {
  name: string
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

const createSizeGuideStep = createStep(
  "create-size-guide-step",
  async (input: CreateSizeGuideInput, { container }) => {
    const sizeGuideService: SizeGuideModuleService = container.resolve(
      SIZE_GUIDE_MODULE
    )

    const guide = await sizeGuideService.createSizeGuides({
      name: input.name,
      description: input.description,
      type: input.type ?? undefined,
      instruction_image_url: input.instruction_image_url ?? undefined,
      columns: (input.columns ?? undefined) as unknown as Record<string, unknown> | undefined,
    })

    if (input.entries?.length) {
      await sizeGuideService.createSizeGuideEntries(
        input.entries.map((e, idx) => ({
          label: e.label,
          measurements: e.measurements,
          sort_order: e.sort_order ?? idx,
          size_guide_id: guide.id,
        }))
      )
    }

    const result = await sizeGuideService.retrieveSizeGuide(guide.id, {
      relations: ["entries"],
    })

    return new StepResponse(result, guide.id)
  },
  async (createdId: string, { container }) => {
    const sizeGuideService: SizeGuideModuleService = container.resolve(
      SIZE_GUIDE_MODULE
    )
    await sizeGuideService.deleteSizeGuides(createdId)
  }
)

export const createSizeGuideWorkflow = createWorkflow(
  "create-size-guide",
  function (input: CreateSizeGuideInput) {
    const result = createSizeGuideStep(input)
    return new WorkflowResponse(result)
  }
)

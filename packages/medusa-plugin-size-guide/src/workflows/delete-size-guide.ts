import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SIZE_GUIDE_MODULE } from "../modules/size-guide"
import SizeGuideModuleService from "../modules/size-guide/service"

export type DeleteSizeGuideInput = {
  id: string
}

const deleteSizeGuideStep = createStep(
  "delete-size-guide-step",
  async (input: DeleteSizeGuideInput, { container }) => {
    const sizeGuideService: SizeGuideModuleService = container.resolve(
      SIZE_GUIDE_MODULE
    )
    const remoteLink = container.resolve("remoteLink" as any)

    // Delete entries first
    const entries = await sizeGuideService.listSizeGuideEntries({
      size_guide_id: input.id,
    })
    if (entries.length) {
      await sizeGuideService.deleteSizeGuideEntries(entries.map((e) => e.id))
    }

    // Dismiss all links that reference this size guide.
    // Use remoteLink.delete when available to remove all one-side references.
    if (typeof remoteLink.delete === "function") {
      await remoteLink.delete({
        [SIZE_GUIDE_MODULE]: {
          size_guide_id: input.id,
        },
      })
    }

    await sizeGuideService.deleteSizeGuides(input.id)

    return new StepResponse({ deleted: true, id: input.id })
  }
)

export const deleteSizeGuideWorkflow = createWorkflow(
  "delete-size-guide",
  function (input: DeleteSizeGuideInput) {
    const result = deleteSizeGuideStep(input)
    return new WorkflowResponse(result)
  }
)

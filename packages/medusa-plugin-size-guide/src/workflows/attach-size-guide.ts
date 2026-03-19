import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SIZE_GUIDE_MODULE } from "../modules/size-guide"
import { Modules } from "@medusajs/framework/utils"

export type AttachSizeGuideInput = {
  size_guide_id: string
  product_id: string
}

const attachSizeGuideToProductStep = createStep(
  "attach-size-guide-to-product-step",
  async (input: AttachSizeGuideInput, { container }) => {
    const remoteLink = container.resolve("remoteLink" as any)

    await remoteLink.create({
      [SIZE_GUIDE_MODULE]: {
        size_guide_id: input.size_guide_id,
      },
      [Modules.PRODUCT]: {
        product_id: input.product_id,
      },
    })

    return new StepResponse(input, input)
  },
  async (input: AttachSizeGuideInput, { container }) => {
    const remoteLink = container.resolve("remoteLink" as any)
    await remoteLink.dismiss({
      [SIZE_GUIDE_MODULE]: {
        size_guide_id: input.size_guide_id,
      },
      [Modules.PRODUCT]: {
        product_id: input.product_id,
      },
    })
  }
)

export const attachSizeGuideToProductWorkflow = createWorkflow(
  "attach-size-guide-to-product",
  function (input: AttachSizeGuideInput) {
    const result = attachSizeGuideToProductStep(input)
    return new WorkflowResponse(result)
  }
)

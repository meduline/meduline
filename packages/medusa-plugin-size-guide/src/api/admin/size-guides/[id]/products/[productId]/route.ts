import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { attachSizeGuideToProductWorkflow } from "../../../../../../workflows/attach-size-guide"
import { detachSizeGuideFromProductWorkflow } from "../../../../../../workflows/detach-size-guide"

/**
 * POST /admin/size-guides/:id/products/:productId
 * Attach the size guide to a product
 */
export async function POST(
  req: MedusaRequest<unknown, { id: string; productId: string }>,
  res: MedusaResponse
) {
  await attachSizeGuideToProductWorkflow(req.scope).run({
    input: {
      size_guide_id: req.params.id,
      product_id: req.params.productId,
    },
  })

  res.json({
    message: "Size guide attached to product",
    size_guide_id: req.params.id,
    product_id: req.params.productId,
  })
}

/**
 * DELETE /admin/size-guides/:id/products/:productId
 * Detach the size guide from a product
 */
export async function DELETE(
  req: MedusaRequest<unknown, { id: string; productId: string }>,
  res: MedusaResponse
) {
  await detachSizeGuideFromProductWorkflow(req.scope).run({
    input: {
      size_guide_id: req.params.id,
      product_id: req.params.productId,
    },
  })

  res.json({
    message: "Size guide detached from product",
    size_guide_id: req.params.id,
    product_id: req.params.productId,
  })
}

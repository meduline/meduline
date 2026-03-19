import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SIZE_GUIDE_MODULE } from "../../../../../modules/size-guide"
import SizeGuideModuleService from "../../../../../modules/size-guide/service"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/products/:id/size-guide
 * Retrieves the size guide for a product.
 * Falls back to the product's type if no direct guide is attached.
 */
export async function GET(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse
) {
  const productId = req.params.id
  const query = req.scope.resolve("query" as any)
  const sizeGuideService: SizeGuideModuleService =
    req.scope.resolve(SIZE_GUIDE_MODULE)

  // Try direct product link first
  const { data: productLinks } = await query.graph({
    entity: "size_guide",
    fields: [
      "id",
      "name",
      "description",
      "type",
      "instruction_image_url",
      "columns",
      "entries.*",
    ],
    filters: {
      products: { id: productId },
    },
  })

  if (productLinks?.length) {
    return res.json({ size_guide: productLinks[0] })
  }

  // Fallback: look up product's type, then try product-type link
  const productModule = req.scope.resolve(Modules.PRODUCT)
  let product: any
  try {
    product = await productModule.retrieveProduct(productId, {
      select: ["id", "type_id"],
    })
  } catch {
    return res.json({ size_guide: null })
  }

  if (!product?.type_id) {
    return res.json({ size_guide: null })
  }

  const { data: typeLinks } = await query.graph({
    entity: "size_guide",
    fields: [
      "id",
      "name",
      "description",
      "type",
      "instruction_image_url",
      "columns",
      "entries.*",
    ],
    filters: {
      product_types: { id: product.type_id },
    },
  })

  if (typeLinks?.length) {
    return res.json({ size_guide: typeLinks[0] })
  }

  res.json({ size_guide: null })
}

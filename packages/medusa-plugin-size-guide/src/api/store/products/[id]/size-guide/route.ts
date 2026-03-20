import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SIZE_GUIDE_MODULE } from "../../../../../modules/size-guide"
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

  // Try direct product link first. Query from product side and expand linked size_guide.
  const { data: productLinks } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "size_guide.id",
      "size_guide.name",
      "size_guide.description",
      "size_guide.type",
      "size_guide.instruction_image_url",
      "size_guide.columns",
      "size_guide.entries.*",
    ],
    filters: {
      id: productId,
    },
  })

  if (productLinks?.[0]?.size_guide) {
    return res.json({ size_guide: productLinks[0].size_guide })
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

  // Fallback: query from product_type side and expand linked size_guide.
  const { data: typeLinks } = await query.graph({
    entity: "product_type",
    fields: [
      "id",
      "size_guide.id",
      "size_guide.name",
      "size_guide.description",
      "size_guide.type",
      "size_guide.instruction_image_url",
      "size_guide.columns",
      "size_guide.entries.*",
    ],
    filters: {
      id: product.type_id,
    },
  })

  if (typeLinks?.[0]?.size_guide) {
    return res.json({ size_guide: typeLinks[0].size_guide })
  }

  res.json({ size_guide: null })
}

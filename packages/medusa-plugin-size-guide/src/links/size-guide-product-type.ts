import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"
import { SizeGuideModule } from ".."

export default defineLink(
  SizeGuideModule.linkable.sizeGuide,
  ProductModule.linkable.productType
)

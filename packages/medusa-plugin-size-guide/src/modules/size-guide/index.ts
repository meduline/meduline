import { Module } from "@medusajs/framework/utils"
import SizeGuideModuleService from "./service"

export const SIZE_GUIDE_MODULE = "size_guide"

export default Module(SIZE_GUIDE_MODULE, {
  service: SizeGuideModuleService,
})

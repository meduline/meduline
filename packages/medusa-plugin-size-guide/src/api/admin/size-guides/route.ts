import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createSizeGuideWorkflow } from "../../../workflows/create-size-guide"
import { SIZE_GUIDE_MODULE } from "../../../modules/size-guide"
import SizeGuideModuleService from "../../../modules/size-guide/service"
import { CreateSizeGuideSchema } from "../../validators"

/**
 * GET /admin/size-guides
 * List all size guides with their entries
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sizeGuideService: SizeGuideModuleService =
    req.scope.resolve(SIZE_GUIDE_MODULE)

  const offset = Number(req.query.offset ?? 0)
  const limit = Number(req.query.limit ?? 50)

  const [guides, count] = await sizeGuideService.listAndCountSizeGuides(
    {},
    {
      take: limit,
      skip: offset,
      relations: ["entries"],
    }
  )

  res.json({
    size_guides: guides,
    count,
    offset,
    limit,
  })
}

/**
 * POST /admin/size-guides
 * Create a new size guide
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validated = CreateSizeGuideSchema.parse(req.body)
  const input = { ...validated }
  if (input.instruction_image_url === "") {
    input.instruction_image_url = null
  }

  const { result } = await createSizeGuideWorkflow(req.scope).run({
    input,
  })

  res.status(201).json({ size_guide: result })
}

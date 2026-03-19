import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  updateSizeGuideWorkflow,
  UpdateSizeGuideInput,
} from "../../../../workflows/update-size-guide"
import { deleteSizeGuideWorkflow } from "../../../../workflows/delete-size-guide"
import { SIZE_GUIDE_MODULE } from "../../../../modules/size-guide"
import SizeGuideModuleService from "../../../../modules/size-guide/service"
import {
  UpdateSizeGuideSchema,
  validateEntriesMeasurementsAgainstColumns,
} from "../../../validators"

/**
 * GET /admin/size-guides/:id
 */
export async function GET(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse
) {
  const sizeGuideService: SizeGuideModuleService =
    req.scope.resolve(SIZE_GUIDE_MODULE)

  const guide = await sizeGuideService.retrieveSizeGuide(req.params.id, {
    relations: ["entries"],
  })

  res.json({ size_guide: guide })
}

/**
 * POST /admin/size-guides/:id
 */
export async function POST(
  req: MedusaRequest<UpdateSizeGuideInput, { id: string }>,
  res: MedusaResponse
) {
  const validated = UpdateSizeGuideSchema.parse(req.body)

  // When entries are sent without columns, validate against the existing guide's columns
  if (validated.entries != null && validated.columns == null) {
    const sizeGuideService: SizeGuideModuleService =
      req.scope.resolve(SIZE_GUIDE_MODULE)
    const guide = await sizeGuideService.retrieveSizeGuide(req.params.id)
    validateEntriesMeasurementsAgainstColumns(
      validated.entries,
      guide.columns as Array<{ key: string; label: string }> | null
    )
  }

  const payload: UpdateSizeGuideInput = {
    id: req.params.id,
    ...validated,
  }
  // Normalize empty string to null for optional URL
  if (payload.instruction_image_url === "") {
    payload.instruction_image_url = null
  }

  const { result } = await updateSizeGuideWorkflow(req.scope).run({
    input: payload,
  })

  res.json({ size_guide: result })
}

/**
 * DELETE /admin/size-guides/:id
 */
export async function DELETE(
  req: MedusaRequest<unknown, { id: string }>,
  res: MedusaResponse
) {
  await deleteSizeGuideWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  res.json({ deleted: true, id: req.params.id })
}

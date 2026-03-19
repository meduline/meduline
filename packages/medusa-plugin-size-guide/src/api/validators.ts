import { z } from "zod"

/** Blueprint for table headers: key is the measurement key, label is the display label (e.g. "Chest Girth (in)") */
export const SizeGuideColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
})

export type SizeGuideColumnBody = z.infer<typeof SizeGuideColumnSchema>

export const SizeGuideEntrySchema = z.object({
  label: z.string(),
  measurements: z.record(z.string()),
  sort_order: z.number().optional(),
})

const columnKeysRefiner = (
  data: { columns?: Array<{ key: string; label: string }>; entries?: Array<{ measurements: Record<string, string> }> },
  ctx: z.RefinementCtx
) => {
  if (!data.entries?.length) return
  const columnKeys = data.columns?.map((c) => c.key) ?? []
  if (!data.columns?.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "When entries are provided, columns must be provided as the blueprint for measurement keys.",
      path: ["columns"],
    })
    return
  }
  for (let i = 0; i < data.entries.length; i++) {
    const keys = Object.keys(data.entries[i].measurements ?? {})
    const invalid = keys.filter((k) => !columnKeys.includes(k))
    if (invalid.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Entry at index ${i}: measurement keys [${invalid.join(", ")}] are not defined in columns. Allowed keys: [${columnKeys.join(", ")}].`,
        path: ["entries", i, "measurements"],
      })
    }
  }
}

export const CreateSizeGuideSchema = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    type: z.string().optional(),
    instruction_image_url: z
      .union([z.string().url(), z.literal(""), z.null()])
      .optional()
      .nullable(),
    columns: z.array(SizeGuideColumnSchema).optional(),
    entries: z.array(SizeGuideEntrySchema).optional(),
  })
  .superRefine(columnKeysRefiner)

export const UpdateSizeGuideSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional().nullable(),
    instruction_image_url: z
      .union([z.string().url(), z.literal(""), z.null()])
      .optional()
      .nullable(),
    columns: z.array(SizeGuideColumnSchema).optional(),
    entries: z.array(SizeGuideEntrySchema).optional(),
  })
  .superRefine(columnKeysRefiner)

export type CreateSizeGuideBody = z.infer<typeof CreateSizeGuideSchema>
export type UpdateSizeGuideBody = z.infer<typeof UpdateSizeGuideSchema>

/**
 * Validates that every key in each entry's measurements exists in the parent's column keys.
 * Use in the update route when body has entries but no columns (validate against loaded guide.columns).
 */
export function validateEntriesMeasurementsAgainstColumns(
  entries: Array<{ measurements: Record<string, string> }>,
  columns: Array<{ key: string; label: string }> | null | undefined
): void {
  if (!columns?.length) {
    throw new Error("Columns blueprint is required when entries are provided.")
  }
  const columnKeys = columns.map((c) => c.key)
  for (let i = 0; i < entries.length; i++) {
    const keys = Object.keys(entries[i].measurements ?? {})
    const invalid = keys.filter((k) => !columnKeys.includes(k))
    if (invalid.length) {
      throw new Error(
        `Entry at index ${i}: measurement keys [${invalid.join(", ")}] are not in the size guide columns. Allowed: [${columnKeys.join(", ")}].`
      )
    }
  }
}

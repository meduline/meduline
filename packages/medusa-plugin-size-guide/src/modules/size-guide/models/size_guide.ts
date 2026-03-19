import { model } from "@medusajs/framework/utils"
import SizeGuideEntry from "./size_guide_entry"

/** Blueprint for table headers: key is the measurement key, label is the display label (e.g. "Chest Girth (in)") */
export type SizeGuideColumn = { key: string; label: string }

const SizeGuide = model.define("size_guide", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  /** Dynamic category (e.g. dog_apparel, rugs). No enum – merchants define their own. */
  type: model.text().nullable(),
  /** URL for "How to Measure" diagram image. */
  instruction_image_url: model.text().nullable(),
  /** JSON array of { key, label } defining table columns for the frontend. */
  columns: model.json().nullable(),
  entries: model.hasMany(() => SizeGuideEntry, {
    mappedBy: "size_guide",
  }),
})

export default SizeGuide

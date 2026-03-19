import { model } from "@medusajs/framework/utils"
import SizeGuide from "./size_guide"

const SizeGuideEntry = model.define("size_guide_entry", {
  id: model.id().primaryKey(),
  label: model.text(),
  measurements: model.json(),
  sort_order: model.number().default(0),
  size_guide: model.belongsTo(() => SizeGuide, {
    mappedBy: "entries",
  }),
})

export default SizeGuideEntry

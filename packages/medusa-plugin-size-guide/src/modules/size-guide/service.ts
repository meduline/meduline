import { MedusaService } from "@medusajs/framework/utils"
import SizeGuide from "./models/size_guide"
import SizeGuideEntry from "./models/size_guide_entry"

class SizeGuideModuleService extends MedusaService({
  SizeGuide,
  SizeGuideEntry,
}) {
  /**
   * Retrieve all entries for a given size guide, ordered by sort_order.
   */
  async listEntriesForGuide(sizeGuideId: string) {
    const entries = await this.listSizeGuideEntries({
      size_guide_id: sizeGuideId,
    })

    return entries.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }
}

export default SizeGuideModuleService

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { Button, Badge, Select, Text, Heading, toast } from "@medusajs/ui"
import { Wrench } from "@medusajs/icons"
import { sdk } from "../lib/sdk"

type SizeGuideEntry = {
  id: string
  label: string
  measurements: Record<string, string>
  sort_order: number
}

type SizeGuide = {
  id: string
  name: string
  description?: string
  type?: string | null
  instruction_image_url?: string | null
  columns?: Array<{ key: string; label: string }> | null
  entries: SizeGuideEntry[]
}

type ProductWidgetProps = {
  data: {
    id: string
    title: string
  }
}

const ProductSizeGuideWidget = ({ data }: ProductWidgetProps) => {
  const [allGuides, setAllGuides] = useState<SizeGuide[]>([])
  const [currentGuide, setCurrentGuide] = useState<SizeGuide | null>(null)
  const [selectedGuideId, setSelectedGuideId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchGuides = async () => {
    try {
      const res = await sdk.client.fetch("/admin/size-guides?limit=100")
      setAllGuides((res as any).size_guides ?? [])
    } catch (e) {
      console.error("Failed to fetch size guides", e)
    }
  }

  const fetchProductGuide = async () => {
    try {
      const res = await fetch(`/store/products/${data.id}/size-guide`, {
        credentials: "include",
        headers: {
          "x-publishable-api-key":
            (window as any).__MEDUSA_PUBLISHABLE_KEY__ ?? "",
        },
      })
      const json = await res.json()
      if (json.size_guide) {
        setCurrentGuide(json.size_guide)
        setSelectedGuideId(json.size_guide.id)
      }
    } catch (e) {
      console.error("Failed to fetch product guide", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuides()
    fetchProductGuide()
  }, [data.id])

  const handleAttach = async () => {
    if (!selectedGuideId) return
    setSaving(true)
    try {
      if (currentGuide) {
        // Detach old guide first
        await sdk.client.fetch(
          `/admin/size-guides/${currentGuide.id}/products/${data.id}`,
          { method: "DELETE" }
        )
      }
      await sdk.client.fetch(`/admin/size-guides/${selectedGuideId}/products/${data.id}`, {
        method: "POST",
      })
      const attached = allGuides.find((g) => g.id === selectedGuideId) ?? null
      setCurrentGuide(attached)
      toast.success("Size guide attached successfully")
    } catch (e) {
      toast.error("Failed to attach size guide")
    } finally {
      setSaving(false)
    }
  }

  const handleDetach = async () => {
    if (!currentGuide) return
    setSaving(true)
    try {
      await sdk.client.fetch(`/admin/size-guides/${currentGuide.id}/products/${data.id}`, {
        method: "DELETE",
      })
      setCurrentGuide(null)
      setSelectedGuideId("")
      toast.success("Size guide detached")
    } catch (e) {
      toast.error("Failed to detach size guide")
    } finally {
      setSaving(false)
    }
  }

  // Use parent columns blueprint when present; else derive from entries for backwards compat
  const columnDefs =
    currentGuide?.columns?.length
      ? currentGuide.columns
      : (() => {
          const keys =
            currentGuide?.entries?.flatMap((e) =>
              Object.keys(e.measurements ?? {})
            ) ?? []
          return [...new Set(keys)].map((key) => ({ key, label: key }))
        })()

  return (
    <div className="bg-ui-bg-base rounded-xl border border-ui-border-base p-6 shadow-elevation-card-rest">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="text-ui-fg-subtle" />
        <Heading level="h2">Size Guide</Heading>
      </div>

      {loading ? (
        <Text className="text-ui-fg-muted">Loading…</Text>
      ) : (
        <>
          {currentGuide ? (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge color="green">{currentGuide.name}</Badge>
                {currentGuide.description && (
                  <Text className="text-ui-fg-subtle text-sm">
                    {currentGuide.description}
                  </Text>
                )}
              </div>

              {currentGuide.entries?.length > 0 && (
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-ui-border-base">
                        <th className="text-left py-2 pr-4 text-ui-fg-subtle font-medium">
                          Size
                        </th>
                        {columnDefs.map((col) => (
                          <th
                            key={col.key}
                            className="text-left py-2 pr-4 text-ui-fg-subtle font-medium"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...currentGuide.entries]
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((entry) => (
                          <tr
                            key={entry.id}
                            className="border-b border-ui-border-base last:border-0"
                          >
                            <td className="py-2 pr-4 font-semibold">
                              {entry.label}
                            </td>
                            {columnDefs.map((col) => (
                              <td key={col.key} className="py-2 pr-4 text-ui-fg-base">
                                {entry.measurements?.[col.key] ?? "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <Text className="text-ui-fg-muted mb-4">
              No size guide attached to this product.
            </Text>
          )}

          <div className="flex items-center gap-2 mt-4">
            <Select
              value={selectedGuideId}
              onValueChange={setSelectedGuideId}
            >
              <Select.Trigger className="w-64">
                <Select.Value placeholder="Select a size guide…" />
              </Select.Trigger>
              <Select.Content>
                {allGuides.map((g) => (
                  <Select.Item key={g.id} value={g.id}>
                    {g.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>

            <Button
              onClick={handleAttach}
              isLoading={saving}
              disabled={!selectedGuideId || saving}
            >
              {currentGuide ? "Swap Guide" : "Attach Guide"}
            </Button>

            {currentGuide && (
              <Button
                variant="secondary"
                onClick={handleDetach}
                isLoading={saving}
                disabled={saving}
              >
                Detach
              </Button>
            )}
          </div>

          <div className="mt-3">
            <a
              href="/app/size-guides"
              className="text-ui-fg-interactive text-sm hover:underline"
            >
              Manage all size guides →
            </a>
          </div>
        </>
      )}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductSizeGuideWidget

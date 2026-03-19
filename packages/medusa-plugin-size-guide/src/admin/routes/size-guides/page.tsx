import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Wrench } from "@medusajs/icons"
import { useEffect, useState } from "react"
import {
  Button,
  Heading,
  Table,
  Badge,
  toast,
  usePrompt,
  Text,
} from "@medusajs/ui"
import { useNavigate } from "react-router-dom"
import { sdk } from "../../lib/sdk"

type SizeGuide = {
  id: string
  name: string
  description?: string
  type?: string | null
  entries: Array<{ id: string; label: string }>
}

const SizeGuidesPage = () => {
  const [guides, setGuides] = useState<SizeGuide[]>([])
  const [loading, setLoading] = useState(true)
  const prompt = usePrompt()
  const navigate = useNavigate()

  const fetchGuides = async () => {
    setLoading(true)
    try {
      const res = await sdk.client.fetch("/admin/size-guides?limit=100")
      setGuides((res as any).size_guides ?? [])
    } catch {
      toast.error("Failed to load size guides")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuides()
  }, [])

  const handleDelete = async (guide: SizeGuide) => {
    const confirmed = await prompt({
      title: `Delete "${guide.name}"?`,
      description:
        "This will permanently delete this size guide and remove it from all products.",
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    if (!confirmed) return

    try {
      await sdk.client.fetch(`/admin/size-guides/${guide.id}`, {
        method: "DELETE",
      })
      toast.success(`"${guide.name}" deleted`)
      fetchGuides()
    } catch {
      toast.error("Failed to delete size guide")
    }
  }

  return (
    <div className="flex flex-col gap-y-2 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">Size Guides</Heading>
          <Text className="text-ui-fg-subtle">
            Create and manage reusable size guides for your products.
          </Text>
        </div>
        <Button onClick={() => navigate("/size-guides/create")}>
          Create Size Guide
        </Button>
      </div>

      {loading ? (
        <Text className="text-ui-fg-muted">Loading…</Text>
      ) : guides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-ui-border-base bg-ui-bg-subtle gap-3">
          <Wrench className="text-ui-fg-muted" />
          <Text className="text-ui-fg-muted">No size guides yet.</Text>
          <Button onClick={() => navigate("/size-guides/create")}>
            Create your first size guide
          </Button>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>Sizes</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {guides.map((guide) => (
              <Table.Row key={guide.id}>
                <Table.Cell className="font-medium">{guide.name}</Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">
                  {guide.type ?? "—"}
                </Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">
                  {guide.description ?? "—"}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1 flex-wrap">
                    {guide.entries?.slice(0, 6).map((e) => (
                      <Badge key={e.id} size="xsmall">
                        {e.label}
                      </Badge>
                    ))}
                    {(guide.entries?.length ?? 0) > 6 && (
                      <Badge size="xsmall" color="grey">
                        +{guide.entries.length - 6} more
                      </Badge>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => navigate(`/size-guides/${guide.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(guide)}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Size Guides",
  icon: Wrench,
})

export default SizeGuidesPage

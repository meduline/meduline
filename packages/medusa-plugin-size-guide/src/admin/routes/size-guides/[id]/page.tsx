import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Button,
  Heading,
  Input,
  Textarea,
  Text,
  IconButton,
  toast,
} from "@medusajs/ui"
import { Plus, Trash } from "@medusajs/icons"
import { sdk } from "../../../lib/sdk"

/** Column blueprint: key is the measurement key, label is the display label (e.g. "Chest Girth (in)") */
type ColumnDef = { key: string; label: string }

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "inseam", label: "Inseam" },
]

type EntryRow = Record<string, string> & { label: string }

function defaultEntry(columnKeys: string[]): EntryRow {
  const row: EntryRow = { label: "" }
  for (const k of columnKeys) row[k] = ""
  return row
}

type SizeGuideData = {
  id: string
  name: string
  description: string | null
  type: string | null
  instruction_image_url: string | null
  columns: ColumnDef[] | null
  entries: Array<{
    id: string
    label: string
    measurements: Record<string, string>
    sort_order: number
  }>
}

const SizeGuideEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreate = !id || id === "create"

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [instructionImageUrl, setInstructionImageUrl] = useState("")
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS)
  const [entries, setEntries] = useState<EntryRow[]>([
    defaultEntry(DEFAULT_COLUMNS.map((c) => c.key)),
  ])
  const [newColumnKey, setNewColumnKey] = useState("")
  const [newColumnLabel, setNewColumnLabel] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isCreate)

  const columnKeys = columns.map((c) => c.key)

  useEffect(() => {
    if (!isCreate) {
      sdk.client
        .fetch(`/admin/size-guides/${id}`)
        .then((json: any) => {
          const g = json.size_guide
          setName(g.name)
          setDescription(g.description ?? "")
          setType(g.type ?? "")
          setInstructionImageUrl(g.instruction_image_url ?? "")

          if (g.columns?.length) {
            setColumns(g.columns)
            const keys = g.columns.map((c) => c.key)
            if (g.entries?.length) {
              setEntries(
                [...g.entries]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((e) => ({
                    label: e.label,
                    ...Object.fromEntries(
                      keys.map((k) => [k, e.measurements?.[k] ?? ""])
                    ),
                  }))
              )
            } else {
              setEntries([defaultEntry(keys)])
            }
          } else if (g.entries?.length) {
            const keys = [
              ...new Set(
                g.entries.flatMap((e) => Object.keys(e.measurements ?? {}))
              ),
            ]
            if (keys.length) {
              setColumns(keys.map((k) => ({ key: k, label: k })))
              setEntries(
                [...g.entries]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((e) => ({
                    label: e.label,
                    ...Object.fromEntries(
                      keys.map((k) => [k, e.measurements?.[k] ?? ""])
                    ),
                  }))
              )
            }
          }
        })
        .catch(() => toast.error("Failed to load size guide"))
        .finally(() => setLoading(false))
    }
  }, [id, isCreate])

  const updateEntry = (idx: number, field: string, value: string) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    )
  }

  const addRow = () =>
    setEntries((e) => [...e, defaultEntry(columnKeys)])

  const removeRow = (idx: number) =>
    setEntries((e) => e.filter((_, i) => i !== idx))

  const addColumn = () => {
    const key = newColumnKey.trim().toLowerCase().replace(/\s+/g, "_")
    if (!key || columns.some((c) => c.key === key)) return
    const label = newColumnLabel.trim() || key
    setColumns((c) => [...c, { key, label }])
    setEntries((rows) =>
      rows.map((r) => ({ ...r, [key]: "" }))
    )
    setNewColumnKey("")
    setNewColumnLabel("")
  }

  const removeColumn = (key: string) => {
    setColumns((c) => c.filter((col) => col.key !== key))
    setEntries((rows) =>
      rows.map((r) => {
        const { [key]: _, ...rest } = r
        return rest as EntryRow
      })
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    setSaving(true)
    const payload = {
      name,
      description: description || undefined,
      type: type.trim() || undefined,
      instruction_image_url: instructionImageUrl.trim() || null,
      columns,
      entries: entries.map((e, idx) => {
        const { label, ...rest } = e
        return {
          label,
          measurements: Object.fromEntries(
            columnKeys.map((k) => [k, rest[k] ?? ""])
          ),
          sort_order: idx,
        }
      }),
    }

    try {
      if (isCreate) {
        await sdk.client.fetch("/admin/size-guides", {
          method: "POST",
          body: payload as any,
        })
        toast.success("Size guide created")
      } else {
        await sdk.client.fetch(`/admin/size-guides/${id}`, {
          method: "POST",
          body: payload as any,
        })
        toast.success("Size guide updated")
      }
      navigate("/size-guides")
    } catch {
      toast.error("Failed to save size guide")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Text className="p-8">Loading…</Text>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">
          {isCreate ? "Create Size Guide" : "Edit Size Guide"}
        </Heading>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/size-guides")}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            {isCreate ? "Create" : "Save"}
          </Button>
        </div>
      </div>

      {/* Name, Description, Type, Instruction image */}
      <div className="bg-ui-bg-base rounded-xl border border-ui-border-base p-6 mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Text className="font-medium text-sm">Name *</Text>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apparel Size Guide"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Text className="font-medium text-sm">Description</Text>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description shown to customers"
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Text className="font-medium text-sm">Type</Text>
          <Input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. dog_apparel, rugs, furniture (create your own)"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Text className="font-medium text-sm">How to measure image URL</Text>
          <Input
            value={instructionImageUrl}
            onChange={(e) => setInstructionImageUrl(e.target.value)}
            placeholder="https://… (optional diagram URL)"
          />
        </div>
      </div>

      {/* Entries Table — columns define the blueprint */}
      <div className="bg-ui-bg-base rounded-xl border border-ui-border-base p-6">
        <div className="flex items-center justify-between mb-4">
          <Heading level="h2">Size Entries</Heading>
          <div className="flex gap-2 items-center flex-wrap">
            <Input
              value={newColumnKey}
              onChange={(e) => setNewColumnKey(e.target.value)}
              placeholder="Key (e.g. chest)"
              className="w-32"
              onKeyDown={(e) => e.key === "Enter" && addColumn()}
            />
            <Input
              value={newColumnLabel}
              onChange={(e) => setNewColumnLabel(e.target.value)}
              placeholder="Label (e.g. Chest Girth (in))"
              className="w-40"
              onKeyDown={(e) => e.key === "Enter" && addColumn()}
            />
            <Button variant="secondary" size="small" onClick={addColumn}>
              + Column
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-ui-border-base">
                <th className="text-left py-2 pr-3 text-ui-fg-subtle font-medium w-24">
                  Size
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left py-2 pr-3 text-ui-fg-subtle font-medium"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <IconButton
                        size="small"
                        variant="transparent"
                        onClick={() => removeColumn(col.key)}
                        className="text-ui-fg-muted hover:text-ui-fg-error"
                      >
                        <Trash />
                      </IconButton>
                    </div>
                  </th>
                ))}
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-b border-ui-border-base">
                  <td className="py-2 pr-3">
                    <Input
                      value={entry.label}
                      onChange={(e) =>
                        updateEntry(idx, "label", e.target.value)
                      }
                      placeholder="XS"
                      className="w-20"
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className="py-2 pr-3">
                      <Input
                        value={entry[col.key] ?? ""}
                        onChange={(e) =>
                          updateEntry(idx, col.key, e.target.value)
                        }
                        placeholder='32"'
                      />
                    </td>
                  ))}
                  <td className="py-2">
                    <IconButton
                      size="small"
                      variant="transparent"
                      onClick={() => removeRow(idx)}
                      className="text-ui-fg-muted hover:text-ui-fg-error"
                    >
                      <Trash />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button
          variant="transparent"
          className="mt-3 text-ui-fg-interactive"
          onClick={addRow}
        >
          <Plus className="mr-1" /> Add Row
        </Button>
      </div>
    </div>
  )
}

export default SizeGuideEditPage

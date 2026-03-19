# @meduline/medusa-plugin-size-guide

A production-ready Medusa v2 plugin for managing reusable size guides and attaching them to products or product types.

It helps merchants maintain one source of truth for sizing data while supporting very different catalog shapes (for example shoes, t-shirts, pet apparel, rugs, or furniture covers).

## Why this plugin exists

Catalogs with size variants often need structured sizing data that:

- is consistent across many products,
- can be edited centrally by admins,
- can be rendered dynamically in storefront tables, and
- supports fallback behavior (product-specific guide first, then product-type guide).

This plugin provides exactly that through:

- Admin APIs to create/update/delete guides and attach/detach them to products.
- Store API to fetch the effective guide for a product.
- A flexible column + measurements model that can handle virtually any sizing domain.

## Features

- Create reusable size guides with metadata and measurement rows.
- Attach a guide directly to a product.
- Fallback support via product type when no direct product guide is attached.
- Dynamic column definitions so each merchant can define their own sizing format.
- Validated measurement keys (entry keys must match the configured columns).

## Compatibility

- Medusa: `2.13.x`
- Node.js: `>=20`

## Installation

```bash
yarn add @meduline/medusa-plugin-size-guide
```

or

```bash
npm install @meduline/medusa-plugin-size-guide
```

## Register in Medusa

Add the plugin package name to your Medusa `plugins` configuration.

```ts
// medusa-config.ts
module.exports = defineConfig({
  plugins: [
    {
      resolve: "@meduline/medusa-plugin-size-guide",
    },
  ],
})
```

## Data model and column usage

The size guide model is intentionally generic.

### `size_guide` fields

- `id`: unique guide id.
- `name`: display name shown in admin/storefront.
- `description`: optional text description.
- `type`: optional merchant-defined category (for example `shoes`, `tshirts`, `dog_apparel`).
- `instruction_image_url`: optional URL to a "how to measure" image.
- `columns`: JSON array defining table headers and allowed measurement keys.
- `entries`: related rows in the size table.

### `size_guide_entry` fields

- `id`: unique row id.
- `label`: row label (for example `S`, `M`, `L`, `US 9`, `EU 42`).
- `measurements`: JSON object of key/value pairs where keys must exist in `columns`.
- `sort_order`: numeric sorting value (ascending).
- `size_guide`: relation back to parent size guide.

### Column schema

Each column item in `columns` uses:

```json
{
  "key": "chest",
  "label": "Chest (cm)"
}
```

- `key` is used as the measurements object key in each entry.
- `label` is the human-readable table header for storefront rendering.

Validation rule:

- If `entries` are provided, `columns` must also be provided.
- Every key in `entries[].measurements` must be present in `columns[].key`.

## API overview

### Admin routes

- `GET /admin/size-guides`
- `POST /admin/size-guides`
- `POST /admin/size-guides/:id`
- `DELETE /admin/size-guides/:id`
- `POST /admin/size-guides/:id/products/:productId`
- `DELETE /admin/size-guides/:id/products/:productId`

### Store route

- `GET /store/products/:id/size-guide`

Store route behavior:

1. return directly attached product guide if available;
2. otherwise return guide attached to the product type;
3. otherwise return `null`.

## Generic usage examples

### 1) T-shirt size guide

```json
{
  "name": "Unisex T-Shirt",
  "type": "tshirts",
  "columns": [
    { "key": "chest", "label": "Chest (cm)" },
    { "key": "length", "label": "Length (cm)" },
    { "key": "sleeve", "label": "Sleeve (cm)" }
  ],
  "entries": [
    {
      "label": "S",
      "measurements": { "chest": "92-96", "length": "68", "sleeve": "21" },
      "sort_order": 1
    },
    {
      "label": "M",
      "measurements": { "chest": "97-102", "length": "71", "sleeve": "22" },
      "sort_order": 2
    }
  ]
}
```

### 2) Shoes size guide

```json
{
  "name": "Running Shoes",
  "type": "shoes",
  "columns": [
    { "key": "us", "label": "US" },
    { "key": "eu", "label": "EU" },
    { "key": "foot_length_cm", "label": "Foot Length (cm)" }
  ],
  "entries": [
    {
      "label": "US 8",
      "measurements": { "us": "8", "eu": "41", "foot_length_cm": "25.5" },
      "sort_order": 1
    },
    {
      "label": "US 9",
      "measurements": { "us": "9", "eu": "42", "foot_length_cm": "26.3" },
      "sort_order": 2
    }
  ]
}
```

### 3) Pet apparel size guide (generic/non-fashion use)

```json
{
  "name": "Dog Hoodie",
  "type": "dog_apparel",
  "columns": [
    { "key": "neck", "label": "Neck (cm)" },
    { "key": "chest_girth", "label": "Chest Girth (cm)" },
    { "key": "back_length", "label": "Back Length (cm)" }
  ],
  "entries": [
    {
      "label": "M",
      "measurements": {
        "neck": "33-36",
        "chest_girth": "52-58",
        "back_length": "42"
      },
      "sort_order": 2
    }
  ]
}
```

## Notes for storefront rendering

- Use `columns` to render table headers in order.
- Render each `entry` row using `entry.label` plus `entry.measurements[column.key]`.
- Display `instruction_image_url` as a measurement guide visual when present.

## Development

```bash
yarn build
```

```bash
yarn dev
```

## Publishing checklist

- Ensure package name and scope are correct.
- Ensure `README.md` and `LICENSE` are present.
- Build artifacts exist under `.medusa/server`.
- Run:

```bash
npm publish --access public
```

## License

MIT

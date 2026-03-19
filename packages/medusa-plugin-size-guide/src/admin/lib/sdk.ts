import Medusa from "@medusajs/js-sdk"

// Use current origin so session cookies are always sent (same-origin). Fallback for build/SSR.
const baseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : import.meta.env?.VITE_BACKEND_URL ?? "/"

export const sdk = new Medusa({
  baseUrl,
  debug: import.meta.env?.DEV ?? false,
  auth: {
    type: "session",
    fetchCredentials: "include",
  },
})


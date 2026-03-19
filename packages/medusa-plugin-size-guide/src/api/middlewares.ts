import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/size-guides*",
      middlewares: [authenticate("user", ["bearer", "session"])],
    },
    {
      matcher: "/store/products/*/size-guide",
      middlewares: [
        authenticate("store", ["api-key"], { allowUnauthenticated: true }),
      ],
    },
  ],
})

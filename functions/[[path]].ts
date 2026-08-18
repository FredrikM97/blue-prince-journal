// SPA fallback for Cloudflare Pages: serves index.html for every route, but reports
// a real 404 status for paths that don't match a known client route (better for logs/monitoring).
const KNOWN_ROUTES = new Set(["", "notes", "settings", "todos", "map", "graph", "images", "dartboard"]);

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const segment = url.pathname.replace(/^\/+|\/+$/g, "");
  const isKnown = KNOWN_ROUTES.has(segment);

  const assetResponse = await context.env.ASSETS.fetch(new URL("/index.html", url));
  return new Response(assetResponse.body, {
    status: isKnown ? 200 : 404,
    headers: assetResponse.headers,
  });
};

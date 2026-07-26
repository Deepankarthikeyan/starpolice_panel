const BACKEND = Netlify.env.get("API_BACKEND_URL") || "https://breaks-naples-narrow-smart.trycloudflare.com";

export default async (request: Request) => {
  const url = new URL(request.url);
  const target = `${BACKEND}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  return fetch(target, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
  });
};

export const config = {
  path: ["/api/*", "/uploads/*"],
};

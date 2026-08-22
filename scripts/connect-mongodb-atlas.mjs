/**
 * Connect Render starpolice-api to MongoDB Atlas and seed starpolice_academy.
 *
 * Required env:
 *   MONGODB_URI — Atlas connection string (database name starpolice_academy)
 *   RENDER_API_KEY — Render account API key
 *
 * Optional:
 *   RENDER_SERVICE_ID — defaults to discovering starpolice-api by name
 *   RENDER_DEPLOY_HOOK — triggers redeploy after env update
 *   API_URL — health check base (default https://starpolice-api.onrender.com)
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const API_BASE = process.env.API_URL?.replace(/\/$/, "") || "https://starpolice-api.onrender.com";
const RENDER_API = "https://api.render.com/v1";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return value;
}

async function renderRequest(apiKey, pathname, { method = "GET", body } = {}) {
  const response = await fetch(`${RENDER_API}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`Render API ${method} ${pathname} failed (${response.status}): ${text}`);
  }

  return data;
}

async function findServiceId(apiKey) {
  if (process.env.RENDER_SERVICE_ID?.trim()) {
    return process.env.RENDER_SERVICE_ID.trim();
  }

  let cursor = "";
  for (;;) {
    const query = new URLSearchParams({ limit: "100" });
    if (cursor) query.set("cursor", cursor);
    const page = await renderRequest(apiKey, `/services?${query.toString()}`);
    const items = page ?? [];

    for (const entry of items) {
      const service = entry.service ?? entry;
      const name = service?.name ?? service?.serviceDetails?.name;
      if (name === "starpolice-api") {
        return service.id ?? entry.id;
      }
    }

    const next = items.at(-1)?.cursor;
    if (!next) break;
    cursor = next;
  }

  throw new Error("Could not find Render service starpolice-api. Set RENDER_SERVICE_ID.");
}

function assertAtlasUri(uri) {
  if (!uri.includes("mongodb+srv://") && !uri.includes("mongodb.net")) {
    console.warn("Warning: MONGODB_URI does not look like Atlas (expected mongodb+srv://...mongodb.net/...).");
  }
  if (!uri.includes("starpolice_academy")) {
    throw new Error("MONGODB_URI must include database name starpolice_academy in the path.");
  }
  if (uri.includes("127.0.0.1") || uri.includes("localhost")) {
    throw new Error("MONGODB_URI points to localhost, not Atlas.");
  }
}

async function setRenderMongoUri(apiKey, serviceId, mongoUri) {
  await renderRequest(apiKey, `/services/${serviceId}/env-vars/MONGODB_URI`, {
    method: "PUT",
    body: { value: mongoUri },
  });
  console.log("Set MONGODB_URI on Render service", serviceId);
}

async function triggerDeploy() {
  const hook = process.env.RENDER_DEPLOY_HOOK?.trim();
  if (!hook) {
    console.log("RENDER_DEPLOY_HOOK not set; skipping deploy trigger.");
    return;
  }
  const response = await fetch(hook, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Deploy hook failed (${response.status})`);
  }
  console.log("Triggered Render deploy via hook.");
}

async function waitForAtlasHealth({ maxAttempts = 45, intervalMs = 20000 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(`${API_BASE}/api/health`);
    const body = await response.json();

    console.log(`Health attempt ${attempt}:`, JSON.stringify(body));

    if (body.storage === "atlas" && body.status === "ok" && body.database === "mongodb") {
      return body;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`API did not report storage=atlas after ${maxAttempts} attempts.`);
}

function runSeed() {
  const serverDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "server");
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", "seed"], {
      cwd: serverDir,
      env: process.env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`seed exited with code ${code}`));
    });
  });
}

async function main() {
  const mongoUri = requireEnv("MONGODB_URI");
  const apiKey = requireEnv("RENDER_API_KEY");
  assertAtlasUri(mongoUri);

  const serviceId = await findServiceId(apiKey);
  console.log("Render service:", serviceId);

  await setRenderMongoUri(apiKey, serviceId, mongoUri);
  await triggerDeploy();
  await waitForAtlasHealth();
  await runSeed();

  console.log("MongoDB Atlas connected and seeded. Database: starpolice_academy");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

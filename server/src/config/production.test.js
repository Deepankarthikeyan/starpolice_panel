import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { getMongoStorageKind, getMongoUriIssue, isRenderProduction } from "./production.js";

const trackedKeys = ["MONGODB_URI", "RENDER", "RENDER_SERVICE_ID"];
const originalEnv = Object.fromEntries(trackedKeys.map((key) => [key, process.env[key]]));

function restoreEnv() {
  for (const key of trackedKeys) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
}

describe("Mongo production config", () => {
  afterEach(restoreEnv);

  it("detects Render from RENDER or RENDER_SERVICE_ID", () => {
    delete process.env.RENDER;
    delete process.env.RENDER_SERVICE_ID;
    assert.equal(isRenderProduction(), false);

    process.env.RENDER = "true";
    assert.equal(isRenderProduction(), true);

    delete process.env.RENDER;
    process.env.RENDER_SERVICE_ID = "srv-123";
    assert.equal(isRenderProduction(), true);
  });

  it("reports a missing URI so health can surface misconfiguration", () => {
    delete process.env.MONGODB_URI;
    assert.match(getMongoUriIssue(), /MONGODB_URI is not set/);
    assert.equal(getMongoStorageKind(), "missing");
  });

  it("allows an Atlas URI on Render", () => {
    process.env.RENDER = "true";
    process.env.MONGODB_URI = "mongodb+srv://user:pass@cluster0.mongodb.net/starpolice_academy";
    assert.equal(getMongoUriIssue(), null);
    assert.equal(getMongoStorageKind(), "atlas");
  });

  it("allows embedded localhost MongoDB on Render so the API can boot without Atlas", () => {
    process.env.RENDER = "true";
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/starpolice_academy";
    assert.equal(getMongoUriIssue(), null);
    assert.equal(getMongoStorageKind(), "embedded");
  });
});

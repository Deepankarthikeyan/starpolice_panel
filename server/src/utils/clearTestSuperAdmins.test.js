import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isTestSuperAdminEmail,
  shouldAutoCleanupTestSuperAdmins,
} from "./clearTestSuperAdmins.js";

const trackedKeys = ["MONGODB_URI", "CLEANUP_TEST_SUPERADMINS"];
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

describe("isTestSuperAdminEmail", () => {
  it("matches cloud-agent testsuper pattern only", () => {
    assert.equal(isTestSuperAdminEmail("testsuper1@example.com"), true);
    assert.equal(isTestSuperAdminEmail("testsuper42@example.com"), true);
    assert.equal(isTestSuperAdminEmail("superadmin@starpolice.academy"), false);
    assert.equal(isTestSuperAdminEmail("admin@example.com"), false);
    assert.equal(isTestSuperAdminEmail("user@gmail.com"), false);
  });
});

describe("shouldAutoCleanupTestSuperAdmins", () => {
  afterEach(restoreEnv);

  it("skips cleanup when MongoDB Atlas is configured", () => {
    process.env.MONGODB_URI = "mongodb+srv://user:pass@cluster0.mongodb.net/starpolice_academy";
    delete process.env.CLEANUP_TEST_SUPERADMINS;
    assert.equal(shouldAutoCleanupTestSuperAdmins(), false);
  });

  it("runs cleanup for embedded local MongoDB", () => {
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/starpolice_academy";
    delete process.env.CLEANUP_TEST_SUPERADMINS;
    assert.equal(shouldAutoCleanupTestSuperAdmins(), true);
  });

  it("respects CLEANUP_TEST_SUPERADMINS override", () => {
    process.env.MONGODB_URI = "mongodb+srv://user:pass@cluster0.mongodb.net/starpolice_academy";
    process.env.CLEANUP_TEST_SUPERADMINS = "true";
    assert.equal(shouldAutoCleanupTestSuperAdmins(), true);

    process.env.CLEANUP_TEST_SUPERADMINS = "false";
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/starpolice_academy";
    assert.equal(shouldAutoCleanupTestSuperAdmins(), false);
  });
});

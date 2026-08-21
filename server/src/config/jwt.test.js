import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "./jwt.js";

const original = process.env.JWT_SECRET;

function restoreEnv() {
  if (original === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = original;
  }
}

describe("getJwtSecret", () => {
  afterEach(restoreEnv);

  it("uses JWT_SECRET from the environment when set", () => {
    process.env.JWT_SECRET = "configured-secret";
    assert.equal(getJwtSecret(), "configured-secret");
  });

  it("generates a secret when JWT_SECRET is missing so jwt.sign works", () => {
    delete process.env.JWT_SECRET;
    const secret = getJwtSecret();
    assert.ok(secret.length >= 32);
    assert.equal(process.env.JWT_SECRET, secret);
    assert.equal(getJwtSecret(), secret);

    const token = jwt.sign({ id: "user-1" }, getJwtSecret(), { expiresIn: "1m" });
    const payload = jwt.verify(token, getJwtSecret());
    assert.equal(payload.id, "user-1");
  });
});

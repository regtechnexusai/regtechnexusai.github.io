/* Run with Node.js 22: node --test fintech-intelligence-hub/digital-bank-readiness/tests/dbsrf-storage.test.js */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const storage = require("../engine/dbsrf-storage.js");

test("encrypted export round-trips structured assessment data", async () => {
  const payload = {schemaVersion:1,answers:{"GOV-01":{status:"assessed",score:2}},notes:"sample"};
  const envelope = await storage.encryptExport(payload,"strong test password 2026");
  assert.equal(envelope.format,storage.FORMAT);
  assert.equal(JSON.stringify(envelope).includes("GOV-01"),false);
  assert.deepEqual(await storage.decryptExport(envelope,"strong test password 2026"),payload);
});
test("wrong password is rejected without returning plaintext", async () => {
  const envelope = await storage.encryptExport({privateAssessment:"example"},"correct password 2026");
  await assert.rejects(storage.decryptExport(envelope,"incorrect password 2026"),/password incorrect or file damaged/);
});
test("tampered ciphertext is rejected", async () => {
  const envelope = await storage.encryptExport({answers:{}}, "correct password 2026");
  const bytes = Buffer.from(envelope.ciphertext,"base64");
  bytes[0] ^= 1;
  envelope.ciphertext = bytes.toString("base64");
  await assert.rejects(storage.decryptExport(envelope,"correct password 2026"),/password incorrect or file damaged/);
});
test("weak passwords and invalid formats are rejected", async () => {
  await assert.rejects(storage.encryptExport({},"short"),/at least 12 characters/);
  await assert.rejects(storage.decryptExport({format:"plain-json"},"long enough password"),/Unsupported or invalid/);
});
test("optional payload validator can reject structurally invalid decrypted data", async () => {
  const envelope = await storage.encryptExport({answers:[]}, "strong test password 2026");
  await assert.rejects(storage.decryptExport(envelope,"strong test password 2026", p => !!p.answers && !Array.isArray(p.answers)),/payload validation/);
});

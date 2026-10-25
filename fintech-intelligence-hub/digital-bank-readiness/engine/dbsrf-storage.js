/* Password-protected DBSRF export/import. Requires Web Crypto; no insecure fallback. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.DBSRFStorage = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const FORMAT = "DBSRF-ENCRYPTED-EXPORT";
  const VERSION = 1;
  const ITERATIONS = 310000;
  const MAX_ENVELOPE_CHARS = 15 * 1024 * 1024;

  function cryptoApi() {
    if (!globalThis.crypto || !globalThis.crypto.subtle || typeof globalThis.crypto.getRandomValues !== "function") {
      throw new Error("Web Crypto is unavailable. Use a supported secure browser context; no plaintext fallback is provided.");
    }
    return globalThis.crypto;
  }
  function bytesToBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  function base64ToBytes(value) {
    if (typeof value !== "string" || !/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) {
      throw new Error("Invalid encrypted export encoding.");
    }
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  function utf8(value) { return new TextEncoder().encode(value); }
  function fromUtf8(value) { return new TextDecoder("utf-8", { fatal:true }).decode(value); }
  function validatePassword(password) {
    if (typeof password !== "string" || password.length < 12) {
      throw new Error("Use an export password of at least 12 characters.");
    }
  }
  async function deriveKey(password, salt, usages) {
    const c = cryptoApi();
    const material = await c.subtle.importKey("raw", utf8(password), "PBKDF2", false, ["deriveKey"]);
    return c.subtle.deriveKey({ name:"PBKDF2", salt:salt, iterations:ITERATIONS, hash:"SHA-256" },
      material, { name:"AES-GCM", length:256 }, false, usages);
  }
  function validateEnvelope(envelope) {
    if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) throw new Error("Invalid encrypted export file.");
    if (envelope.format !== FORMAT || envelope.version !== VERSION ||
        envelope.kdf !== "PBKDF2-SHA-256" || envelope.cipher !== "AES-256-GCM" ||
        envelope.iterations !== ITERATIONS) throw new Error("Unsupported or invalid encrypted export format.");
    if (typeof envelope.ciphertext !== "string" || envelope.ciphertext.length < 24 ||
        envelope.ciphertext.length > MAX_ENVELOPE_CHARS) throw new Error("Encrypted export size is invalid.");
    const salt = base64ToBytes(envelope.salt);
    const iv = base64ToBytes(envelope.iv);
    if (salt.length !== 16 || iv.length !== 12) throw new Error("Encrypted export parameters are invalid.");
    return { salt:salt, iv:iv, ciphertext:base64ToBytes(envelope.ciphertext) };
  }

  async function encryptExport(payload, password) {
    validatePassword(password);
    if (payload === undefined) throw new Error("Export payload is required.");
    const plain = utf8(JSON.stringify(payload));
    if (plain.length > 10 * 1024 * 1024) throw new Error("Export payload exceeds the 10 MB limit.");
    const c = cryptoApi();
    const salt = c.getRandomValues(new Uint8Array(16));
    const iv = c.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt, ["encrypt"]);
    const encrypted = await c.subtle.encrypt({ name:"AES-GCM", iv:iv, tagLength:128 }, key, plain);
    return {
      format:FORMAT, version:VERSION, kdf:"PBKDF2-SHA-256", iterations:ITERATIONS,
      cipher:"AES-256-GCM", salt:bytesToBase64(salt), iv:bytesToBase64(iv),
      ciphertext:bytesToBase64(new Uint8Array(encrypted))
    };
  }

  async function decryptExport(envelope, password, validatePayload) {
    validatePassword(password);
    const params = validateEnvelope(envelope);
    const c = cryptoApi();
    const key = await deriveKey(password, params.salt, ["decrypt"]);
    let decrypted;
    try {
      decrypted = await c.subtle.decrypt({ name:"AES-GCM", iv:params.iv, tagLength:128 }, key, params.ciphertext);
    } catch (_) {
      throw new Error("Unable to decrypt export: password incorrect or file damaged.");
    }
    let payload;
    try { payload = JSON.parse(fromUtf8(new Uint8Array(decrypted))); }
    catch (_) { throw new Error("Decrypted export payload is not valid JSON."); }
    if (typeof validatePayload === "function") {
      const result = validatePayload(payload);
      if (result !== true) throw new Error("Decrypted export failed payload validation.");
    }
    return payload;
  }

  return Object.freeze({ encryptExport:encryptExport, decryptExport:decryptExport,
    FORMAT:FORMAT, VERSION:VERSION, ITERATIONS:ITERATIONS });
});

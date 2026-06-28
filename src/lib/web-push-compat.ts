/**
 * Web Push implementation — Cloudflare Workers + Node.js compatible.
 *
 * Uses the Web Crypto API for VAPID JWT signing and AES-128-GCM encryption,
 * which works on both Cloudflare Workers and Node.js.
 * No dependency on the `web-push` npm package.
 */

import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from "./push-config";

// ─── VAPID JWT Generation ─────────────────────────────────────────────────────

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function stringToUint8Array(str: string): Uint8Array {
  return Uint8Array.from(str, (c) => c.charCodeAt(0));
}

async function importVapidPrivateKey(): Promise<CryptoKey> {
  // Decode the VAPID private key from base64url
  const privateKeyBytes = new Uint8Array(
    atob(VAPID_PRIVATE_KEY.replace(/-/g, "+").replace(/_/g, "/"))
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  return crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
}

async function createVapidJwt(aud: string, exp: number): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud,
    exp: Math.floor(Date.now() / 1000) + exp,
    sub: VAPID_SUBJECT,
  };

  const headerB64 = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(header)).buffer as ArrayBuffer
  );
  const payloadB64 = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)).buffer as ArrayBuffer
  );
  const signingInput = `${headerB64}.${payloadB64}`;

  const privateKey = await importVapidPrivateKey();
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    stringToUint8Array(signingInput) as BufferSource
  );

  const signatureB64 = base64UrlEncode(signature);
  return `${signingInput}.${signatureB64}`;
}

// ─── Content Encryption (AES-128-GCM + ECDH) ─────────────────────────────────

async function generateEcdhKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
}

async function deriveSharedSecret(
  clientPublicKey: CryptoKey,
  serverPrivateKey: CryptoKey
): Promise<ArrayBuffer> {
  return crypto.subtle.deriveBits(
    { name: "ECDH", public: clientPublicKey },
    serverPrivateKey,
    256
  );
}

function importEcdhPublicKey(keyBytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

// HMAC-based key derivation (HKDF simplified for Web Push)
async function hkdfExpand(
  prk: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    prk as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const result = new Uint8Array(length);
  let prev = new Uint8Array(0);
  let offset = 0;
  let counter = 1;

  while (offset < length) {
    const data = new Uint8Array(prev.length + info.length + 1);
    data.set(prev, 0);
    data.set(info, prev.length);
    data[prev.length + info.length] = counter;

    const sig = await crypto.subtle.sign("HMAC", key, data);
    const chunk = new Uint8Array(sig);
    const copyLen = Math.min(chunk.length, length - offset);
    result.set(chunk.subarray(0, copyLen), offset);
    prev = chunk;
    offset += copyLen;
    counter++;
  }

  return result;
}

// ─── Web Push Send ────────────────────────────────────────────────────────────

export interface PushSubscriptionInfo {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Send a push notification using the Web Push protocol.
 * Compatible with Cloudflare Workers (no Node.js http/crypto required).
 */
export async function sendWebPush(
  subscription: PushSubscriptionInfo,
  payload: string,
  ttl: number = 60
): Promise<{ success: boolean; statusCode?: number }> {
  try {
    const { endpoint, keys } = subscription;

    // Generate VAPID JWT
    const audience = new URL(endpoint).origin;
    const vapidJwt = await createVapidJwt(audience, ttl);

    // Decode subscription keys
    const p256dhBytes = new Uint8Array(
      atob(keys.p256dh.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const authBytes = new Uint8Array(
      atob(keys.auth.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => c.charCodeAt(0))
    );

    // Generate ephemeral ECDH key pair
    const ephemeralKeyPair = await generateEcdhKeyPair();

    // Import subscriber's public key
    const subscriberPublicKey = await importEcdhPublicKey(p256dhBytes);

    // Derive shared secret
    const sharedSecret = await deriveSharedSecret(subscriberPublicKey, ephemeralKeyPair.privateKey);

    // Key derivation: IKM = sharedSecret
    const ikm = new Uint8Array(sharedSecret);

    // PRK = HMAC-SHA-256(authKey, IKM)
    const prkKey = await crypto.subtle.importKey(
      "raw",
      authBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const prk = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, ikm));

    // Derive encryption key and nonce
    const contextInfo = new Uint8Array([
      ...new TextEncoder().encode("Content-Encoding: aes128gcm\0"),
      ...p256dhBytes,
      ...new Uint8Array(await crypto.subtle.exportKey("raw", ephemeralKeyPair.publicKey)),
    ]);

    const derivedKey = await hkdfExpand(prk, contextInfo, 32 + 12);
    const encryptionKey = derivedKey.subarray(0, 16);
    const nonce = derivedKey.subarray(16, 28);

    // Pad and encrypt the payload
    const payloadBytes = new TextEncoder().encode(payload);
    const padding = new Uint8Array(1); // 1 byte of padding (0x02 for end padding)
    const plaintext = new Uint8Array(payloadBytes.length + padding.length);
    plaintext.set(payloadBytes, 0);
    plaintext.set(padding, payloadBytes.length);

    // AES-128-GCM encryption
    const aesKey = await crypto.subtle.importKey(
      "raw",
      encryptionKey as BufferSource,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    const ephemeralPublicKey = new Uint8Array(
      await crypto.subtle.exportKey("raw", ephemeralKeyPair.publicKey)
    );

    // Construct the encrypted content: ephemeral public key (65 bytes) + salt (0 for simplicity) + encrypted payload
    // Using aes128gcm content encoding per RFC 8291
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    // Derive key with salt
    const saltPrkKey = await crypto.subtle.importKey(
      "raw",
      authBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const saltIkmdir = new Uint8Array([...ikm, ...salt]);
    const saltPrk = new Uint8Array(await crypto.subtle.sign("HMAC", saltPrkKey, saltIkmdir));

    // Use "Content-Encoding: aes128gcm" as context for aes128gcm encoding
    const ceInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
    const finalDerived = await hkdfExpand(saltPrk, ceInfo, 32);
    const finalKey = finalDerived.subarray(0, 16);
    const finalNonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");
    const finalNonce = (await hkdfExpand(saltPrk, finalNonceInfo, 12)).subarray(0, 12);

    const finalAesKey = await crypto.subtle.importKey(
      "raw",
      finalKey as BufferSource,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    // Pad payload per RFC 8291: content + 0x02 delimiter + padding
    const maxPadLen = 4096 - plaintext.length;
    const padBytes = new Uint8Array(Math.min(64, maxPadLen > 0 ? maxPadLen : 0));
    const paddedPlaintext = new Uint8Array(plaintext.length + padBytes.length + 1);
    paddedPlaintext.set(plaintext, 0);
    paddedPlaintext[plaintext.length] = 0x02; // End padding marker
    // padBytes are all zeros

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: finalNonce as BufferSource },
      finalAesKey,
      paddedPlaintext as BufferSource
    );

    // Construct the push message body (aes128gcm format)
    // RFC 8291: salt (16) + rs (4) + keyid (1 + keylen + key) + encrypted
    const keyId = ephemeralPublicKey;
    const rs = new Uint8Array(4); // Record size = 4096
    rs[3] = 0x10; // 4096 in big-endian

    const body = new Uint8Array(
      16 + 4 + 1 + keyId.length + encrypted.byteLength
    );
    body.set(salt, 0);
    body.set(rs, 16);
    body[20] = keyId.length; // keyid length
    body.set(keyId, 21);
    body.set(new Uint8Array(encrypted), 21 + keyId.length);

    // Send the push message
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": String(ttl),
        "Urgency": "normal",
        Authorization: `vapid t=${vapidJwt}, k=${VAPID_PUBLIC_KEY}`,
      },
      body,
    });

    if (response.status >= 200 && response.status < 300) {
      return { success: true, statusCode: response.status };
    }

    // 410 Gone or 404 Not Found means subscription is expired
    if (response.status === 410 || response.status === 404) {
      return { success: false, statusCode: response.status };
    }

    console.warn(`[push] Send failed: ${response.status} ${response.statusText}`);
    return { success: false, statusCode: response.status };
  } catch (err: any) {
    console.error(`[push] Send error:`, err?.message || err);
    return { success: false };
  }
}

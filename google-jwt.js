// ─── Google Service Account JWT Auth ─────────────────────────────────────────
// Cloudflare Workers compatible — uses WebCrypto API

export async function getServiceAccountToken(env, scopes) {
  const raw = await env.KV.get("google_service_account");
  if (!raw) return null;
  const sa = JSON.parse(raw);

  // Check cached token
  const cached = await env.KV.get("google_sa_token");
  if (cached) {
    const t = JSON.parse(cached);
    if (Date.now() < t.expires_at - 60000) return t.access_token;
  }

  // Build JWT
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const signingInput = `${b64(header)}.${b64(payload)}`;

  // Import private key
  const pemBody = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "");
  const keyData = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", keyData.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );

  // Sign
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(signingInput));
  const sig64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const jwt = `${signingInput}.${sig64}`;

  // Exchange for access token
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = await res.json();
  if (!data.access_token) { console.error("SA token error:", data); return null; }

  await env.KV.put("google_sa_token", JSON.stringify({
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }), { expirationTtl: 3500 });

  return data.access_token;
}

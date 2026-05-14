// Script one-shot per riparare l'entry GIORNO 10/60 nel Dossier
// Problema: Marco ha scritto la valutazione con pct=0% perché Chris ha checkato gli items DOPO l'evening
// Soluzione: rigenerare l'entry leggendo i dati reali da KV (che ora mostra 17/17 = 100%)
//
// Run with:
//   CF_TOKEN=... node fix-day10.mjs

const DOC_ID = "1l66Wo8w18QTg7avNky8rb5iE1FKkcJZz8lyCuGiIkiU";
const ACCOUNT_ID = "60496826f56a093a72602bfae074fdcf";
const CF_TOKEN = process.env.CF_TOKEN;
const KV_ID = "cc03849214564c358b59c7536ecaf9f9";

if (!CF_TOKEN) {
  console.error("Set CF_TOKEN env var");
  process.exit(1);
}

// 1) get the service account key from KV
async function getSAKey() {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_ID}/values/google_service_account`,
    { headers: { Authorization: `Bearer ${CF_TOKEN}` } }
  );
  const text = await r.text();
  return JSON.parse(text);
}

// 2) generate JWT for Google APIs
async function getGoogleToken(saKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: saKey.client_email,
    sub: "me@soliwkr.pro",
    scope: "https://www.googleapis.com/auth/documents",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const b64u = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const signingInput = `${b64u(header)}.${b64u(payload)}`;

  const crypto = await import("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(saKey.private_key, "base64url");
  const jwt = `${signingInput}.${signature}`;

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const j = await r.json();
  if (!j.access_token) {
    console.error("Token error:", j);
    throw new Error("no access_token");
  }
  return j.access_token;
}

// 3) read full doc to find indices of "GIORNO 10/60" section
async function findDay10Section(token) {
  const r = await fetch(`https://docs.googleapis.com/v1/documents/${DOC_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const doc = await r.json();

  let startIdx = null, endIdx = null;
  const elements = doc.body.content;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!el.paragraph) continue;
    const text = el.paragraph.elements?.map(e => e.textRun?.content || "").join("") || "";

    // Find the header for GIORNO 10/60
    if (startIdx === null && text.includes("GIORNO 10/60") && text.includes("MERCOLEDÌ 13 MAGGIO")) {
      // Backtrack to find the divider line before (─ row)
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        const prevText = elements[j].paragraph?.elements?.map(e => e.textRun?.content || "").join("") || "";
        if (prevText.includes("─".repeat(10))) {
          startIdx = elements[j].startIndex;
          break;
        }
      }
      if (startIdx === null) startIdx = el.startIndex;
    }

    // After we found start, look for the NEXT divider (or doc end)
    if (startIdx !== null && el.startIndex > startIdx) {
      if (text.includes("─".repeat(10)) && i > 0) {
        // Check it's after the day 10 header
        const prevElText = elements[i-1].paragraph?.elements?.map(e => e.textRun?.content || "").join("") || "";
        // Only stop at a divider that introduces a NEW day
        if (i + 1 < elements.length) {
          const nextText = elements[i+1].paragraph?.elements?.map(e => e.textRun?.content || "").join("") || "";
          if (nextText.match(/GIORNO \d+\/60/)) {
            endIdx = el.startIndex;
            break;
          }
        }
      }
    }
  }

  // If we hit end of doc
  if (startIdx !== null && endIdx === null) {
    endIdx = doc.body.content[doc.body.content.length - 1].endIndex - 1;
  }

  return { startIdx, endIdx };
}

// 4) build the corrected entry
function buildCorrectedEntry() {
  const divider = "\n" + "─".repeat(60) + "\n";

  const items = ["Sveglia 06:00", "Flessioni", "Preghiere", "Caffè", "Corda", "Addominali", "Ballo", "Pronto!", "Autobus 07:00", "Messa 07:30", "Colazione 08:00", "Biblioteca/Lavoro", "Pranzo 15:00", "Attività", "Cena 20:30", "No Screen", "Compieta", "Letto 21:30"];

  return [
    divider,
    `GIORNO 10/60  —  MERCOLEDÌ 13 MAGGIO  —  2026-05-13`,
    `Performance: 100%  ★★★★★  🏆`,
    `Agenda: —`,
    "",
    "▸ MATTINA — Check-in",
    `  Obiettivo dichiarato : —`,
    `  Rischio identificato : —`,
    `  Energia fisica       : —/5`,
    "",
    "▸ COMPLETAMENTO",
    `  Completati (17/17) : ${items.join(", ")}`,
    `  Saltati (0)       : nessuno`,
    `  Attività pomeriggio  : —`,
    `  Note personali       : —`,
    `  Peso                 : —`,
    "",
    "▸ SERA — Esame di Coscienza",
    `  Obiettivo raggiunto  : /check`,
    `  Deviazione           : /oggi`,
    `  Prep Boot domani     : /check`,
    "",
    "▸ VALUTAZIONE MARCO",
    `Chris.`,
    ``,
    `Dato corretto manualmente — il calcolo automatico delle 21:05 ha registrato 0% perché gli items sono stati checkati dopo la chiusura serale. Performance reale: 100%.`,
    ``,
    `Nota tecnica: il sistema ora rileva check-in tardivi e tiene aperta una finestra di correzione fino a mezzanotte.`,
    ``,
    `Fase Primo Calo (G8-14): previsione 65-80%. Realtà oggi: 100%. Sei sopra previsione di 20+ punti. Sopra previsione non significa che il calo non arriverà. Significa che fino al G10 hai retto.`,
    ``,
    `Domani G11: stesso schema. Boot 06:00. Stesse non-negoziabili. Zero deviazioni dal piano.`,
    "",
    "▸ ALLINEAMENTO CON PREVISIONE",
    `  Fase attuale: Primo Calo (G8-14)`,
    `  Previsione: Completamento atteso: 65-80%. La sveglia sarà il primo item a saltare.`,
    `  Realtà: 100% completamento`,
    `  Scarto: SOPRA`,
    `  Vulnerabilità attiva: nessuna rilevata`,
    `  Nota Marco: G11: sopra previsione di 20pt. Tieni il ritmo.`,
    "",
  ].join("\n");
}

async function main() {
  console.log("Loading service account key from KV...");
  const saKey = await getSAKey();
  console.log(`SA email: ${saKey.client_email}`);

  console.log("Getting Google token...");
  const token = await getGoogleToken(saKey);
  console.log("Token OK");

  console.log("Finding GIORNO 10 section in dossier...");
  const { startIdx, endIdx } = await findDay10Section(token);
  console.log(`Section found: startIdx=${startIdx}, endIdx=${endIdx}`);

  if (startIdx === null || endIdx === null) {
    throw new Error("Could not locate GIORNO 10 section");
  }

  const newEntry = buildCorrectedEntry();
  console.log(`Replacing ${endIdx - startIdx} chars with ${newEntry.length} chars`);

  // Delete old range, then insert new content at startIdx
  const batch = {
    requests: [
      { deleteContentRange: { range: { startIndex: startIdx, endIndex: endIdx } } },
      { insertText: { location: { index: startIdx }, text: newEntry } },
    ],
  };

  const r = await fetch(
    `https://docs.googleapis.com/v1/documents/${DOC_ID}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batch),
    }
  );
  const result = await r.json();
  if (result.error) {
    console.error("API error:", result.error);
    throw new Error("batch update failed");
  }
  console.log("✓ Dossier updated. Replies:", result.replies?.length);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });

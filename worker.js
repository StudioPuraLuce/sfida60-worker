// ─── Sfida 60 Giorni — Motivatore Worker ─────────────────────────────────────
// Cloudflare Worker con:
// - Cron 06:00 e 21:00 (Europe/Rome)
// - KV read/write per dati sfida
// - Claude API per messaggi personalizzati
// - Telegram per delivery
// - Endpoint REST per sync da app

const TELEGRAM_TOKEN = "8608660431:AAHoHGyyMYQmJh_EOmh5-BCgW9-HG44uhmw";
const CHAT_ID = "5283084625";
const START_DATE = new Date("2025-05-02T00:00:00Z");
const TOTAL_DAYS = 60;

const SCHEDULE = [
  { id: "sveglia",    label: "Sveglia 06:00",      block: "mattina" },
  { id: "flessioni",  label: "Flessioni",           block: "mattina" },
  { id: "preghiere",  label: "Preghiere",           block: "mattina" },
  { id: "caffe",      label: "Caffè",               block: "mattina" },
  { id: "corda",      label: "Corda",               block: "mattina" },
  { id: "addominali", label: "Addominali",          block: "mattina" },
  { id: "ballo",      label: "Ballo, Pronto!",      block: "mattina" },
  { id: "autobus",    label: "Autobus 07:00",       block: "logistica" },
  { id: "messa",      label: "Messa 07:30",         block: "logistica" },
  { id: "colazione",  label: "Colazione 08:00",     block: "logistica" },
  { id: "lavoro",     label: "Biblioteca / Lavoro", block: "logistica" },
  { id: "pranzo",     label: "Pranzo 15:00",        block: "pomeriggio" },
  { id: "attivita",   label: "Attività",            block: "pomeriggio" },
  { id: "cena",       label: "Cena 20:30",          block: "sera" },
  { id: "noscreen",   label: "No Screen",           block: "sera" },
  { id: "compieta",   label: "Compieta",            block: "sera" },
  { id: "letto",      label: "Letto 21:30",         block: "sera" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayIndex() {
  const now = new Date();
  const s = new Date(START_DATE);
  s.setHours(0,0,0,0);
  const d = new Date(now);
  d.setHours(0,0,0,0);
  return Math.floor((d - s) / 86400000);
}

function formatDay(idx) {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + idx);
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

function pctOf(dayData) {
  if (!dayData?.items) return 0;
  const done = SCHEDULE.filter(s => dayData.items[s.id]).length;
  return Math.round(done / SCHEDULE.length * 100);
}

function totalDone(allData) {
  let count = 0;
  for (let i = 0; i < TOTAL_DAYS; i++) {
    if (pctOf(allData[`day_${i}`]) === 100) count++;
  }
  return count;
}

// ─── Telegram ─────────────────────────────────────────────────────────────────

async function sendTelegram(text) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "Markdown",
    }),
  });
}

// ─── Claude ──────────────────────────────────────────────────────────────────

async function askClaude(env, prompt, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const d = await res.json();
  return d.content?.[0]?.text || "";
}

// ─── Morning message ──────────────────────────────────────────────────────────

async function sendMorningMessage(env) {
  const idx = getDayIndex();
  if (idx < 0 || idx >= TOTAL_DAYS) return;

  const raw = await env.KV.get("sfida60_data");
  const allData = raw ? JSON.parse(raw) : {};
  const done = totalDone(allData);
  const yesterday = allData[`day_${idx - 1}`];
  const yesterdayPct = idx > 0 ? pctOf(yesterday) : null;

  const system = `Sei il Coach della Sfida 60 Giorni di Chris — Decompressione Cervello.
Tono: diretto, monastico, asciutto. Zero banalità. Max 120 parole.
Schema: Boot 06:00 (flessioni, preghiere, caffè, corda, addominali, ballo), Messa 07:30, Lavoro 09-14, Attività pomeriggio, No screen dopo cena, Compieta, Letto 21:30.
Contesto: Fourth Way, cattolicesimo esicasta, presenza, lavoro su sé.
Formato Telegram: usa *grassetto* per parole chiave, niente liste lunghe.`;

  const prompt = `Messaggio di BUONGIORNO per Chris.
Giorno: ${idx + 1}/60 — ${formatDay(idx)}
Giorni completi finora: ${done}/${idx}
${yesterdayPct !== null ? `Ieri: ${yesterdayPct}% completato` : "Primo giorno della sfida"}
Scrivi un messaggio motivazionale breve per iniziare la giornata. Fa' riferimento allo schema del Boot e alla Messa. Termina con una domanda o sfida concreta per oggi.`;

  const msg = await askClaude(env, prompt, system);
  await sendTelegram(`*✦ Giorno ${idx + 1}/60 — Buongiorno*\n\n${msg}`);
}

// ─── Evening message ──────────────────────────────────────────────────────────

async function sendEveningMessage(env) {
  const idx = getDayIndex();
  if (idx < 0 || idx >= TOTAL_DAYS) return;

  const raw = await env.KV.get("sfida60_data");
  const allData = raw ? JSON.parse(raw) : {};
  const dayData = allData[`day_${idx}`] || {};
  const pct = pctOf(dayData);
  const done = totalDone(allData);

  const completedItems = SCHEDULE.filter(s => dayData.items?.[s.id]).map(s => s.label);
  const missedItems = SCHEDULE.filter(s => !dayData.items?.[s.id]).map(s => s.label);

  const system = `Sei il Coach della Sfida 60 Giorni di Chris.
Tono: onesto, diretto, a volte duro. Come un abate che fa l'esame di coscienza con un monaco.
Max 130 parole. Formato Telegram con *grassetto*.
Non lodare eccessivamente. Se il giorno è stato scarso, dillo chiaramente.`;

  const prompt = `Messaggio di BUONASERA / esame di coscienza per Chris.
Giorno ${idx + 1}/60 — ${formatDay(idx)}
Completamento: ${pct}%
Completati: ${completedItems.join(", ") || "nessuno"}
Mancanti: ${missedItems.join(", ") || "nessuno"}
Attività pomeriggio: ${dayData.activity || "non registrata"}
Note: ${dayData.note || "nessuna"}
Giorni completi totali: ${done}

Fai un esame di coscienza breve e onesto. Chiudi con un'intenzione concreta per domani mattina.`;

  const msg = await askClaude(env, prompt, system);
  await sendTelegram(`*✦ Giorno ${idx + 1} — Esame di Coscienza*\n\n${msg}`);
}

// ─── HTTP Handler (sync da app) ───────────────────────────────────────────────

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "*";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // POST /sync — app salva dati su KV
  if (request.method === "POST" && url.pathname === "/sync") {
    const body = await request.json();
    await env.KV.put("sfida60_data", JSON.stringify(body));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // GET /data — app legge dati da KV
  if (request.method === "GET" && url.pathname === "/data") {
    const raw = await env.KV.get("sfida60_data");
    return new Response(raw || "{}", {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // GET /ping — test
  if (url.pathname === "/ping") {
    return new Response(JSON.stringify({ ok: true, day: getDayIndex() + 1 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // POST /test-morning — trigger manuale
  if (request.method === "POST" && url.pathname === "/test-morning") {
    await sendMorningMessage(env);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // POST /test-evening
  if (request.method === "POST" && url.pathname === "/test-evening") {
    await sendEveningMessage(env);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response("Sfida 60 — Worker attivo", { headers: corsHeaders });
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },

  async scheduled(event, env, ctx) {
    const hour = new Date().toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      hour12: false,
    });

    if (event.cron === "0 4 * * *") {
      // 06:00 Rome = 04:00 UTC
      await sendMorningMessage(env);
    } else if (event.cron === "0 19 * * *") {
      // 21:00 Rome = 19:00 UTC
      await sendEveningMessage(env);
    }
  },
};

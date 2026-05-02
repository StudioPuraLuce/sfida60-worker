// ─── Sfida 60 Giorni — Motivatore Worker ─────────────────────────────────────
// Cloudflare Worker · Gemini Flash · Telegram · KV sync

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
  const d = new Date(); d.setHours(0,0,0,0);
  const s = new Date(START_DATE); s.setHours(0,0,0,0);
  return Math.floor((d - s) / 86400000);
}

function formatDay(idx) {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + idx);
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

function pctOf(dayData) {
  if (!dayData?.items) return 0;
  return Math.round(SCHEDULE.filter(s => dayData.items[s.id]).length / SCHEDULE.length * 100);
}

function totalDone(allData) {
  let n = 0;
  for (let i = 0; i < TOTAL_DAYS; i++) if (pctOf(allData[`day_${i}`]) === 100) n++;
  return n;
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

async function askGemini(apiKey, systemPrompt, userPrompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { maxOutputTokens: 400, temperature: 0.85 },
      }),
    }
  );
  const d = await res.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text || "…";
}

// ─── Telegram ─────────────────────────────────────────────────────────────────

async function sendTelegram(token, chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

// ─── Morning ──────────────────────────────────────────────────────────────────

async function sendMorning(env) {
  const idx = getDayIndex();
  if (idx < 0 || idx >= TOTAL_DAYS) return;

  const raw = await env.KV.get("sfida60_data");
  const all = raw ? JSON.parse(raw) : {};
  const yesterdayPct = idx > 0 ? pctOf(all[`day_${idx-1}`]) : null;
  const done = totalDone(all);

  const system = `Sei il Coach della Sfida 60 Giorni di Chris — Decompressione Cervello.
Tono: diretto, monastico, asciutto. Zero banalità motivazionali da palestra.
Max 120 parole. Formato Telegram: usa *grassetto* per parole chiave.
Contesto spirituale: Fourth Way, cattolicesimo, presenza, lavoro su sé.
Schema giornata: Boot 06:00 (flessioni, preghiere, caffè, corda, addominali, ballo), Messa 07:30, Lavoro 09-14, Attività pomeriggio, No screen dopo cena, Compieta, Letto 21:30.`;

  const prompt = `Messaggio di BUONGIORNO per Chris.
Giorno: ${idx+1}/60 — ${formatDay(idx)}
Giorni completi finora: ${done}/${Math.max(idx,1)}
${yesterdayPct !== null ? `Ieri: ${yesterdayPct}% completato` : "Primo giorno della sfida."}
Scrivi un messaggio breve per iniziare. Fa' riferimento al Boot e alla Messa. Chiudi con una sfida concreta per oggi.`;

  const msg = await askGemini(env.GEMINI_API_KEY, system, prompt);
  await sendTelegram(env.TELEGRAM_TOKEN, env.CHAT_ID, `*✦ Giorno ${idx+1}/60 — Buongiorno, Chris*\n\n${msg}`);
}

// ─── Evening ──────────────────────────────────────────────────────────────────

async function sendEvening(env) {
  const idx = getDayIndex();
  if (idx < 0 || idx >= TOTAL_DAYS) return;

  const raw = await env.KV.get("sfida60_data");
  const all = raw ? JSON.parse(raw) : {};
  const dayData = all[`day_${idx}`] || {};
  const pct = pctOf(dayData);
  const done = totalDone(all);
  const completed = SCHEDULE.filter(s => dayData.items?.[s.id]).map(s => s.label);
  const missed = SCHEDULE.filter(s => !dayData.items?.[s.id]).map(s => s.label);

  const system = `Sei il Coach della Sfida 60 Giorni di Chris.
Tono: onesto, diretto, a volte duro. Come un abate che fa l'esame di coscienza.
Max 130 parole. Formato Telegram con *grassetto*.
Non lodare se il giorno è stato mediocre. Di' la verità.`;

  const prompt = `Esame di coscienza serale per Chris.
Giorno ${idx+1}/60 — ${formatDay(idx)}
Completamento: ${pct}%
Completati: ${completed.join(", ") || "nessuno"}
Mancanti: ${missed.join(", ") || "nessuno"}
Attività pomeriggio: ${dayData.activity || "non registrata"}
Note: ${dayData.note || "nessuna"}
Giorni completi totali: ${done}
Chiudi con un'intenzione concreta per domani mattina.`;

  const msg = await askGemini(env.GEMINI_API_KEY, system, prompt);
  await sendTelegram(env.TELEGRAM_TOKEN, env.CHAT_ID, `*✦ Giorno ${idx+1} — Esame di Coscienza*\n\n${msg}`);
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") return new Response(null, { headers: cors });

  if (request.method === "POST" && url.pathname === "/sync") {
    const body = await request.json();
    await env.KV.put("sfida60_data", JSON.stringify(body));
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  }

  if (request.method === "GET" && url.pathname === "/data") {
    const raw = await env.KV.get("sfida60_data");
    return new Response(raw || "{}", { headers: { ...cors, "Content-Type": "application/json" } });
  }

  if (url.pathname === "/ping") {
    return new Response(JSON.stringify({ ok: true, day: getDayIndex()+1, total: TOTAL_DAYS }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }

  if (request.method === "POST" && url.pathname === "/test-morning") {
    await sendMorning(env);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  }

  if (request.method === "POST" && url.pathname === "/test-evening") {
    await sendEvening(env);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  }

  return new Response("✦ Sfida60 Worker attivo", { headers: cors });
}

// ─── Entry ────────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },

  async scheduled(event, env) {
    if (event.cron === "0 4 * * *") await sendMorning(env);
    if (event.cron === "0 19 * * *") await sendEvening(env);
  },
};

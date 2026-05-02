// ═══════════════════════════════════════════════════════════════════════
// MARCO — Sfida 60 Giorni · Coach Bot
// Cloudflare Worker · Gemini Flash · Telegram · Google Workspace
// ═══════════════════════════════════════════════════════════════════════

const START_DATE = new Date("2026-05-04T00:00:00Z");
const TOTAL_DAYS = 60;
const CHAT_ID = "5283084625";

const SCHEDULE = [
  { id: "sveglia",    label: "Sveglia 06:00",      emoji: "⏰", block: "mattina" },
  { id: "flessioni",  label: "Flessioni",           emoji: "💪", block: "mattina" },
  { id: "preghiere",  label: "Preghiere",           emoji: "🙏", block: "mattina" },
  { id: "caffe",      label: "Caffè",               emoji: "☕", block: "mattina" },
  { id: "corda",      label: "Corda",               emoji: "🪢", block: "mattina" },
  { id: "addominali", label: "Addominali",          emoji: "🔥", block: "mattina" },
  { id: "ballo",      label: "Ballo, Pronto!",      emoji: "🕺", block: "mattina" },
  { id: "autobus",    label: "Autobus 07:00",       emoji: "🚌", block: "logistica" },
  { id: "messa",      label: "Messa 07:30",         emoji: "⛪", block: "logistica" },
  { id: "colazione",  label: "Colazione 08:00",     emoji: "🥐", block: "logistica" },
  { id: "lavoro",     label: "Biblioteca / Lavoro", emoji: "📚", block: "logistica" },
  { id: "pranzo",     label: "Pranzo 15:00",        emoji: "🥗", block: "pomeriggio" },
  { id: "attivita",   label: "Attività",            emoji: "🌊", block: "pomeriggio" },
  { id: "cena",       label: "Cena 20:30",          emoji: "🍎", block: "sera" },
  { id: "noscreen",   label: "No Screen",           emoji: "🚫", block: "sera" },
  { id: "compieta",   label: "Compieta",            emoji: "🙏", block: "sera" },
  { id: "letto",      label: "Letto 21:30",         emoji: "😴", block: "sera" },
];

const ITEM_ALIASES = {
  sveglia:    ["sveglia", "alzato", "alzata", "wake"],
  flessioni:  ["flessioni", "push", "piegamenti", "pompe"],
  preghiere:  ["preghiere", "preghiera", "rosario", "laudi", "ufficio"],
  caffe:      ["caffè", "caffe", "coffee"],
  corda:      ["corda", "salto", "saltello"],
  addominali: ["addominali", "abs", "core", "addominale"],
  ballo:      ["ballo", "danza", "pronto"],
  autobus:    ["autobus", "bus"],
  messa:      ["messa", "liturgia", "eucaristia"],
  colazione:  ["colazione"],
  lavoro:     ["lavoro", "biblioteca", "studio", "turno", "libreria"],
  pranzo:     ["pranzo"],
  attivita:   ["palestra", "mare", "chiesa", "chiese", "flair", "musica", "riposo", "attività", "attivita", "pomeriggio"],
  cena:       ["cena"],
  noscreen:   ["noscreen", "no screen", "schermo spento", "telefono off"],
  compieta:   ["compieta", "vespri", "preghiera sera"],
  letto:      ["letto", "dormito", "dormo", "notte", "a letto"],
};

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

function getDayIndex() {
  const d = new Date(); d.setHours(0,0,0,0);
  const s = new Date(START_DATE); s.setHours(0,0,0,0);
  return Math.floor((d - s) / 86400000);
}

function formatDay(idx, long = false) {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + idx);
  return d.toLocaleDateString("it-IT", {
    weekday: long ? "long" : "short",
    day: "numeric",
    month: long ? "long" : "short",
  });
}

function dateISO(idx) {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + idx);
  return d.toISOString().split("T")[0];
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

function weekAvg(allData, idx) {
  const days = [];
  for (let i = Math.max(0, idx - 6); i <= idx; i++) days.push(pctOf(allData[`day_${i}`]));
  return days.length ? Math.round(days.reduce((a,b) => a+b,0) / days.length) : 0;
}

function findItemId(text) {
  const t = text.toLowerCase();
  for (const [id, aliases] of Object.entries(ITEM_ALIASES)) {
    if (aliases.some(a => t.includes(a))) return id;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// GEMINI
// ═══════════════════════════════════════════════════════════════════════

async function askGemini(apiKey, system, prompt, maxTokens = 400) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.85 },
      }),
    }
  );
  const d = await res.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "…";
}

// ═══════════════════════════════════════════════════════════════════════
// TELEGRAM
// ═══════════════════════════════════════════════════════════════════════

async function tg(token, text, extra = {}) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "Markdown", ...extra }),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE WORKSPACE
// ═══════════════════════════════════════════════════════════════════════

async function getGoogleToken(env) {
  const raw = await env.KV.get("google_oauth_token");
  if (!raw) return null;
  const token = JSON.parse(raw);
  if (token.expires_at && Date.now() < token.expires_at - 60000) return token.access_token;
  if (!token.refresh_token || !env.GOOGLE_CLIENT_ID) return token.access_token || null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: token.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const newToken = await res.json();
  if (newToken.access_token) {
    const updated = { ...token, access_token: newToken.access_token, expires_at: Date.now() + newToken.expires_in * 1000 };
    await env.KV.put("google_oauth_token", JSON.stringify(updated));
    return updated.access_token;
  }
  return null;
}

async function getCalendarEvents(env, dateStr) {
  const token = await getGoogleToken(env);
  if (!token) return [];
  const tMin = encodeURIComponent(`${dateStr}T00:00:00+02:00`);
  const tMax = encodeURIComponent(`${dateStr}T23:59:59+02:00`);
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${tMin}&timeMax=${tMax}&singleEvents=true&orderBy=startTime`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const d = await res.json();
  return (d.items || []).map(e => ({
    title: e.summary || "—",
    start: e.start?.dateTime?.split("T")[1]?.slice(0,5) || e.start?.date || "",
  }));
}

async function createCalendarEvent(env, { title, date, startTime, endTime, description = "" }) {
  const token = await getGoogleToken(env);
  if (!token) return null;
  await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: title, description,
      start: { dateTime: `${date}T${startTime}:00`, timeZone: "Europe/Rome" },
      end: { dateTime: `${date}T${endTime}:00`, timeZone: "Europe/Rome" },
    }),
  });
}

async function appendToSheet(env, values) {
  const sheetId = await env.KV.get("sfida60_sheets_id");
  if (!sheetId) return;
  const token = await getGoogleToken(env);
  if (!token) return;
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Log!A:Z:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [values] }),
    }
  );
}

async function createGmailDraft(env, { subject, body }) {
  const token = await getGoogleToken(env);
  if (!token) return;
  const email = [`To: me`, `Subject: ${subject}`, `Content-Type: text/plain; charset=utf-8`, ``, body].join("\n");
  const encoded = btoa(unescape(encodeURIComponent(email))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: { raw: encoded } }),
  });
}

// ═══════════════════════════════════════════════════════════════════════
// MARCO PERSONA
// ═══════════════════════════════════════════════════════════════════════

function marcoSystem(ctx = "") {
  return `Sei Marco, coach personale di Chris per la Sfida 60 Giorni — Decompressione Cervello.

PERSONALITÀ:
Ex consultant McKinsey, PM senior. Diretto, dati-driven, aspettative alte, zero tolleranza scuse.
Conosce Fourth Way, cattolicesimo, Messa, Compieta — non come hobby, come standard di vita.
Non è crudele: è esigente. Frasi corte. Mai banalità motivazionali. Memoria elefantina.
Usa il tu. Italiano. Cita dati e pattern quando pertinenti.

SCHEMA SFIDA (4 Maggio – 2 Luglio 2026):
Boot 06:00: sveglia, flessioni, preghiere, caffè, corda, addominali, ballo
Logistica: autobus 07:00, messa 07:30, colazione 08:00, lavoro 09-14
Pomeriggio: pranzo 15:00, attività (palestra/mare/chiese/flair+musica)
Sera: cena 20:30, no screen, compieta, letto 21:30

TAG VITA: PALESTRA · MOGLIE · VITA · RIPOSO · PRATICA

REGOLE:
- Max 150 parole per messaggio
- Domande: una alla volta, concreta
- Chiude sempre con azione o domanda — mai riflessione vaga
- Se i dati sono scarsi: lo dice chiaramente
${ctx ? `\nCONTESTO:\n${ctx}` : ""}`;
}

// ═══════════════════════════════════════════════════════════════════════
// KV STATE
// ═══════════════════════════════════════════════════════════════════════

async function getState(env) {
  const raw = await env.KV.get("sfida60_state");
  return raw ? JSON.parse(raw) : { step: null, lastDay: -1, context: {} };
}
async function setState(env, s) { await env.KV.put("sfida60_state", JSON.stringify(s)); }
async function getData(env) { const r = await env.KV.get("sfida60_data"); return r ? JSON.parse(r) : {}; }
async function setData(env, d) { await env.KV.put("sfida60_data", JSON.stringify(d)); }
async function getConv(env, i) { const r = await env.KV.get(`sfida60_conv_${i}`); return r ? JSON.parse(r) : { morning: {}, evening: {} }; }
async function setConv(env, i, c) { await env.KV.put(`sfida60_conv_${i}`, JSON.stringify(c)); }

// ═══════════════════════════════════════════════════════════════════════
// MORNING SESSION
// ═══════════════════════════════════════════════════════════════════════

async function startMorning(env) {
  const idx = getDayIndex();
  if (idx < 0 || idx >= TOTAL_DAYS) return;

  const all = await getData(env);
  const yesterdayPct = idx > 0 ? pctOf(all[`day_${idx-1}`]) : null;
  const prevConv = idx > 0 ? await getConv(env, idx-1) : null;
  const lastIntenzione = prevConv?.evening?.a3 || null;

  // Calendar
  const events = await getCalendarEvents(env, dateISO(idx));
  const calSummary = events.length ? events.map(e => `${e.start} ${e.title}`).join(" · ") : "agenda libera";

  // Create Boot + Compieta if missing
  const hasBoot = events.some(e => e.title?.toLowerCase().includes("boot") || e.title?.toLowerCase().includes("sfida60"));
  if (!hasBoot) {
    await createCalendarEvent(env, { title: `⏰ Boot Sfida60 — G${idx+1}`, date: dateISO(idx), startTime: "06:00", endTime: "06:45", description: "Flessioni · preghiere · caffè · corda · addominali · ballo" });
    await createCalendarEvent(env, { title: "🙏 Compieta", date: dateISO(idx), startTime: "20:45", endTime: "21:00" });
  }

  const ctx = `Giorno ${idx+1}/60 — ${formatDay(idx, true)}
Ieri: ${yesterdayPct !== null ? yesterdayPct + "%" : "primo giorno"}
${lastIntenzione ? `Intenzione ieri sera: "${lastIntenzione}"` : ""}
Media settimana: ${weekAvg(all, Math.max(0,idx-1))}%
Giorni completi: ${totalDone(all)}
Agenda oggi: ${calSummary}`;

  const msg = await askGemini(
    env.GEMINI_API_KEY, marcoSystem(ctx),
    `Briefing mattutino per Chris. Commenta ieri (${yesterdayPct !== null ? yesterdayPct+"%" : "primo giorno"}). Fai riferimento al calendario se pertinente. Poi fai la PRIMA DOMANDA in modo contestuale: qual è il risultato NON NEGOZIABILE di oggi? Max 90 parole.`,
    280
  );

  await tg(env.TELEGRAM_TOKEN, `*☀️ Giorno ${idx+1}/60 — ${formatDay(idx, true)}*\n\n${msg}`);
  await setState(env, { step: "morning_q1", lastDay: idx, context: { calSummary, yesterdayPct } });
}

async function handleMorningAnswer(env, step, answer, idx) {
  const state = await getState(env);
  const conv = await getConv(env, idx);

  if (step === "morning_q1") {
    conv.morning.a1 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY, marcoSystem(),
      `Chris: risultato non negoziabile oggi = "${answer}". ACK 10 parole max. Poi chiedi: "Cosa rischia di farti uscire dallo schema oggi?"`, 120);
    await tg(env.TELEGRAM_TOKEN, ack);
    await setConv(env, idx, conv);
    await setState(env, { ...state, step: "morning_q2" });

  } else if (step === "morning_q2") {
    conv.morning.a2 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY, marcoSystem(),
      `Chris ha identificato come rischio: "${answer}". ACK 10 parole. Poi chiedi: "Energia fisica stamattina, da 1 a 5."`, 100);
    await tg(env.TELEGRAM_TOKEN, ack);
    await setConv(env, idx, conv);
    await setState(env, { ...state, step: "morning_q3" });

  } else if (step === "morning_q3") {
    conv.morning.a3 = answer;
    conv.morning.energy = answer.match(/[1-5]/)?.[0] || "?";

    const ctx = `Obiettivo: ${conv.morning.a1} | Rischio: ${conv.morning.a2} | Energia: ${conv.morning.energy}/5 | Agenda: ${state.context?.calSummary}`;
    const briefing = await askGemini(
      env.GEMINI_API_KEY, marcoSystem(ctx),
      `Briefing finale. Schema del giorno + 1 cosa su cui concentrarsi legata all'obiettivo dichiarato. Chiudi con "Vai." o simile. Max 100 parole.`, 300);

    await tg(env.TELEGRAM_TOKEN, `*✦ Briefing G${idx+1}*\n\n${briefing}`);

    // Log to Sheets
    const all = await getData(env);
    await appendToSheet(env, [dateISO(idx), `G${idx+1}`, "morning", conv.morning.a1, conv.morning.a2, conv.morning.energy, "", "", "", pctOf(all[`day_${idx}`])]);

    await setConv(env, idx, conv);
    await setState(env, { ...state, step: "morning_done" });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EVENING SESSION
// ═══════════════════════════════════════════════════════════════════════

async function startEvening(env) {
  const idx = getDayIndex();
  if (idx < 0 || idx >= TOTAL_DAYS) return;

  const all = await getData(env);
  const dayData = all[`day_${idx}`] || {};
  const pct = pctOf(dayData);
  const conv = await getConv(env, idx);
  const goal = conv.morning?.a1 || null;
  const missed = SCHEDULE.filter(s => !dayData.items?.[s.id]).map(s => s.label);

  const ctx = `Giorno ${idx+1}/60 — ${pct}% completato
Obiettivo mattina: ${goal || "non dichiarato"}
Mancanti: ${missed.join(", ") || "nessuno"}
Attività: ${dayData.activity || "—"}
Media settimana: ${weekAvg(all, idx)}%`;

  const msg = await askGemini(
    env.GEMINI_API_KEY, marcoSystem(ctx),
    `Apertura serale. ${pct}% oggi. ${goal ? `Obiettivo dichiarato stamattina: "${goal}".` : ""} Commenta in 2 righe (onesto, non condiscendente). Poi chiedi: l'obiettivo di stamattina — fatto o non fatto? Max 80 parole.`, 250);

  await tg(env.TELEGRAM_TOKEN, `*🌙 Giorno ${idx+1} — Check serale*\n\n${msg}`);
  await setState(env, { step: "evening_q1", lastDay: idx, context: { pct, goal, missed: missed.join(", ") } });
}

async function handleEveningAnswer(env, step, answer, idx) {
  const state = await getState(env);
  const conv = await getConv(env, idx);

  if (step === "evening_q1") {
    conv.evening.a1 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY, marcoSystem(),
      `Chris ha risposto se ha raggiunto il suo obiettivo: "${answer}". ACK onesto 15 parole. Poi chiedi: "Cosa ti ha fatto uscire dallo schema oggi? Sii specifico."`, 150);
    await tg(env.TELEGRAM_TOKEN, ack);
    await setConv(env, idx, conv);
    await setState(env, { ...state, step: "evening_q2" });

  } else if (step === "evening_q2") {
    conv.evening.a2 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY, marcoSystem(),
      `Chris sulla deviazione: "${answer}". ACK 10 parole. Poi chiedi: "Cosa prepari *stasera* per non fallire il Boot di domani?"`, 120);
    await tg(env.TELEGRAM_TOKEN, ack);
    await setConv(env, idx, conv);
    await setState(env, { ...state, step: "evening_q3" });

  } else if (step === "evening_q3") {
    conv.evening.a3 = answer;
    const all = await getData(env);

    const ctx = `Oggi: ${state.context?.pct}% | Obiettivo raggiunto: ${conv.evening.a1} | Deviazione: ${conv.evening.a2} | Prep domani: ${answer} | Mancanti: ${state.context?.missed} | Media settimana: ${weekAvg(all, idx)}%`;
    const analysis = await askGemini(
      env.GEMINI_API_KEY, marcoSystem(ctx),
      `Esame di coscienza finale. Dati alla mano. Se c'è un pattern questa settimana, nominalo. Chiudi con UN'intenzione concreta per il Boot di domani — non generica. Max 130 parole.`, 380);

    await tg(env.TELEGRAM_TOKEN, `*✦ Analisi G${idx+1}*\n\n${analysis}`);

    // Log Sheets
    await appendToSheet(env, [dateISO(idx), `G${idx+1}`, "evening", conv.evening.a1, conv.evening.a2, conv.evening.a3, "", "", "", state.context?.pct]);

    // Friday → weekly report
    const dow = new Date().toLocaleDateString("it-IT", { weekday: "long", timeZone: "Europe/Rome" });
    if (dow === "venerdì") await sendWeeklyReport(env, idx, all);

    // Alert if 2+ days under 50%
    let lowDays = 0;
    for (let i = Math.max(0, idx-1); i <= idx; i++) if (pctOf(all[`day_${i}`]) < 50) lowDays++;
    if (lowDays >= 2) {
      await createGmailDraft(env, {
        subject: `⚠️ Sfida60 — Alert: ${lowDays} giorni sotto 50%`,
        body: `Marco ha rilevato ${lowDays} giorni consecutivi sotto il 50% di completamento.\n\nGiorno ${idx+1}: ${state.context?.pct}%\nGiorno ${idx}: ${pctOf(all[`day_${idx-1}`])}%\n\nIntervento necessario.`,
      });
    }

    await setConv(env, idx, conv);
    await setState(env, { ...state, step: "evening_done" });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// WEEKLY REPORT
// ═══════════════════════════════════════════════════════════════════════

async function sendWeeklyReport(env, idx, all) {
  const start = Math.max(0, idx - 6);
  const week = Array.from({ length: idx - start + 1 }, (_, i) => ({
    day: start + i + 1, pct: pctOf(all[`day_${start+i}`]), date: formatDay(start + i),
  }));
  const avg = Math.round(week.reduce((a,b) => a + b.pct, 0) / week.length);
  const perfect = week.filter(d => d.pct === 100).length;

  const analysis = await askGemini(
    env.GEMINI_API_KEY, marcoSystem(),
    `Report settimanale G${start+1}-${idx+1}:\n${week.map(d => `G${d.day} (${d.date}): ${d.pct}%`).join("\n")}\nMedia: ${avg}% · Perfetti: ${perfect}/7\nTotale completi sfida: ${totalDone(all)}/60\n\nAnalisi: trend, punto di forza, punto critico, obiettivo settimana prossima. Max 180 parole.`, 500);

  await tg(env.TELEGRAM_TOKEN, `*📊 Report Settimana — G${start+1}→${idx+1}*\nMedia: *${avg}%* · Perfetti: *${perfect}/7*\n\n${analysis}`);

  await createGmailDraft(env, {
    subject: `Sfida60 · Report W${Math.ceil(idx/7)} · Media ${avg}%`,
    body: `REPORT SETTIMANALE — Sfida 60 Giorni\nSettimana G${start+1}-${idx+1}\n\n${analysis}\n\nDATA:\n${week.map(d => `G${d.day} (${d.date}): ${d.pct}%`).join("\n")}\n\nMedia: ${avg}% | Perfetti: ${perfect}/7 | Totale: ${totalDone(all)}/60`,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════

async function handleCommand(env, cmd, args, idx) {
  const all = await getData(env);
  const dayData = all[`day_${idx}`] || {};

  if (cmd === "start") {
    const msg = await askGemini(env.GEMINI_API_KEY, marcoSystem(),
      `Chris ha avviato il bot. Presentati come Marco. Brevissimo (70 parole max). Comunica le aspettative. Tre domande ogni mattina, tre ogni sera. Niente sconti.`, 200);
    await tg(env.TELEGRAM_TOKEN, `${msg}\n\n*Comandi:*\n/oggi · /check · /skip · /nota · /attivita · /stato · /agenda · /calendario · /report · /sync · /silenzio · /aiuto`);
  }

  else if (cmd === "aiuto" || cmd === "help") {
    await tg(env.TELEGRAM_TOKEN,
      `*Marco — Comandi*\n\n/oggi — stato giorno corrente\n/check [item] — segna completato\n/skip [item] — segna saltato\n/nota [testo] — aggiungi nota\n/attivita [tag] — setta attività pomeriggio\n/stato — dashboard + trend\n/agenda — Google Calendar oggi\n/calendario — prossimi 7 giorni\n/report — report settimanale → Gmail\n/sync — sync Google Workspace\n/silenzio [ore] — pausa notifiche\n\n_Scrivi liberamente: Marco risponde e registra._`);
  }

  else if (cmd === "oggi") {
    const pct = pctOf(dayData);
    const done = SCHEDULE.filter(s => dayData.items?.[s.id]);
    const miss = SCHEDULE.filter(s => !dayData.items?.[s.id]);
    await tg(env.TELEGRAM_TOKEN,
      `*G${idx+1}/60 — ${formatDay(idx, true)}*\n\n*${pct}% completato*\n\n✅ ${done.map(s=>s.emoji+s.label).join(" · ") || "—"}\n❌ ${miss.map(s=>s.label).join(", ") || "—"}\n\nAttività: ${dayData.activity||"—"}\nNote: ${dayData.note||"—"}`);
  }

  else if (cmd === "stato") {
    const pct = pctOf(dayData);
    const avg = weekAvg(all, idx);
    const total = totalDone(all);
    const ctx = `G${idx+1}: ${pct}% | Media settimana: ${avg}% | Giorni completi: ${total}/${idx+1}`;
    const comment = await askGemini(env.GEMINI_API_KEY, marcoSystem(),
      `Dashboard Chris. ${ctx}. Commento in 3 righe: trend, punto critico, azione immediata. Dati alla mano.`, 180);
    await tg(env.TELEGRAM_TOKEN, `*📊 Stato G${idx+1}/60*\n\nOggi: *${pct}%* · Settimana: *${avg}%* · Completi: *${total}/${idx+1}*\n\n${comment}`);
  }

  else if (cmd === "check") {
    const itemId = findItemId(args.join(" "));
    if (!itemId) { await tg(env.TELEGRAM_TOKEN, `Non riconosco "${args.join(" ")}". Es: /check flessioni`); return; }
    const item = SCHEDULE.find(s => s.id === itemId);
    if (!all[`day_${idx}`]) all[`day_${idx}`] = { items: {} };
    if (!all[`day_${idx}`].items) all[`day_${idx}`].items = {};
    all[`day_${idx}`].items[itemId] = true;
    await setData(env, all);
    await tg(env.TELEGRAM_TOKEN, `${item.emoji} *${item.label}* ✓ — ${pctOf(all[`day_${idx}`])}% oggi.`);
  }

  else if (cmd === "skip") {
    const itemId = findItemId(args.join(" "));
    if (!itemId) { await tg(env.TELEGRAM_TOKEN, `Non riconosco "${args.join(" ")}".`); return; }
    const item = SCHEDULE.find(s => s.id === itemId);
    const ack = await askGemini(env.GEMINI_API_KEY, marcoSystem(), `Chris ha saltato: ${item.label}. Una frase secca. Non consolarlo.`, 60);
    await tg(env.TELEGRAM_TOKEN, `⚠️ *${item.label}* saltato.\n_${ack}_`);
  }

  else if (cmd === "nota") {
    const note = args.join(" ");
    if (!all[`day_${idx}`]) all[`day_${idx}`] = {};
    all[`day_${idx}`].note = note;
    await setData(env, all);
    await tg(env.TELEGRAM_TOKEN, `📝 Nota salvata.`);
  }

  else if (cmd === "attivita") {
    const tag = args.join(" ");
    if (!all[`day_${idx}`]) all[`day_${idx}`] = {};
    all[`day_${idx}`].activity = tag;
    await setData(env, all);
    await tg(env.TELEGRAM_TOKEN, `🌊 *${tag}* — registrata.`);
  }

  else if (cmd === "agenda") {
    const events = await getCalendarEvents(env, dateISO(idx));
    if (!events.length) { await tg(env.TELEGRAM_TOKEN, `📅 Agenda libera oggi.`); return; }
    const list = events.map(e => `• *${e.title}* ${e.start}`).join("\n");
    await tg(env.TELEGRAM_TOKEN, `*📅 Agenda ${formatDay(idx, true)}*\n\n${list}`);
  }

  else if (cmd === "calendario") {
    const lines = [];
    for (let i = 0; i < 7 && idx+i < TOTAL_DAYS; i++) {
      const events = await getCalendarEvents(env, dateISO(idx+i));
      const ev = events.length ? events.map(e=>e.title).join(", ") : "libero";
      lines.push(`*G${idx+i+1}* (${formatDay(idx+i)}): ${ev}`);
    }
    await tg(env.TELEGRAM_TOKEN, `*📅 Prossimi 7 giorni*\n\n${lines.join("\n")}`);
  }

  else if (cmd === "report") {
    await sendWeeklyReport(env, idx, all);
    await tg(env.TELEGRAM_TOKEN, `📊 Report inviato su Telegram e salvato come draft in Gmail.`);
  }

  else if (cmd === "sync") {
    await tg(env.TELEGRAM_TOKEN, `🔄 Sync completato. Dati aggiornati su KV.`);
  }

  else if (cmd === "silenzio") {
    const ore = parseInt(args[0]) || 2;
    const until = Date.now() + ore * 3600000;
    await env.KV.put("sfida60_silence_until", until.toString());
    const h = new Date(until).toLocaleTimeString("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" });
    await tg(env.TELEGRAM_TOKEN, `🔇 Silenzio per ${ore}h. Torno alle ${h}.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// FREE TEXT
// ═══════════════════════════════════════════════════════════════════════

async function handleFreeText(env, text, idx) {
  const all = await getData(env);
  const dayData = all[`day_${idx}`] || {};
  const conv = await getConv(env, idx);

  // Auto-detect completed item
  const itemId = findItemId(text);
  const lc = text.toLowerCase();
  const isDone = lc.includes("fatto") || lc.includes("completato") || lc.includes("finito") || lc.includes("ho fatto") || lc.match(/^(ho|l'ho|ce l'ho|sì)/);
  if (itemId && isDone) {
    if (!all[`day_${idx}`]) all[`day_${idx}`] = { items: {} };
    if (!all[`day_${idx}`].items) all[`day_${idx}`].items = {};
    all[`day_${idx}`].items[itemId] = true;
    await setData(env, all);
    const item = SCHEDULE.find(s => s.id === itemId);
    await tg(env.TELEGRAM_TOKEN, `${item.emoji} *${item.label}* registrato. ${pctOf(all[`day_${idx}`])}% oggi.`);
    return;
  }

  const ctx = `G${idx+1}/60: ${pctOf(dayData)}% completato
Completati: ${SCHEDULE.filter(s=>dayData.items?.[s.id]).map(s=>s.label).join(", ")||"—"}
Attività: ${dayData.activity||"—"} | Note: ${dayData.note||"—"}
Media settimana: ${weekAvg(all, idx)}%
Conv mattina: ${JSON.stringify(conv.morning||{})}`;

  const reply = await askGemini(env.GEMINI_API_KEY, marcoSystem(ctx),
    `Chris: "${text}"\nRispondi come Marco. Max 100 parole. Contestuale alla sfida.`, 280);
  await tg(env.TELEGRAM_TOKEN, reply);
}

// ═══════════════════════════════════════════════════════════════════════
// WEBHOOK
// ═══════════════════════════════════════════════════════════════════════

async function handleWebhook(request, env) {
  const body = await request.json();
  const msg = body?.message;
  if (!msg?.text) return new Response("ok");

  const silence = await env.KV.get("sfida60_silence_until");
  if (silence && Date.now() < parseInt(silence)) return new Response("ok");

  const text = msg.text.trim();
  const idx = getDayIndex();
  const state = await getState(env);

  // Conversation flow
  const flowSteps = ["morning_q1","morning_q2","morning_q3","evening_q1","evening_q2","evening_q3"];
  if (flowSteps.includes(state.step) && state.lastDay === idx) {
    if (state.step.startsWith("morning")) await handleMorningAnswer(env, state.step, text, idx);
    else await handleEveningAnswer(env, state.step, text, idx);
    return new Response("ok");
  }

  // Commands
  if (text.startsWith("/")) {
    const parts = text.slice(1).split(" ");
    const cmd = parts[0].toLowerCase().split("@")[0];
    await handleCommand(env, cmd, parts.slice(1), idx);
    return new Response("ok");
  }

  await handleFreeText(env, text, idx);
  return new Response("ok");
}

// ═══════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const json = (d, s=200) => new Response(JSON.stringify(d), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (path === "/webhook" && request.method === "POST") return handleWebhook(request, env);
  if (path === "/ping") return json({ ok: true, day: getDayIndex()+1, total: TOTAL_DAYS });
  if (path === "/data") return new Response(await env.KV.get("sfida60_data") || "{}", { headers: { ...CORS, "Content-Type": "application/json" } });
  if (path === "/sync" && request.method === "POST") { await env.KV.put("sfida60_data", JSON.stringify(await request.json())); return json({ ok: true }); }
  if (path === "/test-morning" && request.method === "POST") { await startMorning(env); return json({ ok: true }); }
  if (path === "/test-evening" && request.method === "POST") { await startEvening(env); return json({ ok: true }); }

  if (path === "/setup-webhook" && request.method === "POST") {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/setWebhook`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `https://sfida60-motivatore.soliwkr.workers.dev/webhook`, allowed_updates: ["message"], drop_pending_updates: true }),
    });
    return json(await res.json());
  }


  // OAuth callback — exchanges code for tokens and saves to KV
  if (path === "/oauth/callback" && request.method === "GET") {
    const code = url.searchParams.get("code");
    if (!code) return new Response("Missing code", { status: 400 });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "https://sfida60-motivatore.soliwkr.workers.dev/oauth/callback",
        grant_type: "authorization_code",
      }),
    });

    const tokens = await res.json();
    if (!tokens.access_token) {
      return new Response(`Errore: ${JSON.stringify(tokens)}`, { status: 400 });
    }

    await env.KV.put("google_oauth_token", JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    }));

    // Confirm on Telegram
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "5283084625",
        text: "✅ *Google Workspace connesso.*\nCalendar, Sheets e Gmail ora attivi per Marco.",
        parse_mode: "Markdown",
      }),
    });

    return new Response(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#080807;color:#D4A84B">
        <h1>✦ Google connesso</h1>
        <p style="color:#E8E0D0">Marco ha accesso a Calendar, Sheets e Gmail.</p>
        <p style="color:#6A6050">Puoi chiudere questa finestra.</p>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } });
  }


  if (path === "/setup-google" && request.method === "POST") {
    await env.KV.put("google_oauth_token", JSON.stringify(await request.json()));
    return json({ ok: true });
  }

  if (path === "/setup-sheets" && request.method === "POST") {
    const { sheetId } = await request.json();
    await env.KV.put("sfida60_sheets_id", sheetId);
    return json({ ok: true });
  }

  return new Response("✦ Marco — Sfida60 Worker", { headers: CORS });
}

// ═══════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

export default {
  async fetch(request, env) { return handleRequest(request, env); },
  async scheduled(event, env) {
    const silence = await env.KV.get("sfida60_silence_until");
    if (silence && Date.now() < parseInt(silence)) return;
    if (event.cron === "5 4 * * *")  await startMorning(env);
    if (event.cron === "5 19 * * *") await startEvening(env);
  },
};

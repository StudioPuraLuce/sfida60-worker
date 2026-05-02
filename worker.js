// ═══════════════════════════════════════════════════════════════════════
// MARCO — Sfida 60 Giorni · Coach Bot v3
// Inline Keyboards · Mini App · Google Workspace · Gemini Flash
// ═══════════════════════════════════════════════════════════════════════

const START_DATE = new Date("2026-05-04T00:00:00Z");
const TOTAL_DAYS = 60;
const CHAT_ID    = "5283084625";
const MINI_APP_URL = "https://sfida60.pages.dev";

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
  { id: "lavoro",     label: "Biblioteca/Lavoro",   emoji: "📚", block: "logistica" },
  { id: "pranzo",     label: "Pranzo 15:00",        emoji: "🥗", block: "pomeriggio" },
  { id: "attivita",   label: "Attività",            emoji: "🌊", block: "pomeriggio" },
  { id: "cena",       label: "Cena 20:30",          emoji: "🍎", block: "sera" },
  { id: "noscreen",   label: "No Screen",           emoji: "🚫", block: "sera" },
  { id: "compieta",   label: "Compieta",            emoji: "🙏", block: "sera" },
  { id: "letto",      label: "Letto 21:30",         emoji: "😴", block: "sera" },
];

const ACTIVITIES = [
  { id: "palestra",  label: "Palestra",      emoji: "🏋️" },
  { id: "mare",      label: "Mare",          emoji: "🌊" },
  { id: "chiese",    label: "Chiese",        emoji: "⛪" },
  { id: "flair",     label: "Flair+Musica",  emoji: "🎸" },
  { id: "riposo",    label: "Riposo",        emoji: "🛌" },
];

const ITEM_ALIASES = {
  sveglia:    ["sveglia","alzato","alzata"],
  flessioni:  ["flessioni","push","piegamenti","pompe"],
  preghiere:  ["preghiere","preghiera","rosario","laudi"],
  caffe:      ["caffè","caffe","coffee"],
  corda:      ["corda","salto"],
  addominali: ["addominali","abs","core"],
  ballo:      ["ballo","danza","pronto"],
  autobus:    ["autobus","bus"],
  messa:      ["messa","liturgia","eucaristia"],
  colazione:  ["colazione"],
  lavoro:     ["lavoro","biblioteca","studio","turno"],
  pranzo:     ["pranzo"],
  attivita:   ["palestra","mare","chiese","flair","musica","riposo","attività"],
  cena:       ["cena"],
  noscreen:   ["noscreen","no screen","schermo spento"],
  compieta:   ["compieta","vespri"],
  letto:      ["letto","dormito","dormo","notte"],
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
    day: "numeric", month: long ? "long" : "short",
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
  for (let i = Math.max(0, idx-6); i <= idx; i++) days.push(pctOf(allData[`day_${i}`]));
  return days.length ? Math.round(days.reduce((a,b)=>a+b,0)/days.length) : 0;
}

function findItemId(text) {
  const t = text.toLowerCase();
  for (const [id, aliases] of Object.entries(ITEM_ALIASES)) {
    if (aliases.some(a => t.includes(a))) return id;
  }
  return null;
}

function progressBar(pct) {
  const filled = Math.round(pct / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled) + ` ${pct}%`;
}

// ═══════════════════════════════════════════════════════════════════════
// KV STATE
// ═══════════════════════════════════════════════════════════════════════

async function getState(env) { const r = await env.KV.get("sfida60_state"); return r ? JSON.parse(r) : { step: null, lastDay: -1, context: {} }; }
async function setState(env, s) { await env.KV.put("sfida60_state", JSON.stringify(s)); }
async function getData(env) { const r = await env.KV.get("sfida60_data"); return r ? JSON.parse(r) : {}; }
async function setData(env, d) { await env.KV.put("sfida60_data", JSON.stringify(d)); }
async function getConv(env, i) { const r = await env.KV.get(`sfida60_conv_${i}`); return r ? JSON.parse(r) : { morning: {}, evening: {} }; }
async function setConv(env, i, c) { await env.KV.put(`sfida60_conv_${i}`, JSON.stringify(c)); }

// ═══════════════════════════════════════════════════════════════════════
// TELEGRAM API
// ═══════════════════════════════════════════════════════════════════════

async function tgCall(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function tg(token, text, keyboard = null, extra = {}) {
  const body = { chat_id: CHAT_ID, text, parse_mode: "Markdown", ...extra };
  if (keyboard) body.reply_markup = { inline_keyboard: keyboard };
  return tgCall(token, "sendMessage", body);
}

async function editMsg(token, messageId, text, keyboard = null) {
  const body = { chat_id: CHAT_ID, message_id: messageId, text, parse_mode: "Markdown" };
  if (keyboard) body.reply_markup = { inline_keyboard: keyboard };
  return tgCall(token, "editMessageText", body);
}

async function answerCallback(token, callbackQueryId, text = "") {
  return tgCall(token, "answerCallbackQuery", { callback_query_id: callbackQueryId, text });
}

async function setBotCommands(token) {
  return tgCall(token, "setMyCommands", {
    commands: [
      { command: "start",    description: "Avvia Marco" },
      { command: "menu",     description: "Menu principale" },
      { command: "oggi",     description: "Stato giorno corrente" },
      { command: "check",    description: "Check-in rapido" },
      { command: "agenda",   description: "Google Calendar oggi" },
      { command: "stato",    description: "Dashboard e trend" },
      { command: "report",   description: "Report settimanale" },
      { command: "silenzio", description: "Pausa notifiche" },
      { command: "aiuto",    description: "Guida comandi" },
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════
// KEYBOARDS
// ═══════════════════════════════════════════════════════════════════════

function mainMenuKeyboard(idx, pct) {
  return [
    [
      { text: "📅 Oggi",      callback_data: "show_oggi" },
      { text: "📊 Stato",     callback_data: "show_stato" },
    ],
    [
      { text: "✅ Check-in",  callback_data: "show_checkin" },
      { text: "📝 Note",      callback_data: "show_note" },
    ],
    [
      { text: "📆 Agenda",    callback_data: "show_agenda" },
      { text: "📋 Report",    callback_data: "show_report" },
    ],
    [
      { text: "🔇 Silenzio",  callback_data: "show_silenzio" },
      { text: "🌐 Tracker",   url: MINI_APP_URL },
    ],
  ];
}

function checkinKeyboard(dayItems) {
  const rows = [];
  // Build 2-per-row grid of schedule items
  for (let i = 0; i < SCHEDULE.length; i += 2) {
    const row = [];
    for (let j = i; j < Math.min(i+2, SCHEDULE.length); j++) {
      const item = SCHEDULE[j];
      const done = !!dayItems[item.id];
      row.push({
        text: `${done ? "✅" : "⬜"} ${item.emoji} ${item.label}`,
        callback_data: `check_${item.id}`,
      });
    }
    rows.push(row);
  }
  rows.push([
    { text: "✓ Fatto tutto", callback_data: "check_all" },
    { text: "← Menu",        callback_data: "show_menu" },
  ]);
  return rows;
}

function activityKeyboard() {
  return [
    ACTIVITIES.slice(0,2).map(a => ({ text: `${a.emoji} ${a.label}`, callback_data: `activity_${a.id}` })),
    ACTIVITIES.slice(2,4).map(a => ({ text: `${a.emoji} ${a.label}`, callback_data: `activity_${a.id}` })),
    [
      { text: `🛌 ${ACTIVITIES[4].label}`, callback_data: `activity_${ACTIVITIES[4].id}` },
      { text: "← Menu", callback_data: "show_menu" },
    ],
  ];
}

function silenzioKeyboard() {
  return [
    [
      { text: "1 ora",           callback_data: "silence_1" },
      { text: "2 ore",           callback_data: "silence_2" },
      { text: "4 ore",           callback_data: "silence_4" },
    ],
    [
      { text: "Fino a domani",   callback_data: "silence_12" },
      { text: "← Annulla",       callback_data: "show_menu" },
    ],
  ];
}

function reportKeyboard() {
  return [
    [
      { text: "📊 Settimanale",       callback_data: "report_week" },
      { text: "📈 Sfida completa",    callback_data: "report_full" },
    ],
    [
      { text: "📧 Salva su Gmail",    callback_data: "report_gmail" },
      { text: "← Menu",              callback_data: "show_menu" },
    ],
  ];
}

function backKeyboard(target = "show_menu") {
  return [[{ text: "← Menu", callback_data: target }]];
}

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE SERVICE ACCOUNT JWT
// ═══════════════════════════════════════════════════════════════════════

async function getGoogleToken(env) {
  const cached = await env.KV.get("google_sa_token");
  if (cached) {
    const t = JSON.parse(cached);
    if (Date.now() < t.expires_at - 60000) return t.access_token;
  }

  const raw = await env.KV.get("google_service_account");
  if (!raw) return null;
  const sa = JSON.parse(raw);

  const now = Math.floor(Date.now() / 1000);
  const enc = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const header  = enc({ alg: "RS256", typ: "JWT" });
  const payload = enc({
    iss: sa.client_email,
    sub: "me@soliwkr.pro",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.send",
    ].join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600, iat: now,
  });

  const sigInput = `${header}.${payload}`;
  const pemLines = sa.private_key.split("\\n").filter(l => l && !l.startsWith("---"));
  const keyBytes = Uint8Array.from(atob(pemLines.join("")), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", keyBytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } }, false, ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(sigInput));
  const sig64 = btoa(String.fromCharCode(...new Uint8Array(sigBytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const jwt = `${sigInput}.${sig64}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = await res.json();
  if (!data.access_token) { console.error("SA token error:", JSON.stringify(data)); return null; }

  await env.KV.put("google_sa_token", JSON.stringify({
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }), { expirationTtl: 3500 });

  return data.access_token;
}

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE APIs
// ═══════════════════════════════════════════════════════════════════════

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
  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: title, description,
      start: { dateTime: `${date}T${startTime}:00`, timeZone: "Europe/Rome" },
      end:   { dateTime: `${date}T${endTime}:00`,   timeZone: "Europe/Rome" },
    }),
  });
  return res.json();
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
  const email = [`To: me@soliwkr.pro`, `Subject: ${subject}`, `Content-Type: text/plain; charset=utf-8`, ``, body].join("\r\n");
  const encoded = btoa(unescape(encodeURIComponent(email))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: { raw: encoded } }),
  });
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

function marcoSystem(ctx = "") {
  return `Sei Marco, coach personale di Chris — Sfida 60 Giorni Decompressione Cervello.
Ex consultant McKinsey, PM senior. Diretto, dati-driven, aspettative alte, zero scuse.
Conosce Fourth Way, cattolicesimo, Messa, Compieta. Non è crudele: è esigente.
Frasi corte. Mai banalità. Memoria elefantina. Tu. Italiano.
Schema: Boot 06:00, Messa 07:30, Lavoro 09-14, Pranzo 15:00, Cena 20:30, No screen, Compieta, Letto 21:30.
TAG: PALESTRA · MOGLIE · VITA · RIPOSO · PRATICA${ctx ? "\n\nCONTESTO:\n"+ctx : ""}`;
}

// ═══════════════════════════════════════════════════════════════════════
// UI BUILDERS
// ═══════════════════════════════════════════════════════════════════════

async function buildMenuText(env, idx) {
  const all = await getData(env);
  const dayData = all[`day_${idx}`] || {};
  const pct = pctOf(dayData);
  const total = totalDone(all);
  const avg = weekAvg(all, idx);
  const isBeforeStart = idx < 0;

  if (isBeforeStart) {
    return `✦ *MARCO — Sfida 60 Giorni*\n\n_La sfida inizia lunedì 4 maggio._\nSono pronto. Tu?\n\nUsa i bottoni per navigare.`;
  }

  return `✦ *MARCO — Giorno ${idx+1}/60*\n${formatDay(idx, true)}\n\n${progressBar(pct)}\n\nSettimana: *${avg}%* · Completi: *${total}/${idx+1}*\nAttività: ${dayData.activity || "—"}`;
}

function buildOggiText(idx, dayData) {
  const done  = SCHEDULE.filter(s => dayData.items?.[s.id]);
  const miss  = SCHEDULE.filter(s => !dayData.items?.[s.id]);
  const pct   = pctOf(dayData);
  const blocks = { mattina: [], logistica: [], pomeriggio: [], sera: [] };
  SCHEDULE.forEach(s => {
    const d = !!dayData.items?.[s.id];
    blocks[s.block].push(`${d?"✅":"⬜"} ${s.emoji} ${s.label}`);
  });
  return `*📅 Giorno ${idx+1}/60 — ${formatDay(idx, true)}*\n\n${progressBar(pct)}\n\n*Boot Mattina*\n${blocks.mattina.join("\n")}\n\n*Logistica*\n${blocks.logistica.join("\n")}\n\n*Pomeriggio*\n${blocks.pomeriggio.join("\n")}\n\n*Sera*\n${blocks.sera.join("\n")}\n\nAttività: ${dayData.activity||"—"}\nNote: ${dayData.note||"—"}`;
}

async function buildStatoText(env, idx) {
  const all = await getData(env);
  const pct = pctOf(all[`day_${idx}`] || {});
  const avg = weekAvg(all, idx);
  const total = totalDone(all);

  // Build week table
  const weekRows = [];
  for (let i = Math.max(0,idx-6); i<=idx; i++) {
    const p = pctOf(all[`day_${i}`]);
    const bar = "█".repeat(Math.round(p/20))+"░".repeat(5-Math.round(p/20));
    weekRows.push(`G${i+1} ${bar} ${p}%`);
  }

  const comment = await askGemini(
    env.GEMINI_API_KEY, marcoSystem(),
    `Dashboard: G${idx+1}, oggi ${pct}%, media settimana ${avg}%, completi ${total}/${idx+1}. Tre righe: trend, punto critico, azione. Niente incoraggiamento.`, 150
  );

  return `*📊 Dashboard — G${idx+1}/60*\n\nOggi: *${pct}%*\nMedia 7gg: *${avg}%*\nGiorni completi: *${total}/${idx+1}*\n\n\`\`\`\n${weekRows.join("\n")}\n\`\`\`\n\n${comment}`;
}

// ═══════════════════════════════════════════════════════════════════════
// MORNING / EVENING SESSIONS
// ═══════════════════════════════════════════════════════════════════════

async function startMorning(env) {
  const idx = getDayIndex();
  if (idx < 0 || idx >= TOTAL_DAYS) return;

  const all = await getData(env);
  const prevConv = idx > 0 ? await getConv(env, idx-1) : null;
  const yesterdayPct = idx > 0 ? pctOf(all[`day_${idx-1}`]) : null;
  const lastIntenzione = prevConv?.evening?.a3 || null;

  const events = await getCalendarEvents(env, dateISO(idx));
  const calSummary = events.length ? events.map(e=>`${e.start} ${e.title}`).join(" · ") : "agenda libera";

  const hasBoot = events.some(e => e.title?.includes("Boot") || e.title?.includes("Sfida60"));
  if (!hasBoot) {
    await createCalendarEvent(env, { title: `⏰ Boot Sfida60 — G${idx+1}`, date: dateISO(idx), startTime: "06:00", endTime: "06:45", description: "Flessioni · preghiere · caffè · corda · addominali · ballo" });
    await createCalendarEvent(env, { title: "🙏 Compieta", date: dateISO(idx), startTime: "20:45", endTime: "21:00" });
  }

  const ctx = `G${idx+1}/60 — ${formatDay(idx,true)}\nIeri: ${yesterdayPct!==null?yesterdayPct+"%":"primo giorno"}\n${lastIntenzione?`Intenzione ieri sera: "${lastIntenzione}"`:""}\nMedia settimana: ${weekAvg(all,Math.max(0,idx-1))}%\nAgenda: ${calSummary}`;

  const msg = await askGemini(
    env.GEMINI_API_KEY, marcoSystem(ctx),
    `Briefing mattutino. Commenta ieri. Poi prima domanda sul risultato NON NEGOZIABILE di oggi — formulala in modo personale. Max 90 parole.`, 280
  );

  await tg(env.TELEGRAM_TOKEN, `*☀️ G${idx+1}/60 — ${formatDay(idx,true)}*\n\n${msg}`);
  await setState(env, { step: "morning_q1", lastDay: idx, context: { calSummary, yesterdayPct } });
}

async function handleMorningAnswer(env, step, answer, idx) {
  const state = await getState(env);
  const conv = await getConv(env, idx);

  if (step === "morning_q1") {
    conv.morning.a1 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY, marcoSystem(), `Chris: obiettivo oggi = "${answer}". ACK 10 parole. Poi: "Cosa rischia di farti uscire dallo schema oggi?"`, 120);
    await tg(env.TELEGRAM_TOKEN, ack);
    await setConv(env, idx, conv); await setState(env, {...state, step: "morning_q2"});

  } else if (step === "morning_q2") {
    conv.morning.a2 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY, marcoSystem(), `Rischio identificato: "${answer}". ACK 10 parole. Poi: "Energia fisica stamattina, da 1 a 5."`, 100);
    await tg(env.TELEGRAM_TOKEN, ack);
    await setConv(env, idx, conv); await setState(env, {...state, step: "morning_q3"});

  } else if (step === "morning_q3") {
    conv.morning.a3 = answer;
    conv.morning.energy = answer.match(/[1-5]/)?.[0] || "?";
    const ctx = `Obiettivo: ${conv.morning.a1} | Rischio: ${conv.morning.a2} | Energia: ${conv.morning.energy}/5 | Agenda: ${state.context?.calSummary}`;
    const briefing = await askGemini(env.GEMINI_API_KEY, marcoSystem(ctx), `Briefing finale. Schema del giorno + focus sull'obiettivo. Chiudi con "Vai." Max 100 parole.`, 300);
    await tg(env.TELEGRAM_TOKEN, `*✦ Briefing G${idx+1}*\n\n${briefing}`, mainMenuKeyboard(idx, pctOf((await getData(env))[`day_${idx}`] || {})));
    const all = await getData(env);
    await appendToSheet(env, [dateISO(idx), `G${idx+1}`, "morning", conv.morning.a1, conv.morning.a2, conv.morning.energy, "", "", "", pctOf(all[`day_${idx}`])]);
    await setConv(env, idx, conv); await setState(env, {...state, step: "morning_done"});
  }
}

async function startEvening(env) {
  const idx = getDayIndex();
  if (idx < 0 || idx >= TOTAL_DAYS) return;

  const all = await getData(env);
  const dayData = all[`day_${idx}`] || {};
  const pct = pctOf(dayData);
  const conv = await getConv(env, idx);
  const goal = conv.morning?.a1 || null;
  const missed = SCHEDULE.filter(s => !dayData.items?.[s.id]).map(s=>s.label);

  const ctx = `G${idx+1}: ${pct}% | Obiettivo: ${goal||"—"} | Mancanti: ${missed.join(", ")||"nessuno"} | Settimana: ${weekAvg(all,idx)}%`;
  const msg = await askGemini(env.GEMINI_API_KEY, marcoSystem(ctx),
    `Apertura serale. ${pct}% oggi. ${goal?`Obiettivo: "${goal}".`:""} 2 righe oneste. Poi: raggiunto o no?`, 220);

  await tg(env.TELEGRAM_TOKEN, `*🌙 G${idx+1} — Check Serale*\n\n${msg}`);
  await setState(env, { step: "evening_q1", lastDay: idx, context: { pct, goal, missed: missed.join(", ") } });
}

async function handleEveningAnswer(env, step, answer, idx) {
  const state = await getState(env);
  const conv = await getConv(env, idx);

  if (step === "evening_q1") {
    conv.evening.a1 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY, marcoSystem(), `Obiettivo raggiunto: "${answer}". ACK onesto 15 parole. Poi: "Cosa ti ha fatto uscire dallo schema oggi?"`, 150);
    await tg(env.TELEGRAM_TOKEN, ack);
    await setConv(env, idx, conv); await setState(env, {...state, step: "evening_q2"});

  } else if (step === "evening_q2") {
    conv.evening.a2 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY, marcoSystem(), `Deviazione: "${answer}". ACK 10 parole. Poi: "Cosa prepari stasera per il Boot di domani?"`, 120);
    await tg(env.TELEGRAM_TOKEN, ack);
    await setConv(env, idx, conv); await setState(env, {...state, step: "evening_q3"});

  } else if (step === "evening_q3") {
    conv.evening.a3 = answer;
    const all = await getData(env);
    const ctx = `Oggi: ${state.context?.pct}% | Raggiunto: ${conv.evening.a1} | Deviazione: ${conv.evening.a2} | Domani: ${answer} | Settimana: ${weekAvg(all,idx)}%`;
    const analysis = await askGemini(env.GEMINI_API_KEY, marcoSystem(ctx),
      `Esame di coscienza. Dati. Pattern se esiste. Un'intenzione concreta per il Boot di domani. Max 130 parole.`, 380);
    await tg(env.TELEGRAM_TOKEN, `*✦ Analisi G${idx+1}*\n\n${analysis}`, mainMenuKeyboard(idx, state.context?.pct));
    await appendToSheet(env, [dateISO(idx), `G${idx+1}`, "evening", conv.evening.a1, conv.evening.a2, conv.evening.a3, "", "", "", state.context?.pct]);
    const dow = new Date().toLocaleDateString("it-IT", { weekday: "long", timeZone: "Europe/Rome" });
    if (dow === "venerdì") await sendWeeklyReport(env, idx, all);
    let lowDays = 0;
    for (let i = Math.max(0,idx-1); i<=idx; i++) if (pctOf(all[`day_${i}`])<50) lowDays++;
    if (lowDays >= 2) await createGmailDraft(env, { subject: `⚠️ Sfida60 — Alert: ${lowDays} giorni sotto 50%`, body: `Marco ha rilevato ${lowDays} giorni consecutivi sotto il 50%.\n\nG${idx+1}: ${state.context?.pct}%\nG${idx}: ${pctOf(all[`day_${idx-1}`])}%` });
    await setConv(env, idx, conv); await setState(env, {...state, step: "evening_done"});
  }
}

// ═══════════════════════════════════════════════════════════════════════
// WEEKLY REPORT
// ═══════════════════════════════════════════════════════════════════════

async function sendWeeklyReport(env, idx, all) {
  const start = Math.max(0, idx-6);
  const week  = Array.from({length: idx-start+1}, (_,i) => ({ day: start+i+1, pct: pctOf(all[`day_${start+i}`]), date: formatDay(start+i) }));
  const avg   = Math.round(week.reduce((a,b)=>a+b.pct,0)/week.length);
  const perfect = week.filter(d=>d.pct===100).length;
  const analysis = await askGemini(env.GEMINI_API_KEY, marcoSystem(),
    `Report settimanale G${start+1}-${idx+1}:\n${week.map(d=>`G${d.day} (${d.date}): ${d.pct}%`).join("\n")}\nMedia: ${avg}% · Perfetti: ${perfect}/7\nTotale: ${totalDone(all)}/60\nAnalisi: trend, forza, critico, obiettivo. Max 180 parole.`, 500);
  await tg(env.TELEGRAM_TOKEN,
    `*📊 Report W${Math.ceil(idx/7)} — G${start+1}→${idx+1}*\nMedia: *${avg}%* · Perfetti: *${perfect}/7*\n\n${analysis}`,
    [[{ text: "📧 Salva su Gmail", callback_data: "report_gmail_week" }, { text: "← Menu", callback_data: "show_menu" }]]
  );
  await createGmailDraft(env, {
    subject: `Sfida60 · W${Math.ceil(idx/7)} · ${avg}%`,
    body: `Report Settimana ${Math.ceil(idx/7)}\n\n${analysis}\n\n${week.map(d=>`G${d.day} (${d.date}): ${d.pct}%`).join("\n")}\n\nMedia: ${avg}% | Perfetti: ${perfect}/7`,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// CALLBACK QUERY HANDLER
// ═══════════════════════════════════════════════════════════════════════

async function handleCallback(env, callbackQuery) {
  const data    = callbackQuery.data;
  const msgId   = callbackQuery.message?.message_id;
  const idx     = Math.max(0, getDayIndex());
  const all     = await getData(env);
  const dayData = all[`day_${idx}`] || {};

  await answerCallback(env.TELEGRAM_TOKEN, callbackQuery.id);

  // ── MENU ──
  if (data === "show_menu") {
    const text = await buildMenuText(env, getDayIndex());
    await editMsg(env.TELEGRAM_TOKEN, msgId, text, mainMenuKeyboard(idx, pctOf(dayData)));
    return;
  }

  // ── OGGI ──
  if (data === "show_oggi") {
    const text = buildOggiText(idx, dayData);
    await editMsg(env.TELEGRAM_TOKEN, msgId, text, [
      [{ text: "✅ Check-in", callback_data: "show_checkin" }],
      ...backKeyboard(),
    ]);
    return;
  }

  // ── STATO ──
  if (data === "show_stato") {
    const text = await buildStatoText(env, idx);
    await editMsg(env.TELEGRAM_TOKEN, msgId, text, backKeyboard());
    return;
  }

  // ── CHECK-IN ──
  if (data === "show_checkin") {
    const pct = pctOf(dayData);
    await editMsg(env.TELEGRAM_TOKEN, msgId,
      `*✅ Check-in — G${idx+1}*\n${progressBar(pct)}\n\nTocca per spuntare/rimuovere:`,
      checkinKeyboard(dayData.items || {})
    );
    return;
  }

  // ── TOGGLE ITEM ──
  if (data.startsWith("check_") && data !== "check_all") {
    const itemId = data.replace("check_", "");
    const item   = SCHEDULE.find(s => s.id === itemId);
    if (!item) return;
    if (!all[`day_${idx}`]) all[`day_${idx}`] = { items: {} };
    if (!all[`day_${idx}`].items) all[`day_${idx}`].items = {};
    all[`day_${idx}`].items[itemId] = !all[`day_${idx}`].items[itemId];
    await setData(env, all);
    const newPct = pctOf(all[`day_${idx}`]);
    await editMsg(env.TELEGRAM_TOKEN, msgId,
      `*✅ Check-in — G${idx+1}*\n${progressBar(newPct)}\n\n${item.emoji} *${item.label}* ${all[`day_${idx}`].items[itemId] ? "✅" : "rimosso"}`,
      checkinKeyboard(all[`day_${idx}`].items || {})
    );
    return;
  }

  // ── CHECK ALL ──
  if (data === "check_all") {
    if (!all[`day_${idx}`]) all[`day_${idx}`] = { items: {} };
    SCHEDULE.forEach(s => { all[`day_${idx}`].items[s.id] = true; });
    await setData(env, all);
    await editMsg(env.TELEGRAM_TOKEN, msgId,
      `*✅ Giorno ${idx+1} — 100%*\n\n${"█".repeat(10)} 100%\n\nTutto completato. Marco ne prende nota.`,
      mainMenuKeyboard(idx, 100)
    );
    return;
  }

  // ── NOTE ──
  if (data === "show_note") {
    await editMsg(env.TELEGRAM_TOKEN, msgId,
      `*📝 Note — G${idx+1}*\n\nNota attuale: _${dayData.note || "nessuna"}_\n\nScrivi la tua nota come messaggio libero.\nMarco la registra automaticamente.`,
      backKeyboard()
    );
    await setState(env, { ...(await getState(env)), step: "waiting_note", lastDay: idx });
    return;
  }

  // ── AGENDA ──
  if (data === "show_agenda") {
    const events = await getCalendarEvents(env, dateISO(idx));
    const list = events.length
      ? events.map(e=>`• *${e.title}* — ${e.start}`).join("\n")
      : "_Agenda libera oggi._";
    await editMsg(env.TELEGRAM_TOKEN, msgId,
      `*📆 Agenda ${formatDay(idx,true)}*\n\n${list}`,
      backKeyboard()
    );
    return;
  }

  // ── REPORT MENU ──
  if (data === "show_report") {
    await editMsg(env.TELEGRAM_TOKEN, msgId, `*📋 Report*\n\nScegli il tipo:`, reportKeyboard());
    return;
  }

  if (data === "report_week" || data === "report_gmail_week") {
    await answerCallback(env.TELEGRAM_TOKEN, callbackQuery.id, "Generando...");
    await sendWeeklyReport(env, idx, all);
    return;
  }

  if (data === "report_full") {
    const days = Array.from({length:idx+1}, (_,i) => `G${i+1}: ${pctOf(all[`day_${i}`])}%`);
    const avg  = weekAvg(all, idx);
    const tot  = totalDone(all);
    const text = `*📈 Sfida Completa — G1→${idx+1}*\n\nMedia: *${avg}%* · Completi: *${tot}/${idx+1}*\n\n${days.join(" · ")}`;
    await editMsg(env.TELEGRAM_TOKEN, msgId, text, backKeyboard("show_report"));
    return;
  }

  if (data === "report_gmail") {
    await sendWeeklyReport(env, idx, all);
    await answerCallback(env.TELEGRAM_TOKEN, callbackQuery.id, "Salvato su Gmail ✓");
    return;
  }

  // ── SILENZIO ──
  if (data === "show_silenzio") {
    await editMsg(env.TELEGRAM_TOKEN, msgId, `*🔇 Silenzio notifiche*\n\nPer quanto?`, silenzioKeyboard());
    return;
  }

  if (data.startsWith("silence_")) {
    const ore   = parseInt(data.replace("silence_", ""));
    const until = Date.now() + ore * 3600000;
    await env.KV.put("sfida60_silence_until", until.toString());
    const h = new Date(until).toLocaleTimeString("it-IT", { timeZone:"Europe/Rome", hour:"2-digit", minute:"2-digit" });
    await editMsg(env.TELEGRAM_TOKEN, msgId,
      `*🔇 Silenzio attivo*\n\nNotifiche sospese per ${ore} ${ore===1?"ora":"ore"}.\nRiprendo alle *${h}*.`,
      [[{ text: "← Menu", callback_data: "show_menu" }]]
    );
    return;
  }

  // ── ATTIVITÀ ──
  if (data === "show_attivita") {
    await editMsg(env.TELEGRAM_TOKEN, msgId, `*🌊 Attività pomeriggio — G${idx+1}*\n\nCosa fai oggi?`, activityKeyboard());
    return;
  }

  if (data.startsWith("activity_")) {
    const actId  = data.replace("activity_", "");
    const act    = ACTIVITIES.find(a => a.id === actId);
    if (!all[`day_${idx}`]) all[`day_${idx}`] = {};
    all[`day_${idx}`].activity = `${act.emoji} ${act.label}`;
    await setData(env, all);
    await editMsg(env.TELEGRAM_TOKEN, msgId,
      `*${act.emoji} ${act.label}* — registrato per oggi.\n\nBuona ${act.label.toLowerCase()}.`,
      mainMenuKeyboard(idx, pctOf(all[`day_${idx}`]))
    );
    return;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════════════════════════════════════

async function handleCommand(env, cmd, args, idx) {
  const all     = await getData(env);
  const dayData = all[`day_${idx}`] || {};
  const pct     = pctOf(dayData);

  if (cmd === "start" || cmd === "menu") {
    await setBotCommands(env.TELEGRAM_TOKEN);
    const text = await buildMenuText(env, getDayIndex());
    await tg(env.TELEGRAM_TOKEN, text, mainMenuKeyboard(idx, pct));
  }

  else if (cmd === "oggi") {
    await tg(env.TELEGRAM_TOKEN, buildOggiText(idx, dayData), [
      [{ text: "✅ Check-in", callback_data: "show_checkin" }],
      ...backKeyboard(),
    ]);
  }

  else if (cmd === "check") {
    const itemId = findItemId(args.join(" "));
    if (!itemId) { await tg(env.TELEGRAM_TOKEN, `Non riconosco "${args.join(" ")}". Es: /check flessioni`); return; }
    if (!all[`day_${idx}`]) all[`day_${idx}`] = { items: {} };
    if (!all[`day_${idx}`].items) all[`day_${idx}`].items = {};
    all[`day_${idx}`].items[itemId] = true;
    await setData(env, all);
    const item = SCHEDULE.find(s => s.id === itemId);
    await tg(env.TELEGRAM_TOKEN, `${item.emoji} *${item.label}* ✓ — ${pctOf(all[`day_${idx}`])}% oggi.`);
  }

  else if (cmd === "agenda") {
    const events = await getCalendarEvents(env, dateISO(idx));
    const list = events.length ? events.map(e=>`• *${e.title}* — ${e.start}`).join("\n") : "_Agenda libera._";
    await tg(env.TELEGRAM_TOKEN, `*📆 ${formatDay(idx,true)}*\n\n${list}`, backKeyboard());
  }

  else if (cmd === "stato") {
    const text = await buildStatoText(env, idx);
    await tg(env.TELEGRAM_TOKEN, text, backKeyboard());
  }

  else if (cmd === "report") {
    await tg(env.TELEGRAM_TOKEN, `*📋 Report*`, reportKeyboard());
  }

  else if (cmd === "silenzio") {
    const ore = parseInt(args[0]) || 0;
    if (ore > 0) {
      const until = Date.now() + ore * 3600000;
      await env.KV.put("sfida60_silence_until", until.toString());
      const h = new Date(until).toLocaleTimeString("it-IT", { timeZone:"Europe/Rome", hour:"2-digit", minute:"2-digit" });
      await tg(env.TELEGRAM_TOKEN, `🔇 Silenzio per ${ore}h. Torno alle ${h}.`);
    } else {
      await tg(env.TELEGRAM_TOKEN, `*🔇 Silenzio*\n\nPer quanto?`, silenzioKeyboard());
    }
  }

  else if (cmd === "aiuto") {
    await tg(env.TELEGRAM_TOKEN,
      `*Marco — Guida*\n\n/menu — Menu principale con bottoni\n/oggi — Stato giornata\n/check [item] — Segna completato\n/agenda — Google Calendar oggi\n/stato — Dashboard e trend\n/report — Report settimanale\n/silenzio [ore] — Pausa notifiche\n\n_Oppure scrivi liberamente — Marco risponde e registra._\n\n[🌐 Apri Tracker](${MINI_APP_URL})`,
      backKeyboard()
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════
// FREE TEXT
// ═══════════════════════════════════════════════════════════════════════

async function handleFreeText(env, text, idx) {
  const all     = await getData(env);
  const dayData = all[`day_${idx}`] || {};
  const state   = await getState(env);
  const conv    = await getConv(env, idx);

  // Waiting for note input
  if (state.step === "waiting_note") {
    if (!all[`day_${idx}`]) all[`day_${idx}`] = {};
    all[`day_${idx}`].note = text;
    await setData(env, all);
    await setState(env, {...state, step: null});
    await tg(env.TELEGRAM_TOKEN, `📝 Nota salvata:\n_"${text}"_`, mainMenuKeyboard(idx, pctOf(all[`day_${idx}`])));
    return;
  }

  // Auto-detect item completion
  const itemId = findItemId(text);
  const lc     = text.toLowerCase();
  const isDone = lc.includes("fatto") || lc.includes("completato") || lc.includes("finito") || lc.match(/^(ho|l'ho|sì|si)/);
  if (itemId && isDone) {
    if (!all[`day_${idx}`]) all[`day_${idx}`] = { items: {} };
    if (!all[`day_${idx}`].items) all[`day_${idx}`].items = {};
    all[`day_${idx}`].items[itemId] = true;
    await setData(env, all);
    const item = SCHEDULE.find(s => s.id === itemId);
    const newPct = pctOf(all[`day_${idx}`]);
    await tg(env.TELEGRAM_TOKEN, `${item.emoji} *${item.label}* registrato.\n${progressBar(newPct)}`);
    return;
  }

  // General Marco response
  const ctx = `G${idx+1}: ${pctOf(dayData)}% | Completati: ${SCHEDULE.filter(s=>dayData.items?.[s.id]).map(s=>s.label).join(", ")||"—"} | Attività: ${dayData.activity||"—"} | Conv: ${JSON.stringify(conv.morning||{})}`;
  const reply = await askGemini(env.GEMINI_API_KEY, marcoSystem(ctx),
    `Chris: "${text}"\nRispondi come Marco. Max 100 parole.`, 280);
  await tg(env.TELEGRAM_TOKEN, reply, mainMenuKeyboard(idx, pctOf(dayData)));
}

// ═══════════════════════════════════════════════════════════════════════
// WEBHOOK
// ═══════════════════════════════════════════════════════════════════════

async function handleWebhook(request, env) {
  const body = await request.json();

  // Callback query (button taps)
  if (body.callback_query) {
    const silence = await env.KV.get("sfida60_silence_until");
    if (silence && Date.now() < parseInt(silence)) {
      await answerCallback(env.TELEGRAM_TOKEN, body.callback_query.id);
      return new Response("ok");
    }
    await handleCallback(env, body.callback_query);
    return new Response("ok");
  }

  const msg = body?.message;
  if (!msg?.text) return new Response("ok");

  const silence = await env.KV.get("sfida60_silence_until");
  if (silence && Date.now() < parseInt(silence)) return new Response("ok");

  const text  = msg.text.trim();
  const idx   = Math.max(0, getDayIndex());
  const state = await getState(env);

  // Flow answers
  const flowSteps = ["morning_q1","morning_q2","morning_q3","evening_q1","evening_q2","evening_q3"];
  if (flowSteps.includes(state.step) && state.lastDay === getDayIndex()) {
    if (state.step.startsWith("morning")) await handleMorningAnswer(env, state.step, text, getDayIndex());
    else await handleEveningAnswer(env, state.step, text, getDayIndex());
    return new Response("ok");
  }

  // Commands
  if (text.startsWith("/")) {
    const parts = text.slice(1).split(" ");
    const cmd   = parts[0].toLowerCase().split("@")[0];
    await handleCommand(env, cmd, parts.slice(1), idx);
    return new Response("ok");
  }

  await handleFreeText(env, text, idx);
  return new Response("ok");
}

// ═══════════════════════════════════════════════════════════════════════
// HTTP ROUTER
// ═══════════════════════════════════════════════════════════════════════

const CORS = { "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type" };
const json = (d,s=200) => new Response(JSON.stringify(d),{status:s,headers:{...CORS,"Content-Type":"application/json"}});

async function handleRequest(request, env) {
  const url  = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (path === "/webhook" && request.method === "POST") return handleWebhook(request, env);
  if (path === "/ping")  return json({ ok:true, day:getDayIndex()+1, total:TOTAL_DAYS });
  if (path === "/data")  return new Response(await env.KV.get("sfida60_data")||"{}", { headers:{...CORS,"Content-Type":"application/json"} });
  if (path === "/sync"  && request.method==="POST") { await env.KV.put("sfida60_data",JSON.stringify(await request.json())); return json({ok:true}); }

  if (path === "/test" && request.method === "POST") {
    const idx = 0;
    const all = await getData(env);
    const events = await getCalendarEvents(env, dateISO(idx));
    const calSummary = events.length ? events.map(e=>`${e.start} ${e.title}`).join(" · ") : "agenda libera";
    const msg = await askGemini(env.GEMINI_API_KEY, marcoSystem(`TEST G1 | Agenda: ${calSummary}`),
      `TEST sistema. Presentati come Marco, fai la prima domanda mattutina. Max 80 parole.`, 250);
    await tg(env.TELEGRAM_TOKEN, `*🧪 TEST Marco*\n\n${msg}`, mainMenuKeyboard(0, 0));
    await setState(env, { step: "morning_q1", lastDay: idx, context: { calSummary, yesterdayPct: null } });
    return json({ ok:true, calendar_events:events.length, cal:calSummary });
  }

  if (path === "/test-morning" && request.method==="POST") { await startMorning(env); return json({ok:true}); }
  if (path === "/test-evening" && request.method==="POST") { await startEvening(env); return json({ok:true}); }

  if (path === "/setup-webhook" && request.method==="POST") {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/setWebhook`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ url:`https://sfida60-motivatore.soliwkr.workers.dev/webhook`, allowed_updates:["message","callback_query"], drop_pending_updates:true }),
    });
    await setBotCommands(env.TELEGRAM_TOKEN);
    return json(await res.json());
  }

  if (path === "/setup-sheets" && request.method==="POST") {
    const { sheetId } = await request.json();
    await env.KV.put("sfida60_sheets_id", sheetId);
    return json({ok:true});
  }

  return new Response("✦ Marco — Sfida60 Worker v3", { headers: CORS });
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

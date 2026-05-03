// ═══════════════════════════════════════════════════════════════════════
// MARCO — Sfida 60 Giorni · Coach Bot v4
// Formattazione premium · Google Docs Dossier · Inline UX completa
// ═══════════════════════════════════════════════════════════════════════

const START_DATE   = new Date("2026-05-04T00:00:00Z");
const TOTAL_DAYS   = 60;
const CHAT_ID      = "5283084625";
const MINI_APP_URL = "https://sfida60.pages.dev";
const WORKER_URL   = "https://sfida60-motivatore.soliwkr.workers.dev";

const SCHEDULE = [
  { id:"sveglia",    label:"Sveglia 06:00",    emoji:"⏰", block:"mattina"    },
  { id:"flessioni",  label:"Flessioni",         emoji:"💪", block:"mattina"    },
  { id:"preghiere",  label:"Preghiere",         emoji:"🙏", block:"mattina"    },
  { id:"caffe",      label:"Caffè",             emoji:"☕", block:"mattina"    },
  { id:"corda",      label:"Corda",             emoji:"🪢", block:"mattina"    },
  { id:"addominali", label:"Addominali",        emoji:"🔥", block:"mattina"    },
  { id:"ballo",      label:"Ballo, Pronto\\!",  emoji:"🕺", block:"mattina"    },
  { id:"autobus",    label:"Autobus 07:00",     emoji:"🚌", block:"logistica"  },
  { id:"messa",      label:"Messa 07:30",       emoji:"⛪", block:"logistica"  },
  { id:"colazione",  label:"Colazione 08:00",   emoji:"🥐", block:"logistica"  },
  { id:"lavoro",     label:"Biblioteca/Lavoro", emoji:"📚", block:"logistica"  },
  { id:"pranzo",     label:"Pranzo 15:00",      emoji:"🥗", block:"pomeriggio" },
  { id:"attivita",   label:"Attività",          emoji:"🌊", block:"pomeriggio" },
  { id:"cena",       label:"Cena 20:30",        emoji:"🍎", block:"sera"       },
  { id:"noscreen",   label:"No Screen",         emoji:"🚫", block:"sera"       },
  { id:"compieta",   label:"Compieta",          emoji:"🙏", block:"sera"       },
  { id:"letto",      label:"Letto 21:30",       emoji:"😴", block:"sera"       },
];

const ACTIVITIES = [
  { id:"palestra", label:"Palestra",     emoji:"🏋️" },
  { id:"mare",     label:"Mare",         emoji:"🌊" },
  { id:"chiese",   label:"Chiese",       emoji:"⛪" },
  { id:"flair",    label:"Flair+Musica", emoji:"🎸" },
  { id:"riposo",   label:"Riposo",       emoji:"🛌" },
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

function formatDayLong(idx) {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + idx);
  return d.toLocaleDateString("it-IT", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
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
  for (let i = Math.max(0,idx-6); i<=idx; i++) days.push(pctOf(allData[`day_${i}`]));
  return days.length ? Math.round(days.reduce((a,b)=>a+b,0)/days.length) : 0;
}

function findItemId(text) {
  const t = text.toLowerCase();
  for (const [id, aliases] of Object.entries(ITEM_ALIASES)) {
    if (aliases.some(a => t.includes(a))) return id;
  }
  return null;
}

// MarkdownV2 escape
function esc(text) {
  return String(text).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

// Progress bar — plain text (no escape needed)
function bar(pct) {
  const f = Math.round(pct / 10);
  return "█".repeat(f) + "░".repeat(10 - f);
}

// ═══════════════════════════════════════════════════════════════════════
// KV STATE
// ═══════════════════════════════════════════════════════════════════════

const kv = {
  async get(env, key, parse = true) {
    const r = await env.KV.get(key);
    return r ? (parse ? JSON.parse(r) : r) : null;
  },
  async set(env, key, val) {
    await env.KV.put(key, typeof val === "string" ? val : JSON.stringify(val));
  },
};

async function getState(env) { return await kv.get(env,"sfida60_state") || {step:null,lastDay:-1,context:{}}; }
async function setState(env,s) { await kv.set(env,"sfida60_state",s); }
async function getData(env) { return await kv.get(env,"sfida60_data") || {}; }
async function setData(env,d) { await kv.set(env,"sfida60_data",d); }
async function getConv(env,i) { return await kv.get(env,`sfida60_conv_${i}`) || {morning:{},evening:{}}; }
async function setConv(env,i,c) { await kv.set(env,`sfida60_conv_${i}`,c); }

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE SERVICE ACCOUNT JWT
// ═══════════════════════════════════════════════════════════════════════

async function getGoogleToken(env) {
  const cached = await kv.get(env,"google_sa_token");
  if (cached && Date.now() < cached.expires_at - 60000) return cached.access_token;

  const sa = await kv.get(env,"google_service_account");
  if (!sa) return null;

  const now = Math.floor(Date.now()/1000);
  const enc = o => btoa(JSON.stringify(o)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const header  = enc({alg:"RS256",typ:"JWT"});
  const payload = enc({
    iss: sa.client_email,
    sub: "me@soliwkr.pro",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.send",
    ].join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now+3600, iat: now,
  });

  const sigInput = `${header}.${payload}`;
  const pemLines = sa.private_key.split("\\n").filter(l => l && !l.startsWith("---"));
  const keyBytes = Uint8Array.from(atob(pemLines.join("")), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", keyBytes.buffer,
    {name:"RSASSA-PKCS1-v1_5",hash:{name:"SHA-256"}}, false, ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(sigInput));
  const sig64 = btoa(String.fromCharCode(...new Uint8Array(sigBytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");

  const res  = await fetch("https://oauth2.googleapis.com/token",{
    method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body: new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:`${sigInput}.${sig64}`}),
  });
  const data = await res.json();
  if (!data.access_token) { console.error("SA token error:",JSON.stringify(data)); return null; }
  await kv.set(env,"google_sa_token",{access_token:data.access_token,expires_at:Date.now()+data.expires_in*1000});
  return data.access_token;
}

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE APIs
// ═══════════════════════════════════════════════════════════════════════

async function gFetch(env, url, opts = {}) {
  const token = await getGoogleToken(env);
  if (!token) return null;
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization:`Bearer ${token}`, "Content-Type":"application/json", ...(opts.headers||{}) },
    body: opts.body ? (typeof opts.body==="string" ? opts.body : JSON.stringify(opts.body)) : undefined,
  });
  if (!res.ok) { console.error("gFetch error:", res.status, await res.text()); return null; }
  return res.json();
}

async function getCalendarEvents(env, dateStr) {
  const tMin = encodeURIComponent(`${dateStr}T00:00:00+02:00`);
  const tMax = encodeURIComponent(`${dateStr}T23:59:59+02:00`);
  const d = await gFetch(env,
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${tMin}&timeMax=${tMax}&singleEvents=true&orderBy=startTime`
  );
  return (d?.items||[]).map(e=>({title:e.summary||"—",start:e.start?.dateTime?.split("T")[1]?.slice(0,5)||e.start?.date||""}));
}

async function createCalendarEvent(env,{title,date,startTime,endTime,description=""}) {
  return gFetch(env,"https://www.googleapis.com/calendar/v3/calendars/primary/events",{
    method:"POST",
    body:{summary:title,description,start:{dateTime:`${date}T${startTime}:00`,timeZone:"Europe/Rome"},end:{dateTime:`${date}T${endTime}:00`,timeZone:"Europe/Rome"}},
  });
}

async function createGmailDraft(env,{subject,body}) {
  const email = [`To: me@soliwkr.pro`,`Subject: ${subject}`,`Content-Type: text/plain; charset=utf-8`,``,body].join("\r\n");
  const encoded = btoa(unescape(encodeURIComponent(email))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  return gFetch(env,"https://gmail.googleapis.com/gmail/v1/users/me/drafts",{method:"POST",body:{message:{raw:encoded}}});
}

async function appendToSheet(env,values) {
  const sheetId = await kv.get(env,"sfida60_sheets_id",false);
  if (!sheetId) return;
  return gFetch(env,
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Log!A:Z:append?valueInputOption=USER_ENTERED`,
    {method:"POST",body:{values:[values]}}
  );
}

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE DOCS — DOSSIER DIPENDENTE
// ═══════════════════════════════════════════════════════════════════════

async function ensureDossier(env) {
  let docId = await kv.get(env,"sfida60_docs_id",false);
  if (docId) return docId;

  // Create new doc
  const doc = await gFetch(env,"https://docs.googleapis.com/v1/documents",{
    method:"POST",
    body:{title:"Marco — Dossier Operativo: Chris Walker"},
  });
  if (!doc?.documentId) return null;
  docId = doc.documentId;
  await kv.set(env,"sfida60_docs_id",docId);

  // Write initial structure
  const initialContent = buildDossierHeader();
  await docsAppend(env, docId, initialContent);
  return docId;
}

function buildDossierHeader() {
  return [
    { heading: "H1", text: "MARCO — DOSSIER OPERATIVO" },
    { text: "Documento riservato. Aggiornato automaticamente dal sistema Marco." },
    { text: "" },
    { heading: "H1", text: "SEZIONE 1 — PROFILO DIPENDENTE" },
    { text: "Nome: Chris Walker (username: @ChrisFior)" },
    { text: "Ruolo: Entrepreneur · Developer · Studio Pura Luce" },
    { text: "Dominio: soliwkr.pro | puraluce.studio" },
    { text: "Sfida: 60 Giorni Decompressione Cervello" },
    { text: "Periodo: 4 Maggio — 2 Luglio 2026" },
    { text: "Coach assegnato: Marco (PM Senior)" },
    { text: "" },
    { text: "CONTESTO OPERATIVO:" },
    { text: "Chris è un developer/imprenditore che lavora in solitudine su più progetti digitali (rank-and-rent SEO, media cattolica, infrastruttura self-hosted). La sfida nasce da un bisogno dichiarato di decompressione cognitiva e ritorno a pratiche corporee e spirituali strutturate. Background Fourth Way e cattolicesimo esicasta. Tende all'over-engineering (sindrome sistemista pesante — riconosciuta e nominata). Regola autoimposta: nessuna nuova infrastruttura complessa senza lead reali." },
    { text: "" },
    { text: "ASPETTATIVE DI MARCO:" },
    { text: "Compliance ≥ 80% settimanale. Zero scuse non documentate. Sessioni mattina/sera completate. Pattern monitorati e confrontati settimana su settimana." },
    { text: "" },
    { heading: "H1", text: "SEZIONE 2 — LOG GIORNALIERO" },
    { text: "[ I log verranno aggiunti automaticamente ogni giorno ]" },
    { text: "" },
    { heading: "H1", text: "SEZIONE 3 — ANALISI SETTIMANALE" },
    { text: "[ Report settimanali — aggiornati ogni venerdì sera ]" },
    { text: "" },
    { heading: "H1", text: "SEZIONE 4 — PATTERN & OSSERVAZIONI" },
    { text: "[ Marco aggiorna questa sezione quando rileva pattern comportamentali ricorrenti ]" },
    { text: "" },
    { heading: "H1", text: "SEZIONE 5 — OKR & OBIETTIVI DICHIARATI" },
    { text: "[ Obiettivi dichiarati nelle sessioni mattina — status aggiornato ogni sera ]" },
    { text: "" },
  ];
}

async function docsAppend(env, docId, items) {
  // Get current end index
  const doc = await gFetch(env, `https://docs.googleapis.com/v1/documents/${docId}`);
  if (!doc) return;

  const endIndex = (doc.body?.content?.at(-1)?.endIndex || 2) - 1;

  // Build full text block to insert at once
  const lines = items.map(item => {
    const prefix = item.heading === "H1" ? "═══ " : item.heading === "H2" ? "── " : item.heading === "H3" ? "• " : "";
    return prefix + (item.text || "");
  });
  const fullText = lines.join("\n") + "\n";

  // Single insertText request
  const requests = [{ insertText: { location: { index: endIndex }, text: fullText } }];

  // Add heading styles for H1/H2 items
  let pos = endIndex;
  for (const item of items) {
    const lineText = ((item.heading==="H1"?"═══ ":item.heading==="H2"?"── ":item.heading==="H3"?"• ":"") + (item.text||"")) + "\n";
    if (item.heading) {
      requests.push({
        updateParagraphStyle: {
          range: { startIndex: pos, endIndex: pos + lineText.length },
          paragraphStyle: { namedStyleType: item.heading==="H1"?"HEADING_1":item.heading==="H2"?"HEADING_2":"HEADING_3" },
          fields: "namedStyleType",
        }
      });
    }
    pos += lineText.length;
  }

  await gFetch(env, `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: "POST", body: { requests },
  });
}

async function logMorningToDocs(env, idx, conv, calSummary, dayData) {
  const docId = await ensureDossier(env);
  if (!docId) return;

  const done = SCHEDULE.filter(s => dayData?.items?.[s.id]).map(s => `${s.emoji}${s.label}`);
  const miss = SCHEDULE.filter(s => !dayData?.items?.[s.id]).map(s => s.label);
  const pct  = pctOf(dayData);

  const items = [
    { heading:"H2", text:`GIORNO ${idx+1} — ${formatDayLong(idx).toUpperCase()}` },
    { bold:true, text:`Completamento: ${pct}%  ${bar(pct)}` },
    { text:`Agenda: ${calSummary||"—"}` },
    { text:"" },
    { bold:true, text:"SESSIONE MATTINA" },
    { text:`Q1 — Risultato non negoziabile: "${conv.morning?.a1||"—"}"` },
    { text:`Q2 — Ostacolo identificato: "${conv.morning?.a2||"—"}"` },
    { text:`Q3 — Energia: ${conv.morning?.energy||"?"}/5` },
    { text:"" },
    { bold:true, text:"CHECK-IN ITEMS" },
    { text:`✅ Completati: ${done.join(" · ")||"—"}` },
    { text:`❌ Mancanti: ${miss.join(", ")||"—"}` },
    { text:"" },
  ];

  await docsAppend(env, docId, items);
}

async function logEveningToDocs(env, idx, conv, analysis, dayData) {
  const docId = await ensureDossier(env);
  if (!docId) return;

  const pct = pctOf(dayData);

  const items = [
    { bold:true, text:"SESSIONE SERA" },
    { text:`Q1 — Obiettivo raggiunto: "${conv.evening?.a1||"—"}"` },
    { text:`Q2 — Deviazione: "${conv.evening?.a2||"—"}"` },
    { text:`Q3 — Prep domani: "${conv.evening?.a3||"—"}"` },
    { text:"" },
    { bold:true, text:"NOTE MARCO (Coach)" },
    { text: analysis || "—" },
    { text:"" },
    { text:`Attività pomeriggio: ${dayData?.activity||"—"}` },
    { text:`Note personali: "${dayData?.note||"—"}"` },
    { text:`Completamento finale giornata: ${pct}%` },
    { text:"────────────────────────────────────────" },
    { text:"" },
  ];

  await docsAppend(env, docId, items);
}

async function logWeeklyToDocs(env, idx, all, analysis, avg, perfect) {
  const docId = await ensureDossier(env);
  if (!docId) return;

  const start = Math.max(0,idx-6);
  const week  = Array.from({length:idx-start+1},(_,i)=>({day:start+i+1,pct:pctOf(all[`day_${start+i}`]),date:formatDay(start+i)}));

  const items = [
    { heading:"H2", text:`SETTIMANA ${Math.ceil(idx/7)} — G${start+1}→${idx+1}` },
    { bold:true, text:`Media: ${avg}% | Giorni perfetti: ${perfect}/7` },
    { text:"" },
    { text: week.map(d=>`G${d.day} (${d.date}): ${bar(d.pct)} ${d.pct}%`).join("\n") },
    { text:"" },
    { bold:true, text:"ANALISI MARCO" },
    { text: analysis },
    { text:"" },
    { text:"════════════════════════════════════════" },
    { text:"" },
  ];

  // Also append to Sezione 3
  await docsAppend(env, docId, items);
}

async function logPatternToDocs(env, pattern) {
  const docId = await ensureDossier(env);
  if (!docId) return;
  const now = new Date().toLocaleDateString("it-IT",{day:"numeric",month:"long"});
  await docsAppend(env, docId, [
    { text:`[${now}] ${pattern}` },
  ]);
}

// ═══════════════════════════════════════════════════════════════════════
// GEMINI
// ═══════════════════════════════════════════════════════════════════════

async function askGemini(apiKey, system, prompt, maxTokens=400) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:system}]},
        contents:[{role:"user",parts:[{text:prompt}]}],
        generationConfig:{maxOutputTokens:maxTokens,temperature:0.85},
      }),
    }
  );
  const d = await res.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "…";
}

function marcoSystem(ctx="") {
  return `Sei Marco, coach personale di Chris Walker — Sfida 60 Giorni Decompressione Cervello.
Ex consultant McKinsey, PM senior in una scale-up. Diretto, dati-driven, aspettative alte, zero pietà per le scuse.
Conosce Fourth Way, cattolicesimo esicasta, Messa, Compieta — non come hobby, come standard.
Non è crudele: è esigente. Frasi corte. Mai banalità motivazionali. Memoria elefantina: cita pattern e dati passati.
Usa il tu. Italiano. Qualche termine PM/business quando pertinente.
Schema sfida: Boot 06:00 (sveglia·flessioni·preghiere·caffè·corda·addominali·ballo), Messa 07:30, Lavoro 09-14, Pranzo 15:00, Cena 20:30, No screen, Compieta, Letto 21:30.
TAG VITA: PALESTRA · MOGLIE · VITA · RIPOSO · PRATICA${ctx?"\n\nCONTESTO:\n"+ctx:""}`;
}

// ═══════════════════════════════════════════════════════════════════════
// TELEGRAM
// ═══════════════════════════════════════════════════════════════════════

async function tgCall(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`,{
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body),
  });
  return res.json();
}

// Send with Markdown (standard, not V2 — more forgiving)
async function tg(token, text, keyboard=null, extra={}) {
  const body = {chat_id:CHAT_ID, text, parse_mode:"Markdown", ...extra};
  if (keyboard) body.reply_markup = {inline_keyboard:keyboard};
  return tgCall(token,"sendMessage",body);
}

async function editMsg(token, messageId, text, keyboard=null) {
  const body = {chat_id:CHAT_ID, message_id:messageId, text, parse_mode:"Markdown"};
  if (keyboard) body.reply_markup = {inline_keyboard:keyboard};
  return tgCall(token,"editMessageText",body);
}

async function answerCB(token, id, text="") {
  return tgCall(token,"answerCallbackQuery",{callback_query_id:id,text});
}

async function setBotCommands(token) {
  return tgCall(token,"setMyCommands",{commands:[
    {command:"start",    description:"🚀 Avvia Marco"},
    {command:"menu",     description:"📋 Menu principale"},
    {command:"oggi",     description:"📅 Stato giornata corrente"},
    {command:"check",    description:"✅ Check-in rapido item"},
    {command:"agenda",   description:"📆 Google Calendar oggi"},
    {command:"stato",    description:"📊 Dashboard e trend"},
    {command:"report",   description:"📈 Report settimanale"},
    {command:"dossier",  description:"📝 Apri il tuo dossier"},
    {command:"silenzio", description:"🔇 Pausa notifiche"},
    {command:"aiuto",    description:"❓ Guida comandi"},
  ]});
}

// ═══════════════════════════════════════════════════════════════════════
// KEYBOARDS
// ═══════════════════════════════════════════════════════════════════════

function kbMain(pct) {
  return [
    [{text:`📅 Oggi`,callback_data:"show_oggi"},{text:`📊 Stato`,callback_data:"show_stato"}],
    [{text:`✅ Check-in`,callback_data:"show_checkin"},{text:`📝 Note`,callback_data:"show_note"}],
    [{text:`📆 Agenda`,callback_data:"show_agenda"},{text:`📋 Report`,callback_data:"show_report"}],
    [{text:`📝 Dossier`,callback_data:"show_dossier"},{text:`🔇 Silenzio`,callback_data:"show_silenzio"}],
    [{text:`🌐 Tracker App`,url:MINI_APP_URL}],
  ];
}

function kbCheckin(items) {
  const rows = [];
  for (let i=0; i<SCHEDULE.length; i+=2) {
    const row = [];
    for (let j=i; j<Math.min(i+2,SCHEDULE.length); j++) {
      const s = SCHEDULE[j];
      const done = !!items[s.id];
      row.push({text:`${done?"✅":"⬜"} ${s.emoji} ${s.label}`,callback_data:`check_${s.id}`});
    }
    rows.push(row);
  }
  rows.push([{text:"✓ Tutto fatto",callback_data:"check_all"},{text:"🌊 Attività",callback_data:"show_attivita"},{text:"← Menu",callback_data:"show_menu"}]);
  return rows;
}

function kbActivity() {
  return [
    ACTIVITIES.slice(0,2).map(a=>({text:`${a.emoji} ${a.label}`,callback_data:`activity_${a.id}`})),
    ACTIVITIES.slice(2,4).map(a=>({text:`${a.emoji} ${a.label}`,callback_data:`activity_${a.id}`})),
    [{text:`🛌 Riposo`,callback_data:`activity_riposo`},{text:"← Check-in",callback_data:"show_checkin"}],
  ];
}

function kbSilenzio() {
  return [
    [{text:"1 ora",callback_data:"silence_1"},{text:"2 ore",callback_data:"silence_2"},{text:"4 ore",callback_data:"silence_4"}],
    [{text:"Fino a domani",callback_data:"silence_12"},{text:"← Annulla",callback_data:"show_menu"}],
  ];
}

function kbReport() {
  return [
    [{text:"📊 Settimanale",callback_data:"report_week"},{text:"📈 Sfida completa",callback_data:"report_full"}],
    [{text:"📧 Salva su Gmail",callback_data:"report_gmail"},{text:"← Menu",callback_data:"show_menu"}],
  ];
}

function kbBack(target="show_menu") {
  return [[{text:"← Menu",callback_data:target}]];
}

// ═══════════════════════════════════════════════════════════════════════
// UI TEXT BUILDERS
// ═══════════════════════════════════════════════════════════════════════

async function buildMenuText(env, idx) {
  const all     = await getData(env);
  const dayData = all[`day_${idx}`] || {};
  const pct     = pctOf(dayData);
  const total   = totalDone(all);
  const avg     = weekAvg(all,idx);

  if (idx < 0) {
    return `✦ *MARCO — Sfida 60 Giorni*\n\n_La sfida inizia lunedì 4 maggio 2026._\n\nSono pronto. Strumenti attivi. Google Calendar, Docs e Gmail configurati.\n\nTu?\n\n─────────────────────`;
  }

  const blockPcts = ["mattina","logistica","pomeriggio","sera"].map(block => {
    const items = SCHEDULE.filter(s=>s.block===block);
    const done  = items.filter(s=>dayData.items?.[s.id]).length;
    return `${block.charAt(0).toUpperCase()+block.slice(1)}: ${done}/${items.length}`;
  });

  return `✦ *MARCO — Giorno ${idx+1}/60*\n${formatDay(idx,true)}\n\n\`${bar(pct)}\` *${pct}%*\n\n${blockPcts.join("  ·  ")}\n\n📊 Settimana: *${avg}%*  |  🏆 Completi: *${total}/${idx+1}*\nAttività: ${dayData.activity||"—"}\n\n─────────────────────`;
}

function buildOggiText(idx, dayData) {
  const pct    = pctOf(dayData);
  const blocks = {mattina:[],logistica:[],pomeriggio:[],sera:[]};
  SCHEDULE.forEach(s => {
    const done = !!dayData.items?.[s.id];
    blocks[s.block].push(`${done?"✅":"⬜"} ${s.emoji} ${s.label}`);
  });
  return `*📅 Giorno ${idx+1}/60 — ${formatDay(idx,true)}*\n\n\`${bar(pct)}\` *${pct}%*\n\n*⚡ Boot Mattina*\n${blocks.mattina.join("\n")}\n\n*🚌 Logistica*\n${blocks.logistica.join("\n")}\n\n*🌊 Pomeriggio*\n${blocks.pomeriggio.join("\n")}\n\n*🌙 Sera*\n${blocks.sera.join("\n")}\n\n─────\nAttività: ${dayData.activity||"—"}\nNote: _${dayData.note||"nessuna"}_`;
}

async function buildStatoText(env, idx) {
  const all  = await getData(env);
  const pct  = pctOf(all[`day_${idx}`]||{});
  const avg  = weekAvg(all,idx);
  const total= totalDone(all);

  const weekRows = [];
  for (let i=Math.max(0,idx-6); i<=idx; i++) {
    const p   = pctOf(all[`day_${i}`]);
    const dot = p===100?"🟢":p>=70?"🟡":p>=40?"🟠":"🔴";
    weekRows.push(`${dot} G${i+1} (${formatDay(i)})  \`${bar(p)}\`  ${p}%`);
  }

  const comment = await askGemini(env.GEMINI_API_KEY, marcoSystem(),
    `Dashboard Chris. G${idx+1}, oggi ${pct}%, media settimana ${avg}%, completi ${total}/${idx+1}. Tre righe max: trend, punto critico, azione immediata. Niente incoraggiamento generico.`,140);

  return `*📊 Dashboard — G${idx+1}/60*\n\n*Oggi:* \`${bar(pct)}\` *${pct}%*\n*Media 7gg:* ${avg}%  |  *Completi:* ${total}/${idx+1}\n\n─────────────────────\n${weekRows.join("\n")}\n─────────────────────\n\n${comment}`;
}

// ═══════════════════════════════════════════════════════════════════════
// MORNING SESSION
// ═══════════════════════════════════════════════════════════════════════

async function startMorning(env) {
  const idx = getDayIndex();
  if (idx < 0 || idx >= TOTAL_DAYS) return;

  const all         = await getData(env);
  const prevConv    = idx>0 ? await getConv(env,idx-1) : null;
  const yesterdayPct= idx>0 ? pctOf(all[`day_${idx-1}`]) : null;
  const lastIntent  = prevConv?.evening?.a3||null;
  const events      = await getCalendarEvents(env,dateISO(idx));
  const calSummary  = events.length ? events.map(e=>`${e.start} ${e.title}`).join(" · ") : "agenda libera";

  const hasBoot = events.some(e=>e.title?.includes("Boot")||e.title?.includes("Sfida60"));
  if (!hasBoot) {
    await createCalendarEvent(env,{title:`⏰ Boot Sfida60 — G${idx+1}`,date:dateISO(idx),startTime:"06:00",endTime:"06:45",description:"Flessioni · preghiere · caffè · corda · addominali · ballo"});
    await createCalendarEvent(env,{title:"🙏 Compieta",date:dateISO(idx),startTime:"20:45",endTime:"21:00"});
  }

  const ctx = `G${idx+1}/60 — ${formatDay(idx,true)}\nIeri: ${yesterdayPct!==null?yesterdayPct+"%":"primo giorno"}\n${lastIntent?`Intenzione ieri sera: "${lastIntent}"`:""}\nMedia settimana: ${weekAvg(all,Math.max(0,idx-1))}%\nGiorni completi: ${totalDone(all)}\nAgenda: ${calSummary}`;

  const msg = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),
    `Briefing mattutino. Riferimento a ieri (${yesterdayPct!==null?yesterdayPct+"%":"primo giorno"}) e agenda se pertinente. Poi prima domanda: risultato NON NEGOZIABILE di oggi. Personale e contestuale. Max 90 parole.`,280);

  await tg(env.TELEGRAM_TOKEN,
    `☀️ *G${idx+1}/60 — ${formatDay(idx,true)}*\n\n─────────────────────\n\n${msg}`);
  await setState(env,{step:"morning_q1",lastDay:idx,context:{calSummary,yesterdayPct}});
}

async function handleMorningAnswer(env,step,answer,idx) {
  const state = await getState(env);
  const conv  = await getConv(env,idx);

  if (step==="morning_q1") {
    conv.morning.a1 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY,marcoSystem(),
      `Chris: obiettivo oggi = "${answer}". ACK diretto 10 parole max. Poi chiedi: "Cosa rischia di farti uscire dallo schema oggi?"`,120);
    await tg(env.TELEGRAM_TOKEN,ack);
    await setConv(env,idx,conv); await setState(env,{...state,step:"morning_q2"});

  } else if (step==="morning_q2") {
    conv.morning.a2 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY,marcoSystem(),
      `Rischio: "${answer}". ACK 10 parole. Poi: "Energia fisica stamattina da 1 a 5."`,100);
    await tg(env.TELEGRAM_TOKEN,ack);
    await setConv(env,idx,conv); await setState(env,{...state,step:"morning_q3"});

  } else if (step==="morning_q3") {
    conv.morning.a3  = answer;
    conv.morning.energy = answer.match(/[1-5]/)?.[0]||"?";

    const ctx = `Obiettivo: ${conv.morning.a1} | Rischio: ${conv.morning.a2} | Energia: ${conv.morning.energy}/5 | Agenda: ${state.context?.calSummary}`;
    const briefing = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),
      `Briefing finale. Schema del giorno. Focus sull'obiettivo dichiarato. Chiudi con "Vai." o simile. Max 100 parole.`,300);

    const all     = await getData(env);
    const dayData = all[`day_${idx}`]||{};
    const pct     = pctOf(dayData);

    await tg(env.TELEGRAM_TOKEN,
      `✦ *Briefing G${idx+1}*\n\n─────────────────────\n\n${briefing}\n\n─────────────────────\n\n\`${bar(pct)}\` ${pct}% completato`,
      kbMain(pct));

    await appendToSheet(env,[dateISO(idx),`G${idx+1}`,"morning",conv.morning.a1,conv.morning.a2,conv.morning.energy,"","","",pct]);
    await logMorningToDocs(env,idx,conv,state.context?.calSummary,dayData);
    await setConv(env,idx,conv); await setState(env,{...state,step:"morning_done"});
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EVENING SESSION
// ═══════════════════════════════════════════════════════════════════════

async function startEvening(env) {
  const idx    = getDayIndex();
  if (idx < 0 || idx >= TOTAL_DAYS) return;

  const all    = await getData(env);
  const dayData= all[`day_${idx}`]||{};
  const pct    = pctOf(dayData);
  const conv   = await getConv(env,idx);
  const goal   = conv.morning?.a1||null;
  const missed = SCHEDULE.filter(s=>!dayData.items?.[s.id]).map(s=>s.label);

  const ctx = `G${idx+1}: ${pct}% | Obiettivo: ${goal||"—"} | Mancanti: ${missed.join(", ")||"nessuno"} | Settimana: ${weekAvg(all,idx)}%`;
  const msg = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),
    `Apertura serale. ${pct}% oggi. ${goal?`Obiettivo dichiarato stamattina: "${goal}".`:""} 2 righe oneste, dati alla mano. Poi: raggiunto sì o no?`,220);

  await tg(env.TELEGRAM_TOKEN,
    `🌙 *G${idx+1} — Esame di Coscienza*\n\n─────────────────────\n\n${msg}`);
  await setState(env,{step:"evening_q1",lastDay:idx,context:{pct,goal,missed:missed.join(", ")}});
}

async function handleEveningAnswer(env,step,answer,idx) {
  const state = await getState(env);
  const conv  = await getConv(env,idx);

  if (step==="evening_q1") {
    conv.evening.a1 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY,marcoSystem(),
      `Obiettivo raggiunto: "${answer}". ACK onesto 15 parole. Poi: "Cosa ti ha fatto uscire dallo schema oggi? Sii specifico."`,150);
    await tg(env.TELEGRAM_TOKEN,ack);
    await setConv(env,idx,conv); await setState(env,{...state,step:"evening_q2"});

  } else if (step==="evening_q2") {
    conv.evening.a2 = answer;
    const ack = await askGemini(env.GEMINI_API_KEY,marcoSystem(),
      `Deviazione: "${answer}". ACK 10 parole. Poi: "Cosa prepari *stasera* per non fallire il Boot di domani?"`,120);
    await tg(env.TELEGRAM_TOKEN,ack);
    await setConv(env,idx,conv); await setState(env,{...state,step:"evening_q3"});

  } else if (step==="evening_q3") {
    conv.evening.a3 = answer;
    const all     = await getData(env);
    const dayData = all[`day_${idx}`]||{};

    const ctx = `Oggi: ${state.context?.pct}% | Raggiunto: ${conv.evening.a1} | Deviazione: ${conv.evening.a2} | Domani: ${answer} | Mancanti: ${state.context?.missed} | Settimana: ${weekAvg(all,idx)}%`;
    const analysis = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),
      `Esame di coscienza finale. Dati alla mano. Nomina un pattern se esiste. UN'intenzione concreta per il Boot di domani — non generica. Max 130 parole.`,380);

    await tg(env.TELEGRAM_TOKEN,
      `✦ *Analisi G${idx+1}*\n\n─────────────────────\n\n${analysis}\n\n─────────────────────\n\n\`${bar(state.context?.pct||0)}\` ${state.context?.pct||0}%`,
      kbMain(state.context?.pct||0));

    await appendToSheet(env,[dateISO(idx),`G${idx+1}`,"evening",conv.evening.a1,conv.evening.a2,conv.evening.a3,"","","",state.context?.pct]);
    await logEveningToDocs(env,idx,conv,analysis,dayData);

    // Pattern detection
    let lowDays=0;
    for (let i=Math.max(0,idx-1);i<=idx;i++) if(pctOf(all[`day_${i}`])<50) lowDays++;
    if (lowDays>=2) {
      const pattern = `⚠️ Alert: ${lowDays} giorni consecutivi sotto 50% (G${idx} e G${idx+1}). Pattern di resistenza rilevato.`;
      await logPatternToDocs(env,pattern);
      await createGmailDraft(env,{subject:`⚠️ Sfida60 — Alert ${lowDays} giorni sotto 50%`,body:`${pattern}\n\nG${idx+1}: ${state.context?.pct}%`});
    }

    const dow = new Date().toLocaleDateString("it-IT",{weekday:"long",timeZone:"Europe/Rome"});
    if (dow==="venerdì") await sendWeeklyReport(env,idx,all);

    await setConv(env,idx,conv); await setState(env,{...state,step:"evening_done"});
  }
}

// ═══════════════════════════════════════════════════════════════════════
// WEEKLY REPORT
// ═══════════════════════════════════════════════════════════════════════

async function sendWeeklyReport(env,idx,all) {
  const start  = Math.max(0,idx-6);
  const week   = Array.from({length:idx-start+1},(_,i)=>({day:start+i+1,pct:pctOf(all[`day_${start+i}`]),date:formatDay(start+i)}));
  const avg    = Math.round(week.reduce((a,b)=>a+b.pct,0)/week.length);
  const perfect= week.filter(d=>d.pct===100).length;

  const analysis = await askGemini(env.GEMINI_API_KEY,marcoSystem(),
    `Report settimanale G${start+1}-${idx+1}:\n${week.map(d=>`G${d.day} (${d.date}): ${d.pct}%`).join("\n")}\nMedia: ${avg}% · Perfetti: ${perfect}/7\nTotale sfida: ${totalDone(all)}/60\nAnalisi: trend, forza, critico, obiettivo settimana prossima. Max 180 parole.`,500);

  const weekTable = week.map(d=>{
    const dot = d.pct===100?"🟢":d.pct>=70?"🟡":d.pct>=40?"🟠":"🔴";
    return `${dot} G${d.day} (${d.date})  \`${bar(d.pct)}\`  ${d.pct}%`;
  }).join("\n");

  await tg(env.TELEGRAM_TOKEN,
    `📊 *Report Settimana ${Math.ceil(idx/7)}*\n\n─────────────────────\n${weekTable}\n─────────────────────\n\nMedia: *${avg}%*  |  Perfetti: *${perfect}/7*  |  Totale: *${totalDone(all)}/60*\n\n${analysis}`,
    [[{text:"📧 Salva su Gmail",callback_data:"report_gmail"},{text:"← Menu",callback_data:"show_menu"}]]
  );

  await logWeeklyToDocs(env,idx,all,analysis,avg,perfect);
  await createGmailDraft(env,{
    subject:`Sfida60 · W${Math.ceil(idx/7)} · ${avg}%`,
    body:`REPORT SETTIMANALE — Settimana ${Math.ceil(idx/7)}\n\n${analysis}\n\n${week.map(d=>`G${d.day} (${d.date}): ${d.pct}%`).join("\n")}\n\nMedia: ${avg}% | Perfetti: ${perfect}/7 | Totale: ${totalDone(all)}/60`,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// CALLBACK HANDLER
// ═══════════════════════════════════════════════════════════════════════

async function handleCallback(env, cb) {
  const data    = cb.data;
  const msgId   = cb.message?.message_id;
  const rawIdx  = getDayIndex();
  const idx     = Math.max(0,rawIdx);
  const all     = await getData(env);
  const dayData = all[`day_${idx}`]||{};

  await answerCB(env.TELEGRAM_TOKEN,cb.id);

  if (data==="show_menu") {
    const text = await buildMenuText(env,rawIdx);
    return editMsg(env.TELEGRAM_TOKEN,msgId,text,kbMain(pctOf(dayData)));
  }

  if (data==="show_oggi") {
    return editMsg(env.TELEGRAM_TOKEN,msgId,buildOggiText(idx,dayData),
      [[{text:"✅ Check-in",callback_data:"show_checkin"}],...kbBack()]);
  }

  if (data==="show_stato") {
    const text = await buildStatoText(env,idx);
    return editMsg(env.TELEGRAM_TOKEN,msgId,text,kbBack());
  }

  if (data==="show_checkin") {
    const pct = pctOf(dayData);
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `✅ *Check-in — G${idx+1}*\n\n\`${bar(pct)}\` *${pct}%*\n\nTocca per spuntare o rimuovere:`,
      kbCheckin(dayData.items||{}));
  }

  if (data.startsWith("check_") && data!=="check_all") {
    const itemId = data.replace("check_","");
    const item   = SCHEDULE.find(s=>s.id===itemId);
    if (!item) return;
    if (!all[`day_${idx}`]) all[`day_${idx}`]={items:{}};
    if (!all[`day_${idx}`].items) all[`day_${idx}`].items={};
    all[`day_${idx}`].items[itemId] = !all[`day_${idx}`].items[itemId];
    await setData(env,all);
    const newPct = pctOf(all[`day_${idx}`]);
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `✅ *Check-in — G${idx+1}*\n\n\`${bar(newPct)}\` *${newPct}%*\n\n${item.emoji} *${item.label}* ${all[`day_${idx}`].items[itemId]?"✅ fatto":"⬜ rimosso"}`,
      kbCheckin(all[`day_${idx}`].items||{}));
  }

  if (data==="check_all") {
    if (!all[`day_${idx}`]) all[`day_${idx}`]={items:{}};
    SCHEDULE.forEach(s=>{ all[`day_${idx}`].items[s.id]=true; });
    await setData(env,all);
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `✅ *G${idx+1} — Giornata completa*\n\n\`██████████\` *100%*\n\nTutto completato. Marco ne prende nota nel dossier.`,
      kbMain(100));
  }

  if (data==="show_attivita") {
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `🌊 *Attività pomeriggio — G${idx+1}*\n\nCosa hai fatto oggi?`,
      kbActivity());
  }

  if (data.startsWith("activity_")) {
    const actId = data.replace("activity_","");
    const act   = ACTIVITIES.find(a=>a.id===actId);
    if (!all[`day_${idx}`]) all[`day_${idx}`]={};
    all[`day_${idx}`].activity = `${act.emoji} ${act.label}`;
    await setData(env,all);
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `${act.emoji} *${act.label}* registrata per G${idx+1}.\n\nBuona ${act.label.toLowerCase()}.`,
      kbMain(pctOf(all[`day_${idx}`])));
  }

  if (data==="show_note") {
    await editMsg(env.TELEGRAM_TOKEN,msgId,
      `📝 *Note — G${idx+1}*\n\nNota attuale: _${dayData.note||"nessuna"}_\n\nScrivi il tuo messaggio — Marco lo registra nel dossier.`,
      kbBack());
    await setState(env,{...(await getState(env)),step:"waiting_note",lastDay:idx});
    return;
  }

  if (data==="show_agenda") {
    const events = await getCalendarEvents(env,dateISO(idx));
    const list = events.length
      ? events.map(e=>`• *${e.title}* — ${e.start}`).join("\n")
      : "_Agenda libera oggi._\n\nNessun impegno rilevato su Google Calendar.";
    return editMsg(env.TELEGRAM_TOKEN,msgId,`📆 *Agenda ${formatDay(idx,true)}*\n\n─────────────────────\n${list}\n─────────────────────`,kbBack());
  }

  if (data==="show_report") {
    return editMsg(env.TELEGRAM_TOKEN,msgId,`📋 *Report*\n\nScegli il tipo di analisi:`,kbReport());
  }

  if (data==="report_week") {
    await answerCB(env.TELEGRAM_TOKEN,cb.id,"Generando report...");
    return sendWeeklyReport(env,idx,all);
  }

  if (data==="report_full") {
    const rows = Array.from({length:idx+1},(_,i)=>{
      const p=pctOf(all[`day_${i}`]);
      const dot=p===100?"🟢":p>=70?"🟡":p>=40?"🟠":"🔴";
      return `${dot} G${i+1} (${formatDay(i)}): ${p}%`;
    });
    const avg  = weekAvg(all,idx);
    const total= totalDone(all);
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `📈 *Sfida Completa — G1→${idx+1}*\n\n\`${bar(Math.round(total/TOTAL_DAYS*100))}\` *${Math.round(total/TOTAL_DAYS*100)}% giorni perfetti*\n\nMedia: *${avg}%*  |  Completi: *${total}/${idx+1}*\n\n─────────────────────\n${rows.join("\n")}`,
      kbBack("show_report"));
  }

  if (data==="report_gmail") {
    await sendWeeklyReport(env,idx,all);
    return answerCB(env.TELEGRAM_TOKEN,cb.id,"Salvato su Gmail ✓");
  }

  if (data==="show_dossier") {
    const docId = await kv.get(env,"sfida60_docs_id",false);
    const url   = docId ? `https://docs.google.com/document/d/${docId}` : null;
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      url
        ? `📝 *Dossier Operativo*\n\nMarco aggiorna il documento dopo ogni sessione mattina e sera.\n\nContiene: profilo, log giornaliero, analisi settimanale, pattern, OKR.\n\n[Apri Dossier ↗](${url})`
        : `📝 *Dossier*\n\nIl dossier verrà creato automaticamente al primo giorno della sfida (4 maggio).`,
      kbBack());
  }

  if (data==="show_silenzio") {
    return editMsg(env.TELEGRAM_TOKEN,msgId,`🔇 *Silenzio notifiche*\n\nPer quanto tempo vuoi sospendere Marco?`,kbSilenzio());
  }

  if (data.startsWith("silence_")) {
    const ore   = parseInt(data.replace("silence_",""));
    const until = Date.now()+ore*3600000;
    await env.KV.put("sfida60_silence_until",until.toString());
    const h = new Date(until).toLocaleTimeString("it-IT",{timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit"});
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `🔇 *Silenzio attivo*\n\nNotifiche sospese per *${ore} ${ore===1?"ora":"ore"}*.\nRiprendo alle *${h}*.\n\nIn caso di emergenza scrivi /menu.`,
      [[{text:"← Menu",callback_data:"show_menu"}]]);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════════════════════════════════════

async function handleCommand(env,cmd,args,idx) {
  const all     = await getData(env);
  const dayData = all[`day_${idx}`]||{};
  const pct     = pctOf(dayData);
  const rawIdx  = getDayIndex();

  if (cmd==="start"||cmd==="menu") {
    await setBotCommands(env.TELEGRAM_TOKEN);
    const text = await buildMenuText(env,rawIdx);
    return tg(env.TELEGRAM_TOKEN,text,kbMain(pct));
  }

  if (cmd==="oggi") {
    return tg(env.TELEGRAM_TOKEN,buildOggiText(idx,dayData),
      [[{text:"✅ Check-in",callback_data:"show_checkin"}],...kbBack()]);
  }

  if (cmd==="check") {
    const itemId = findItemId(args.join(" "));
    if (!itemId) return tg(env.TELEGRAM_TOKEN,`Non riconosco "${args.join(" ")}"\n\nEs: /check flessioni`);
    if (!all[`day_${idx}`]) all[`day_${idx}`]={items:{}};
    if (!all[`day_${idx}`].items) all[`day_${idx}`].items={};
    all[`day_${idx}`].items[itemId]=true;
    await setData(env,all);
    const item=SCHEDULE.find(s=>s.id===itemId);
    return tg(env.TELEGRAM_TOKEN,`${item.emoji} *${item.label}* ✓\n\`${bar(pctOf(all[`day_${idx}`]))}\` ${pctOf(all[`day_${idx}`])}% oggi`);
  }

  if (cmd==="agenda") {
    const events = await getCalendarEvents(env,dateISO(idx));
    const list = events.length ? events.map(e=>`• *${e.title}* — ${e.start}`).join("\n") : "_Agenda libera._";
    return tg(env.TELEGRAM_TOKEN,`📆 *Agenda ${formatDay(idx,true)}*\n\n─────────────────────\n${list}\n─────────────────────`,kbBack());
  }

  if (cmd==="stato") {
    const text = await buildStatoText(env,idx);
    return tg(env.TELEGRAM_TOKEN,text,kbBack());
  }

  if (cmd==="report") {
    return tg(env.TELEGRAM_TOKEN,`📋 *Report*\n\nScegli il tipo:`,kbReport());
  }

  if (cmd==="dossier") {
    const docId = await kv.get(env,"sfida60_docs_id",false);
    const url   = docId ? `https://docs.google.com/document/d/${docId}` : null;
    return tg(env.TELEGRAM_TOKEN,
      url ? `📝 *Dossier Operativo*\n\n[Apri Dossier ↗](${url})` : `📝 Il dossier viene creato al primo giorno della sfida.`,
      kbBack());
  }

  if (cmd==="silenzio") {
    const ore=parseInt(args[0])||0;
    if (ore>0) {
      const until=Date.now()+ore*3600000;
      await env.KV.put("sfida60_silence_until",until.toString());
      const h=new Date(until).toLocaleTimeString("it-IT",{timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit"});
      return tg(env.TELEGRAM_TOKEN,`🔇 Silenzio per ${ore}h — torno alle ${h}.`);
    }
    return tg(env.TELEGRAM_TOKEN,`🔇 *Silenzio*\n\nPer quanto?`,kbSilenzio());
  }

  if (cmd==="aiuto"||cmd==="help") {
    return tg(env.TELEGRAM_TOKEN,
      `*Marco — Guida Comandi*\n\n─────────────────────\n/menu — Menu principale con bottoni\n/oggi — Stato giornata dettagliato\n/check [item] — Segna item completato\n/agenda — Google Calendar oggi\n/stato — Dashboard e grafico settimana\n/report — Report settimanale\n/dossier — Apri il tuo dossier Google Docs\n/silenzio [ore] — Pausa notifiche\n─────────────────────\n\n_Scrivi liberamente: Marco risponde e registra automaticamente._\n\n[🌐 Apri Tracker](${MINI_APP_URL})`,
      kbBack());
  }
}

// ═══════════════════════════════════════════════════════════════════════
// FREE TEXT
// ═══════════════════════════════════════════════════════════════════════

async function handleFreeText(env,text,idx) {
  const all     = await getData(env);
  const dayData = all[`day_${idx}`]||{};
  const state   = await getState(env);

  if (state.step==="waiting_note") {
    if (!all[`day_${idx}`]) all[`day_${idx}`]={};
    all[`day_${idx}`].note=text;
    await setData(env,all);
    await setState(env,{...state,step:null});
    return tg(env.TELEGRAM_TOKEN,`📝 Nota registrata nel dossier:\n_"${text}"_`,kbMain(pctOf(all[`day_${idx}`])));
  }

  const itemId = findItemId(text);
  const lc     = text.toLowerCase();
  const isDone = lc.includes("fatto")||lc.includes("completato")||lc.includes("finito")||!!lc.match(/^(ho |l'ho|sì|si |ok)/);
  if (itemId && isDone) {
    if (!all[`day_${idx}`]) all[`day_${idx}`]={items:{}};
    if (!all[`day_${idx}`].items) all[`day_${idx}`].items={};
    all[`day_${idx}`].items[itemId]=true;
    await setData(env,all);
    const item=SCHEDULE.find(s=>s.id===itemId);
    const newPct=pctOf(all[`day_${idx}`]);
    return tg(env.TELEGRAM_TOKEN,`${item.emoji} *${item.label}* registrato.\n\`${bar(newPct)}\` ${newPct}%`);
  }

  const ctx=`G${idx+1}: ${pctOf(dayData)}% | Completati: ${SCHEDULE.filter(s=>dayData.items?.[s.id]).map(s=>s.label).join(", ")||"—"} | Attività: ${dayData.activity||"—"} | Note: ${dayData.note||"—"} | Settimana: ${weekAvg(all,idx)}%`;
  const reply = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),
    `Chris: "${text}"\nRispondi come Marco. Max 100 parole. Contestuale.`,280);
  return tg(env.TELEGRAM_TOKEN,reply,kbMain(pctOf(dayData)));
}

// ═══════════════════════════════════════════════════════════════════════
// WEBHOOK
// ═══════════════════════════════════════════════════════════════════════

async function handleWebhook(request,env) {
  const body = await request.json();

  if (body.callback_query) {
    const silence=await env.KV.get("sfida60_silence_until");
    if (silence && Date.now()<parseInt(silence)) { await answerCB(env.TELEGRAM_TOKEN,body.callback_query.id); return new Response("ok"); }
    await handleCallback(env,body.callback_query);
    return new Response("ok");
  }

  const msg=body?.message;
  if (!msg?.text) return new Response("ok");

  const silence=await env.KV.get("sfida60_silence_until");
  if (silence && Date.now()<parseInt(silence)) return new Response("ok");

  const text  = msg.text.trim();
  const rawIdx= getDayIndex();
  const idx   = Math.max(0,rawIdx);
  const state = await getState(env);

  const flowSteps=["morning_q1","morning_q2","morning_q3","evening_q1","evening_q2","evening_q3"];
  if (flowSteps.includes(state.step) && state.lastDay===rawIdx) {
    if (state.step.startsWith("morning")) await handleMorningAnswer(env,state.step,text,rawIdx);
    else await handleEveningAnswer(env,state.step,text,rawIdx);
    return new Response("ok");
  }

  if (text.startsWith("/")) {
    const parts=text.slice(1).split(" ");
    const cmd=parts[0].toLowerCase().split("@")[0];
    await handleCommand(env,cmd,parts.slice(1),idx);
    return new Response("ok");
  }

  await handleFreeText(env,text,idx);
  return new Response("ok");
}

// ═══════════════════════════════════════════════════════════════════════
// HTTP ROUTER
// ═══════════════════════════════════════════════════════════════════════

const CORS={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":"Content-Type",
};
const jsonR=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{...CORS,"Content-Type":"application/json"}});

async function handleRequest(request,env) {
  const url=new URL(request.url);
  const p=url.pathname;

  if (request.method==="OPTIONS") return new Response(null,{headers:CORS});
  if (p==="/webhook" && request.method==="POST") return handleWebhook(request,env);
  if (p==="/ping") return jsonR({ok:true,day:getDayIndex()+1,total:TOTAL_DAYS,started:getDayIndex()>=0});
  if (p==="/data") return new Response(await env.KV.get("sfida60_data")||"{}",{headers:{...CORS,"Content-Type":"application/json"}});
  if (p==="/sync" && request.method==="POST") {
    await env.KV.put("sfida60_data",JSON.stringify(await request.json()));
    return jsonR({ok:true});
  }

  if (p==="/test" && request.method==="POST") {
    const idx=0;
    const all=await getData(env);
    const events=await getCalendarEvents(env,dateISO(idx));
    const calSummary=events.length?events.map(e=>`${e.start} ${e.title}`).join(" · "):"agenda libera";
    const msg=await askGemini(env.GEMINI_API_KEY,marcoSystem(`TEST G1 | Agenda: ${calSummary}`),
      `TEST sistema. Presentati come Marco in modo asciutto. Fai la prima domanda mattutina. Max 80 parole.`,250);
    await tg(env.TELEGRAM_TOKEN,
      `🧪 *TEST — Marco Sistema v4*\n\n─────────────────────\n\n${msg}`,kbMain(0));
    await setState(env,{step:"morning_q1",lastDay:idx,context:{calSummary,yesterdayPct:null}});
    return jsonR({ok:true,calendar_events:events.length,cal:calSummary});
  }

  if (p==="/test-morning" && request.method==="POST") { await startMorning(env); return jsonR({ok:true}); }
  if (p==="/test-evening" && request.method==="POST") { await startEvening(env); return jsonR({ok:true}); }

  if (p==="/setup-webhook" && request.method==="POST") {
    const res=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/setWebhook`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({url:`${WORKER_URL}/webhook`,allowed_updates:["message","callback_query"],drop_pending_updates:true}),
    });
    await setBotCommands(env.TELEGRAM_TOKEN);
    return jsonR(await res.json());
  }

  if (p==="/setup-sheets" && request.method==="POST") {
    const {sheetId}=await request.json();
    await env.KV.put("sfida60_sheets_id",sheetId);
    return jsonR({ok:true});
  }

  if (p==="/create-dossier" && request.method==="POST") {
    const docId=await ensureDossier(env);
    return jsonR({ok:!!docId,docId,url:docId?`https://docs.google.com/document/d/${docId}`:null});
  }

  return new Response("✦ Marco — Sfida60 Worker v4",{headers:CORS});
}

// ═══════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

export default {
  async fetch(request,env) { return handleRequest(request,env); },
  async scheduled(event,env) {
    const silence=await env.KV.get("sfida60_silence_until");
    if (silence && Date.now()<parseInt(silence)) return;
    if (event.cron==="5 4 * * *")  await startMorning(env);
    if (event.cron==="5 19 * * *") await startEvening(env);
  },
};

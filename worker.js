// ═══════════════════════════════════════════════════════════════════════
// MARCO — Sfida 60 Giorni · Coach Bot v5
// Predictive System · 8 Features · Full Integration
// ═══════════════════════════════════════════════════════════════════════

let START_DATE = new Date("2026-05-04T00:00:00Z");

async function loadStartDate(env) {
  const saved = await env.KV.get("sfida60_start_date");
  if (saved) START_DATE = new Date(saved + "T00:00:00Z");
}
const TOTAL_DAYS   = 60;
const CHAT_ID      = "5283084625";
const MINI_APP_URL = "https://sfida60.pages.dev";
const DOC_ID       = "1l66Wo8w18QTg7avNky8rb5iE1FKkcJZz8lyCuGiIkiU";

const SCHEDULE = [
  { id:"sveglia",    label:"Sveglia 06:00",     emoji:"⏰", block:"mattina"    },
  { id:"flessioni",  label:"Flessioni",          emoji:"💪", block:"mattina"    },
  { id:"preghiere",  label:"Preghiere",          emoji:"🙏", block:"mattina"    },
  { id:"caffe",      label:"Caffè",              emoji:"☕", block:"mattina"    },
  { id:"corda",      label:"Corda",              emoji:"🪢", block:"mattina"    },
  { id:"addominali", label:"Addominali",         emoji:"🔥", block:"mattina"    },
  { id:"ballo",      label:"Ballo, Pronto!",     emoji:"🕺", block:"mattina"    },
  { id:"autobus",    label:"Autobus 07:00",      emoji:"🚌", block:"logistica"  },
  { id:"messa",      label:"Messa 07:30",        emoji:"⛪", block:"logistica"  },
  { id:"colazione",  label:"Colazione 08:00",    emoji:"🥐", block:"logistica"  },
  { id:"lavoro",     label:"Biblioteca/Lavoro",  emoji:"📚", block:"logistica"  },
  { id:"pranzo",     label:"Pranzo 15:00",       emoji:"🥗", block:"pomeriggio" },
  { id:"attivita",   label:"Attività",           emoji:"🌊", block:"pomeriggio" },
  { id:"cena",       label:"Cena 20:30",         emoji:"🍎", block:"sera"       },
  { id:"noscreen",   label:"No Screen",          emoji:"🚫", block:"sera"       },
  { id:"compieta",   label:"Compieta",           emoji:"🙏", block:"sera"       },
  { id:"letto",      label:"Letto 21:30",        emoji:"😴", block:"sera"       },
];

const BLOCK_LABELS = {
  mattina:    { icon:"☀️",  title:"Boot Mattina"  },
  logistica:  { icon:"🚌",  title:"Logistica"     },
  pomeriggio: { icon:"🌊",  title:"Pomeriggio"    },
  sera:       { icon:"🌙",  title:"Sera"          },
};

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
// PREDICTIVE SYSTEM — Fase Engine
// ═══════════════════════════════════════════════════════════════════════

const PHASES = [
  { id:1, name:"Luna di Miele",     range:[0,6],   color:"#2ECC71", emoji:"🌙",
    focus:"setup, aspettative alte",
    headline:"L'entusiasmo regge — usa questa energia per cementare il Boot",
    prediction:"Completamento atteso: 85-100%. Rischio solo logistico.",
    vulnerability:null },
  { id:2, name:"Primo Calo",        range:[7,13],  color:"#F5A623", emoji:"⚡",
    focus:"Boot 06:00, Messa, primo cedimento",
    headline:"Il Boot delle 06:00 diventa negoziabile — qui si vede chi sei",
    prediction:"Completamento atteso: 65-80%. La sveglia sarà il primo item a saltare.",
    vulnerability:"Resistenza al ritmo regolare" },
  { id:3, name:"Zona Critica",      range:[14,24], color:"#E74C3C", emoji:"🔥",
    focus:"routine non automatica, qui si vince",
    headline:"Novità finita, routine non automatica — qui si vince o si perde",
    prediction:"Completamento atteso: 55-75%. Tentazione di 'migliorare lo schema'.",
    vulnerability:"Sindrome del sistemista pesante" },
  { id:4, name:"Disciplina o Noia", range:[25,44], color:"#FF8C00", emoji:"⚙️",
    focus:"auto-sabotaggio, pattern detection",
    headline:"Disciplina acquisita ma fragile — le micro-deviazioni sono il nemico",
    prediction:"Completamento atteso: 70-85%. Micro-deviazioni più pericolose del cedimento.",
    vulnerability:"Over-engineering compulsivo" },
  { id:5, name:"Sprint Finale",     range:[45,59], color:"#FFD700", emoji:"🏁",
    focus:"countdown, retrospettiva, chiusura",
    headline:"La fine è visibile — porta a casa il risultato",
    prediction:"Completamento atteso: 75-95%. Se media >70%, completa. Se <50%, rischio abbandono.",
    vulnerability:"Dispersione progettuale" },
];

const VULNERABILITIES = [
  { id:1, name:"Sindrome del sistemista pesante", desc:"infrastruttura > domanda" },
  { id:2, name:"Over-engineering compulsivo",     desc:"configurare > vendere" },
  { id:3, name:"Dispersione progettuale",         desc:"3 ecosistemi da solo" },
  { id:4, name:"Resistenza al ritmo regolare",    desc:"creatività > disciplina" },
];

function getPhase(dayIndex) {
  for (const p of PHASES) {
    if (dayIndex >= p.range[0] && dayIndex <= p.range[1]) return p;
  }
  return PHASES[PHASES.length-1];
}

function detectActiveVulnerability(all, idx) {
  const last3 = [];
  for (let i=Math.max(0,idx-2); i<=idx; i++) last3.push(all[`day_${i}`]||{});

  const bootMissed = last3.filter(d => !d.items?.sveglia).length;
  if (bootMissed >= 2) return VULNERABILITIES[3];

  const notes = last3.map(d => (d.note||"").toLowerCase()).join(" ");
  if (notes.match(/sistem|config|setup|infra|server|deploy/)) return VULNERABILITIES[0];
  if (notes.match(/refactor|ottimizz|miglio|perfez/)) return VULNERABILITIES[1];

  const acts = last3.map(d => d.activity).filter(Boolean);
  if (new Set(acts).size >= 3) return VULNERABILITIES[2];

  const phase = getPhase(idx);
  if (phase.vulnerability) return VULNERABILITIES.find(v => v.name === phase.vulnerability) || null;
  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// SCORING SYSTEM — Punteggio Cumulativo
// ═══════════════════════════════════════════════════════════════════════

function calculateScore(all, idx) {
  let score = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  for (let i=0; i<=idx; i++) {
    const dayData = all[`day_${i}`] || {};
    const pct = pctOf(dayData);
    const items = dayData.items || {};

    const completed = SCHEDULE.filter(s => items[s.id]).length;
    score += completed;

    if (pct === 100) {
      score += 10;
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }

    if (currentStreak >= 3) score += 5;

    const morningItems = SCHEDULE.filter(s => s.block === "mattina");
    if (morningItems.every(s => items[s.id])) score += 3;

    if (pct < 50 && i > 0) score -= 5;
    if (pct === 0 && i > 0) score -= 10;
  }

  return { score, currentStreak, bestStreak };
}

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

function getDayIndex() {
  const d = new Date(); d.setHours(0,0,0,0);
  const s = new Date(START_DATE); s.setHours(0,0,0,0);
  return Math.floor((d - s) / 86400000);
}

function formatDay(idx, long=false) {
  const d = new Date(START_DATE); d.setDate(d.getDate()+idx);
  return d.toLocaleDateString("it-IT",{weekday:long?"long":"short",day:"numeric",month:long?"long":"short"});
}

function dateISO(idx) {
  const d = new Date(START_DATE); d.setDate(d.getDate()+idx);
  return d.toISOString().split("T")[0];
}

function pctOf(dayData) {
  if (!dayData?.items) return 0;
  return Math.round(SCHEDULE.filter(s=>dayData.items[s.id]).length / SCHEDULE.length * 100);
}

function totalDone(all) {
  let n=0; for(let i=0;i<TOTAL_DAYS;i++) if(pctOf(all[`day_${i}`])===100) n++; return n;
}

function weekAvg(all, idx) {
  const days=[]; for(let i=Math.max(0,idx-6);i<=idx;i++) days.push(pctOf(all[`day_${i}`]));
  return days.length ? Math.round(days.reduce((a,b)=>a+b,0)/days.length) : 0;
}

function findItemId(text) {
  const t=text.toLowerCase();
  for(const [id,aliases] of Object.entries(ITEM_ALIASES)) if(aliases.some(a=>t.includes(a))) return id;
  return null;
}

function bar(pct) {
  const f=Math.round(pct/10);
  return `${"█".repeat(f)}${"░".repeat(10-f)}`;
}

function medal(pct) {
  if(pct===100) return "🏆";
  if(pct>=80)   return "🥈";
  if(pct>=50)   return "🟡";
  return "🔴";
}

function trend(all, idx) {
  if(idx<1) return "";
  const t=pctOf(all[`day_${idx}`]), y=pctOf(all[`day_${idx-1}`]);
  if(t>y) return "↑"; if(t<y) return "↓"; return "→";
}

// ═══════════════════════════════════════════════════════════════════════
// KV
// ═══════════════════════════════════════════════════════════════════════

const kv = {
  getState: async(env) => { const r=await env.KV.get("sfida60_state"); return r?JSON.parse(r):{step:null,lastDay:-1,context:{}}; },
  setState: async(env,s) => env.KV.put("sfida60_state",JSON.stringify(s)),
  getData:  async(env) => { const r=await env.KV.get("sfida60_data"); return r?JSON.parse(r):{}; },
  setData:  async(env,d) => env.KV.put("sfida60_data",JSON.stringify(d)),
  getConv:  async(env,i) => { const r=await env.KV.get(`sfida60_conv_${i}`); return r?JSON.parse(r):{morning:{},evening:{}}; },
  setConv:  async(env,i,c) => env.KV.put(`sfida60_conv_${i}`,JSON.stringify(c)),
};

// ═══════════════════════════════════════════════════════════════════════
// TELEGRAM
// ═══════════════════════════════════════════════════════════════════════

async function tgCall(token, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`,{
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
  });
  return r.json();
}

const tg = (token,text,keyboard=null,extra={}) => tgCall(token,"sendMessage",{
  chat_id:CHAT_ID, text, parse_mode:"Markdown",
  ...(keyboard?{reply_markup:{inline_keyboard:keyboard}}:{}), ...extra
});

const editMsg = (token,msgId,text,keyboard=null) => tgCall(token,"editMessageText",{
  chat_id:CHAT_ID, message_id:msgId, text, parse_mode:"Markdown",
  ...(keyboard?{reply_markup:{inline_keyboard:keyboard}}:{})
});

const answerCb = (token,id,text="") => tgCall(token,"answerCallbackQuery",{callback_query_id:id,text});

async function setBotCommands(token) {
  return tgCall(token,"setMyCommands",{commands:[
    {command:"start",    description:"✦ Avvia Marco — presentazione e menu"},
    {command:"menu",     description:"📱 Menu principale con tutti i comandi"},
    {command:"oggi",     description:"📅 Stato completo della giornata"},
    {command:"check",    description:"✅ Segna item completato — es. /check flessioni"},
    {command:"agenda",   description:"📆 Google Calendar — agenda di oggi"},
    {command:"stato",    description:"📊 Dashboard performance e trend settimanale"},
    {command:"report",   description:"📋 Report settimanale → Telegram + Gmail"},
    {command:"peso",     description:"⚖️ Registra peso — es. /peso 78.5"},
    {command:"foto",     description:"📸 Invia la foto del giorno"},
    {command:"punteggio",description:"🏅 Punteggio cumulativo e streak"},
    {command:"fase",     description:"🔮 Fase predittiva attuale"},
    {command:"silenzio", description:"🔇 Pausa notifiche — es. /silenzio 2"},
    {command:"setstart", description:"📆 Imposta data inizio — es. /setstart 2026-05-04"},
    {command:"aiuto",    description:"❓ Guida completa ai comandi"},
  ]});
}

// ═══════════════════════════════════════════════════════════════════════
// KEYBOARDS
// ═══════════════════════════════════════════════════════════════════════

const kb = {
  main: (pct) => [
    [{text:`📅 Oggi  ${medal(pct)} ${pct}%`, callback_data:"show_oggi"},
     {text:"📊 Stato & Trend",               callback_data:"show_stato"}],
    [{text:"✅ Check-in",                    callback_data:"show_checkin"},
     {text:"📝 Aggiungi Nota",               callback_data:"show_note"}],
    [{text:"📆 Agenda Calendar",             callback_data:"show_agenda"},
     {text:"📋 Report",                      callback_data:"show_report"}],
    [{text:"🌊 Attività Pomeriggio",         callback_data:"show_attivita"},
     {text:"🔇 Silenzio",                    callback_data:"show_silenzio"}],
    [{text:"🏅 Punteggio",                   callback_data:"show_punteggio"},
     {text:"🔮 Fase",                        callback_data:"show_fase"}],
    [{text:"⚖️ Peso/Misure",                callback_data:"show_peso"},
     {text:"📸 Foto del giorno",             callback_data:"show_foto"}],
    [{text:"🌐 Apri Tracker",                url:MINI_APP_URL},
     {text:"📄 Dossier Docs",               url:`https://docs.google.com/document/d/${DOC_ID}/edit`}],
  ],

  checkin: (items) => {
    const rows=[];
    for(let i=0;i<SCHEDULE.length;i+=2){
      const row=[];
      for(let j=i;j<Math.min(i+2,SCHEDULE.length);j++){
        const s=SCHEDULE[j], done=!!items[s.id];
        row.push({text:`${done?"✅":"⬜"} ${s.emoji} ${s.label}`, callback_data:`check_${s.id}`});
      }
      rows.push(row);
    }
    rows.push([
      {text:"⚡ Segna tutto",  callback_data:"check_all"},
      {text:"↩ Menu",          callback_data:"show_menu"},
    ]);
    return rows;
  },

  activity: () => [
    ACTIVITIES.slice(0,2).map(a=>({text:`${a.emoji} ${a.label}`,callback_data:`activity_${a.id}`})),
    ACTIVITIES.slice(2,4).map(a=>({text:`${a.emoji} ${a.label}`,callback_data:`activity_${a.id}`})),
    [{text:`${ACTIVITIES[4].emoji} ${ACTIVITIES[4].label}`,callback_data:`activity_${ACTIVITIES[4].id}`},
     {text:"↩ Menu", callback_data:"show_menu"}],
  ],

  silence: () => [
    [{text:"⏱ 1 ora",           callback_data:"silence_1"},
     {text:"⏱ 2 ore",           callback_data:"silence_2"},
     {text:"⏱ 4 ore",           callback_data:"silence_4"}],
    [{text:"🌙 Fino a domani",   callback_data:"silence_12"},
     {text:"↩ Annulla",          callback_data:"show_menu"}],
  ],

  report: () => [
    [{text:"📊 Settimanale",      callback_data:"report_week"},
     {text:"📈 Sfida completa",   callback_data:"report_full"}],
    [{text:"📑 Esporta PDF",      callback_data:"report_pdf"},
     {text:"📧 Salva su Gmail",   callback_data:"report_gmail"}],
    [{text:"↩ Menu",              callback_data:"show_menu"}],
  ],

  back: (target="show_menu") => [[{text:"↩ Menu", callback_data:target}]],
};

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE SERVICE ACCOUNT JWT
// ═══════════════════════════════════════════════════════════════════════

async function getGoogleToken(env, extraScope="") {
  try {
    const cacheKey = extraScope ? "google_sa_token_docs" : "google_sa_token";
    const cached = await env.KV.get(cacheKey);
    if(cached){ const t=JSON.parse(cached); if(Date.now()<t.expires_at-60000) return t.access_token; }

    const raw = await env.KV.get("google_service_account");
    if(!raw) return null;
    const sa = JSON.parse(raw);

    const now = Math.floor(Date.now()/1000);
    const enc = (o) => btoa(JSON.stringify(o)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
    ];
    const header  = enc({alg:"RS256",typ:"JWT"});
    const payload = enc({iss:sa.client_email, sub:"me@soliwkr.pro", scope:scopes.join(" "), aud:"https://oauth2.googleapis.com/token", exp:now+3600, iat:now});
    const sigInput = `${header}.${payload}`;
    // Handle both formats: actual \n chars (from JSON.parse) and literal \\n escapes
    const pemRaw = sa.private_key.replace(/\\n/g, "\n");
    const pemLines = pemRaw.split("\n").filter(l=>l&&!l.startsWith("---"));
    const keyBytes = Uint8Array.from(atob(pemLines.join("")),c=>c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey("pkcs8",keyBytes.buffer,{name:"RSASSA-PKCS1-v1_5",hash:{name:"SHA-256"}},false,["sign"]);
    const sigBytes = await crypto.subtle.sign("RSASSA-PKCS1-v1_5",cryptoKey,new TextEncoder().encode(sigInput));
    const sig64 = btoa(String.fromCharCode(...new Uint8Array(sigBytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
    const jwt = `${sigInput}.${sig64}`;

    const res = await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})});
    const data = await res.json();
    if(!data.access_token){ console.error("SA token error:",JSON.stringify(data)); return null; }
    await env.KV.put(cacheKey,JSON.stringify({access_token:data.access_token,expires_at:Date.now()+data.expires_in*1000}),{expirationTtl:3500});
    return data.access_token;
  } catch(e) { console.error("getGoogleToken failed:", e.message); return null; }
}

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE APIs
// ═══════════════════════════════════════════════════════════════════════

async function getCalendarEvents(env, dateStr) {
  try {
    const token = await getGoogleToken(env);
    if(!token) return [];
    const tMin = encodeURIComponent(`${dateStr}T00:00:00+02:00`);
    const tMax = encodeURIComponent(`${dateStr}T23:59:59+02:00`);
    const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${tMin}&timeMax=${tMax}&singleEvents=true&orderBy=startTime`,{headers:{Authorization:`Bearer ${token}`}});
    if(!r.ok) { console.error("Calendar error:", r.status, await r.text()); return []; }
    const d = await r.json();
    return (d.items||[]).map(e=>({title:e.summary||"—",start:e.start?.dateTime?.split("T")[1]?.slice(0,5)||e.start?.date||""}));
  } catch(e) { console.error("getCalendarEvents failed:", e.message); return []; }
}

async function createCalendarEvent(env,{title,date,startTime,endTime,description=""}) {
  try {
    const token = await getGoogleToken(env); if(!token) return null;
    const r = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({summary:title,description,start:{dateTime:`${date}T${startTime}:00`,timeZone:"Europe/Rome"},end:{dateTime:`${date}T${endTime}:00`,timeZone:"Europe/Rome"}})});
    return r.ok;
  } catch(e) { console.error("createCalendarEvent failed:", e.message); return null; }
}

async function appendToSheet(env,values) {
  try {
    const sheetId = await env.KV.get("sfida60_sheets_id"); if(!sheetId) return;
    const token = await getGoogleToken(env); if(!token) return;
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Log!A:Z:append?valueInputOption=USER_ENTERED`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({values:[values]})});
  } catch(e) { console.error("appendToSheet failed:", e.message); }
}

async function createGmailDraft(env,{subject,body}) {
  try {
    const token = await getGoogleToken(env); if(!token) return;
    const email = [`To: me@soliwkr.pro`,`Subject: ${subject}`,`Content-Type: text/plain; charset=utf-8`,``,body].join("\r\n");
    const encoded = btoa(unescape(encodeURIComponent(email))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
    await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({message:{raw:encoded}})});
  } catch(e) { console.error("createGmailDraft failed:", e.message); }
}

// ─── Google Drive — Foto del Giorno ──────────────────────────────────

async function uploadToDrive(env, fileData, fileName, mimeType) {
  try {
    const token = await getGoogleToken(env); if(!token) return null;

    let folderId = await env.KV.get("sfida60_drive_folder");
    if (!folderId) {
      const searchR = await fetch(`https://www.googleapis.com/drive/v3/files?q=name%3D'Sfida60_Foto'%20and%20mimeType%3D'application/vnd.google-apps.folder'%20and%20trashed%3Dfalse`,{headers:{Authorization:`Bearer ${token}`}});
      const searchD = await searchR.json();
      if (searchD.files?.length) {
        folderId = searchD.files[0].id;
      } else {
        const createR = await fetch("https://www.googleapis.com/drive/v3/files",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({name:"Sfida60_Foto",mimeType:"application/vnd.google-apps.folder"})});
        const createD = await createR.json();
        folderId = createD.id;
      }
      if (folderId) await env.KV.put("sfida60_drive_folder", folderId);
    }

    const metadata = JSON.stringify({name: fileName, parents: folderId ? [folderId] : []});
    const boundary = "sfida60boundary" + Date.now();
    const body =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n${fileData}\r\n` +
      `--${boundary}--`;

    const r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",{
      method:"POST",
      headers:{Authorization:`Bearer ${token}`,"Content-Type":`multipart/related; boundary=${boundary}`},
      body
    });
    const d = await r.json();
    return d.webViewLink || (d.id ? `https://drive.google.com/file/d/${d.id}/view` : null);
  } catch(e) { console.error("uploadToDrive failed:", e.message); return null; }
}

// ─── Google Docs — Daily Log ──────────────────────────────────────────

async function appendDailyLog(env, idx, data) {
  try {
    const token = await getGoogleToken(env);
    if(!token) return;

    const { morning, evening, dayData, analysis, calSummary, allData, predictiveNote } = data;
    const pct   = pctOf(dayData);
    const done  = SCHEDULE.filter(s=>dayData.items?.[s.id]).map(s=>s.label);
    const miss  = SCHEDULE.filter(s=>!dayData.items?.[s.id]).map(s=>s.label);
    const stars = pct>=90?"★★★★★":pct>=70?"★★★★☆":pct>=50?"★★★☆☆":pct>=30?"★★☆☆☆":"★☆☆☆☆";

    const phase = getPhase(idx);
    const vuln = detectActiveVulnerability(allData||{}, idx);
    const scarto = pct >= 80 ? "SOPRA" : pct >= 60 ? "ALLINEATO" : "SOTTO";

    const divider = "\n" + "─".repeat(60) + "\n";

    const entry = [
      divider,
      `GIORNO ${idx+1}/60  —  ${formatDay(idx,true).toUpperCase()}  —  ${dateISO(idx)}`,
      `Performance: ${pct}%  ${stars}  ${medal(pct)}`,
      `Agenda: ${calSummary||"—"}`,
      "",
      "▸ MATTINA — Check-in",
      `  Obiettivo dichiarato : ${morning?.a1||"—"}`,
      `  Rischio identificato : ${morning?.a2||"—"}`,
      `  Energia fisica       : ${morning?.energy||"—"}/5`,
      "",
      "▸ COMPLETAMENTO",
      `  Completati (${done.length}/17) : ${done.join(", ")||"nessuno"}`,
      `  Saltati (${miss.length})       : ${miss.join(", ")||"nessuno"}`,
      `  Attività pomeriggio  : ${dayData.activity||"—"}`,
      `  Note personali       : ${dayData.note||"—"}`,
      `  Peso                 : ${dayData.weight ? dayData.weight + " kg" : "—"}`,
      "",
      "▸ SERA — Esame di Coscienza",
      `  Obiettivo raggiunto  : ${evening?.a1||"—"}`,
      `  Deviazione           : ${evening?.a2||"—"}`,
      `  Prep Boot domani     : ${evening?.a3||"—"}`,
      "",
      "▸ VALUTAZIONE MARCO",
      analysis||"—",
      "",
      "▸ ALLINEAMENTO CON PREVISIONE",
      `  Fase attuale: ${phase.name} (G${phase.range[0]+1}-${phase.range[1]+1})`,
      `  Previsione: ${phase.prediction}`,
      `  Realtà: ${pct}% completamento`,
      `  Scarto: ${scarto}`,
      `  Vulnerabilità attiva: ${vuln ? vuln.name + " — " + vuln.desc : "nessuna rilevata"}`,
      `  Nota Marco: ${predictiveNote||"—"}`,
      "",
    ].join("\n");

    const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${DOC_ID}`,{headers:{Authorization:`Bearer ${token}`}});
    const doc = await docRes.json();
    const endIndex = doc.body?.content?.slice(-1)[0]?.endIndex || 2;

    const batch = {requests:[
      {insertText:{location:{index:endIndex-1},text:entry}},
      {updateParagraphStyle:{
        range:{startIndex:endIndex-1, endIndex:endIndex-1+divider.length+`GIORNO ${idx+1}/60  —  ${formatDay(idx,true).toUpperCase()}  —  ${dateISO(idx)}`.length+1},
        paragraphStyle:{namedStyleType:"HEADING_2"},
        fields:"namedStyleType"
      }},
      {updateTextStyle:{
        range:{startIndex:endIndex-1+divider.length, endIndex:endIndex-1+divider.length+`GIORNO ${idx+1}/60`.length},
        textStyle:{bold:true,foregroundColor:{color:{rgbColor:{red:0.1,green:0.1,blue:0.5}}}},
        fields:"bold,foregroundColor"
      }},
    ]};

    await fetch(`https://docs.googleapis.com/v1/documents/${DOC_ID}:batchUpdate`,{
      method:"POST",
      headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
      body:JSON.stringify(batch)
    });
  } catch(e) { console.error("appendDailyLog failed:", e.message); }
}

// ═══════════════════════════════════════════════════════════════════════
// AIRTABLE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════

async function syncToAirtable(env, idx, dayData, conv) {
  try {
    const airtableToken = await env.KV.get("sfida60_airtable_token");
    const airtableBase  = await env.KV.get("sfida60_airtable_base");
    if (!airtableToken || !airtableBase) return;

    const pct = pctOf(dayData);
    const phase = getPhase(idx);
    const done = SCHEDULE.filter(s=>dayData.items?.[s.id]).map(s=>s.label).join(", ");
    const missed = SCHEDULE.filter(s=>!dayData.items?.[s.id]).map(s=>s.label).join(", ");

    const fields = {
      "Giorno": idx+1,
      "Data": dateISO(idx),
      "Fase": phase.name,
      "Percentuale": pct,
      "Completati": done || "nessuno",
      "Saltati": missed || "nessuno",
      "Attivita": dayData.activity || "",
      "Note": dayData.note || "",
      "Peso": dayData.weight ? parseFloat(dayData.weight) : null,
      "Obiettivo": conv?.morning?.a1 || "",
      "Rischio": conv?.morning?.a2 || "",
      "Energia": conv?.morning?.energy ? parseInt(conv.morning.energy) : null,
      "Raggiunto": conv?.evening?.a1 || "",
      "Deviazione": conv?.evening?.a2 || "",
      "BootDomani": conv?.evening?.a3 || "",
    };

    const filterFormula = encodeURIComponent(`{Giorno}=${idx+1}`);
    const existingR = await fetch(`https://api.airtable.com/v0/${airtableBase}/Sfida60?filterByFormula=${filterFormula}&maxRecords=1`,{
      headers:{Authorization:`Bearer ${airtableToken}`}
    });
    const existing = await existingR.json();

    if (existing.records?.length) {
      await fetch(`https://api.airtable.com/v0/${airtableBase}/Sfida60/${existing.records[0].id}`,{
        method:"PATCH",
        headers:{Authorization:`Bearer ${airtableToken}`,"Content-Type":"application/json"},
        body:JSON.stringify({fields})
      });
    } else {
      await fetch(`https://api.airtable.com/v0/${airtableBase}/Sfida60`,{
        method:"POST",
        headers:{Authorization:`Bearer ${airtableToken}`,"Content-Type":"application/json"},
        body:JSON.stringify({records:[{fields}]})
      });
    }
  } catch(e) { console.error("syncToAirtable failed:", e.message); }
}

// ═══════════════════════════════════════════════════════════════════════
// PREGHIERA DEL GIORNO
// ═══════════════════════════════════════════════════════════════════════

async function getPreghieraDelGiorno(env, idx) {
  try {
    const phase = getPhase(idx);
    const dayDate = new Date(START_DATE.getTime() + idx * 86400000);
    const dayOfWeek = dayDate.toLocaleDateString("it-IT",{weekday:"long"});

    const prompt = `Genera una breve lettura spirituale per il giorno ${idx+1}/60 della sfida.
Giorno: ${dayOfWeek}.
Fase: ${phase.name} — ${phase.focus}.
Contesto: Chris segue Fourth Way + cattolicesimo. Messa e Compieta non negoziabili.
Genera: un versetto biblico pertinente (1 riga, con riferimento) + una riflessione di 2 righe che colleghi il versetto alla fase di oggi.
Tono: contemplativo ma diretto. Niente devozionale zuccheroso. Max 80 parole.`;

    return await askGemini(env.GEMINI_API_KEY, marcoSystem(), prompt, 200);
  } catch(e) { console.error("getPreghieraDelGiorno failed:", e.message); return null; }
}

// ═══════════════════════════════════════════════════════════════════════
// PREDICTIVE ALERTS — Messaggi Fuori Programma
// ═══════════════════════════════════════════════════════════════════════

async function checkPredictiveAlerts(env, idx, all) {
  try {
    const phase = getPhase(idx);
    const alerts = [];

    if (phase.id >= 2) {
      let bootMissed = 0;
      for (let i=Math.max(0,idx-1); i<=idx; i++) {
        if (!all[`day_${i}`]?.items?.sveglia) bootMissed++;
      }
      if (bootMissed >= 2) {
        alerts.push({type:"boot_missed",
          msg:`⚠️ *Pattern rilevato — ${phase.name}*\n━━━━━━━━━━━━━━━━━━━━━━\nBoot saltato ${bootMissed} giorni. La sveglia è il primo item a cadere — Marco lo aveva previsto. Domani: 05:50, non negoziabile.`});
      }
    }

    if (phase.id >= 3) {
      let low = 0;
      for (let i=Math.max(0,idx-2); i<=idx; i++) {
        if (pctOf(all[`day_${i}`]) < 50) low++;
      }
      if (low >= 3) {
        alerts.push({type:"critical_low",
          msg:`🔴 *ALLARME CRITICO — ${phase.name}*\n━━━━━━━━━━━━━━━━━━━━━━\n${low} giorni sotto 50%. La sfida è a rischio. Marco richiede intervento. Quali 3 item completi OGGI senza eccezioni?`});
      }
    }

    let perfectStreak = 0;
    for (let i=idx; i>=Math.max(0,idx-6); i--) {
      if (pctOf(all[`day_${i}`]) === 100) perfectStreak++;
      else break;
    }
    if (perfectStreak >= 5) {
      alerts.push({type:"perfect_streak",
        msg:`🏆 *${perfectStreak} giorni al 100%*\n━━━━━━━━━━━━━━━━━━━━━━\nNon è entusiasmo — è disciplina. Marco lo registra. Non fermarti.`});
    }

    for (const alert of alerts) {
      const lastAlert = await env.KV.get(`sfida60_alert_${alert.type}_${idx}`);
      if (!lastAlert) {
        await tg(env.TELEGRAM_TOKEN, alert.msg);
        await env.KV.put(`sfida60_alert_${alert.type}_${idx}`, "sent", {expirationTtl: 86400});
      }
    }

    return alerts;
  } catch(e) { console.error("checkPredictiveAlerts failed:", e.message); return []; }
}

async function checkDeviationAlarm(env) {
  try {
    const idx = getDayIndex();
    if (idx < 2) return;

    const all = await kv.getData(env);
    let bootMissed = 0;
    for (let i=Math.max(0,idx-2); i<idx; i++) {
      if (!all[`day_${i}`]?.items?.sveglia) bootMissed++;
    }

    if (bootMissed >= 2) {
      const phase = getPhase(idx);
      const lastAlert = await env.KV.get(`sfida60_dev_alarm_${idx}`);
      if (lastAlert) return;

      const msg = await askGemini(env.GEMINI_API_KEY, marcoSystem(`G${idx+1}, Fase: ${phase.name}. Boot saltato ${bootMissed}/2 giorni. Ora: 08:00.`),
        `Allarme deviazione. Boot saltato ${bootMissed} giorni. Pattern previsto. 3 righe max. Chiudi con un ordine concreto.`, 150);
      await tg(env.TELEGRAM_TOKEN, `⚠️ *Allarme Deviazione — G${idx+1}*\n━━━━━━━━━━━━━━━━━━━━━━\n${msg}`);
      await env.KV.put(`sfida60_dev_alarm_${idx}`, "sent", {expirationTtl: 86400});
    }
  } catch(e) { console.error("checkDeviationAlarm failed:", e.message); }
}

// ═══════════════════════════════════════════════════════════════════════
// PREDICTIVE CALENDAR BRIEFING (sera per G+1)
// ═══════════════════════════════════════════════════════════════════════

async function createPredictiveBriefing(env, idx) {
  try {
    const tomorrow = idx + 1;
    if (tomorrow >= TOTAL_DAYS) return;

    const all = await kv.getData(env);
    const phase = getPhase(tomorrow);
    const vuln = detectActiveVulnerability(all, idx);
    const pct = pctOf(all[`day_${idx}`]);
    const avg = weekAvg(all, idx);

    const briefingPrompt = `Briefing predittivo per G${tomorrow+1} — ${phase.name}.
Oggi G${idx+1}: ${pct}%. Media 7gg: ${avg}%.
Vulnerabilità attiva: ${vuln?.name||"nessuna"}.
Genera: 3-4 righe per Calendar di domani. Includi: cosa Marco prevede, dato di oggi, una sfida/domanda. Tono PM senior. Max 100 parole.`;

    const briefingText = await askGemini(env.GEMINI_API_KEY, marcoSystem(), briefingPrompt, 250);

    await createCalendarEvent(env, {
      title: `⚔️ G${tomorrow+1} — ${phase.name}`,
      date: dateISO(tomorrow),
      startTime: "05:45",
      endTime: "06:00",
      description: [
        `${phase.emoji} Fase: ${phase.name}`,
        `Focus: ${phase.focus}`,
        `Ieri: ${pct}% | Media: ${avg}%`,
        `Vulnerabilità: ${vuln?.name||"—"}`,
        ``,
        briefingText,
      ].join("\n"),
    });
  } catch(e) { console.error("createPredictiveBriefing failed:", e.message); }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT PDF SETTIMANALE
// ═══════════════════════════════════════════════════════════════════════

async function generateWeeklyPDF(env, idx, all) {
  try {
    const token = await getGoogleToken(env); if(!token) return null;
    const weekStart = Math.max(0, idx-6);
    const weekNum = Math.ceil((idx+1)/7);
    const phase = getPhase(idx);

    const weekData = [];
    for (let i=weekStart; i<=idx; i++) {
      const d = all[`day_${i}`]||{};
      weekData.push({day:i+1, date:dateISO(i), pct:pctOf(d), activity:d.activity||"—", weight:d.weight||"—"});
    }
    const avg = Math.round(weekData.reduce((a,b)=>a+b.pct,0)/weekData.length);
    const perfect = weekData.filter(d=>d.pct===100).length;
    const {score} = calculateScore(all, idx);

    const reportText = [
      `SFIDA 60 GIORNI — REPORT SETTIMANA ${weekNum}`,
      `${"═".repeat(50)}`,
      `Periodo: G${weekStart+1} → G${idx+1} (${dateISO(weekStart)} — ${dateISO(idx)})`,
      `Fase: ${phase.name} — ${phase.focus}`,
      ``,
      `SOMMARIO`,
      `  Media: ${avg}%`,
      `  Giorni al 100%: ${perfect}/${weekData.length}`,
      `  Punteggio cumulativo: ${score}`,
      ``,
      `DETTAGLIO GIORNALIERO`,
      ...weekData.map(d=> `  G${d.day} (${d.date}): ${d.pct}% ${medal(d.pct)} | ${d.activity} | Peso: ${d.weight}`),
      ``,
      `ANALISI PER BLOCCO`,
      ...Object.entries(BLOCK_LABELS).map(([block,meta]) => {
        const items = SCHEDULE.filter(s=>s.block===block);
        let done=0, total=0;
        for (let i=weekStart; i<=idx; i++) {
          const d = all[`day_${i}`]||{};
          items.forEach(s => { total++; if(d.items?.[s.id]) done++; });
        }
        return `  ${meta.icon} ${meta.title}: ${total>0?Math.round(done/total*100):0}%`;
      }),
      ``,
      `${"═".repeat(50)}`,
      `Generato da Marco — ${new Date().toISOString()}`,
    ].join("\n");

    const createR = await fetch("https://docs.googleapis.com/v1/documents",{
      method:"POST",
      headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
      body:JSON.stringify({title:`Sfida60_W${weekNum}_Report_${dateISO(idx)}`})
    });
    const newDoc = await createR.json();
    if (!newDoc.documentId) return null;

    await fetch(`https://docs.googleapis.com/v1/documents/${newDoc.documentId}:batchUpdate`,{
      method:"POST",
      headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
      body:JSON.stringify({requests:[{insertText:{location:{index:1},text:reportText}}]})
    });

    const pdfR = await fetch(`https://www.googleapis.com/drive/v3/files/${newDoc.documentId}/export?mimeType=application/pdf`,{
      headers:{Authorization:`Bearer ${token}`}
    });

    if (!pdfR.ok) { console.error("PDF export failed:", pdfR.status); return null; }
    const pdfBuffer = await pdfR.arrayBuffer();
    const pdfBytes = new Uint8Array(pdfBuffer);
    let binary = "";
    for (let i = 0; i < pdfBytes.byteLength; i++) binary += String.fromCharCode(pdfBytes[i]);
    const pdfBase64 = btoa(binary);

    const link = await uploadToDrive(env, pdfBase64, `Sfida60_W${weekNum}_${dateISO(idx)}.pdf`, "application/pdf");

    await fetch(`https://www.googleapis.com/drive/v3/files/${newDoc.documentId}`,{
      method:"DELETE", headers:{Authorization:`Bearer ${token}`}
    });

    return link;
  } catch(e) { console.error("generateWeeklyPDF failed:", e.message); return null; }
}

// ═══════════════════════════════════════════════════════════════════════
// PUBLIC ACCOUNTABILITY (canale pubblico)
// ═══════════════════════════════════════════════════════════════════════

async function postPublicAccountability(env, idx, all) {
  try {
    const publicChannel = await env.KV.get("sfida60_public_channel");
    if (!publicChannel) return;

    const start = Math.max(0,idx-6);
    const week = Array.from({length:idx-start+1},(_,i)=>({day:start+i+1,pct:pctOf(all[`day_${start+i}`])}));
    const avg = Math.round(week.reduce((a,b)=>a+b.pct,0)/week.length);
    const perfect = week.filter(d=>d.pct===100).length;
    const phase = getPhase(idx);

    const msg = [
      `*Sfida 60 Giorni · Settimana ${Math.ceil((idx+1)/7)}*`,
      `${phase.emoji} Fase: _${phase.name}_`,
      ``,
      `Media: ${avg}% ${medal(avg)}`,
      `Giorni al 100%: ${perfect}/${week.length}`,
      ``,
      "```",
      week.map(d=>`G${d.day} ${bar(d.pct)} ${d.pct}%`).join("\n"),
      "```",
      ``,
      `_Aggiornato automaticamente da Marco._`
    ].join("\n");

    await tgCall(env.TELEGRAM_TOKEN, "sendMessage", {
      chat_id: publicChannel,
      text: msg,
      parse_mode: "Markdown"
    });
  } catch(e) { console.error("postPublicAccountability failed:", e.message); }
}

// ═══════════════════════════════════════════════════════════════════════
// GEMINI
// ═══════════════════════════════════════════════════════════════════════

async function askGemini(apiKey, system, prompt, maxTokens=400) {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:system}]},
        contents:[{role:"user",parts:[{text:prompt}]}],
        generationConfig:{
          maxOutputTokens:maxTokens,
          temperature:0.85,
          thinkingConfig:{thinkingBudget:0},
        },
      })
    });
    const d = await r.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||"…";
  } catch(e) { console.error("askGemini failed:", e.message); return "…"; }
}

function marcoSystem(ctx="") {
  return `Sei Marco, coach personale di Chris — Sfida 60 Giorni Decompressione Cervello.
Ex McKinsey, PM senior. Diretto, dati-driven, aspettative alte. Zero scuse, zero banalità.
Conosce Fourth Way, cattolicesimo, Messa, Compieta. Esigente, non crudele.
Frasi corte. Memoria elefantina. Tu. Italiano.
Schema: Boot 06:00, Messa 07:30, Lavoro 09-14, Pranzo 15:00, Cena 20:30, No screen, Compieta, Letto 21:30.
Vulnerabilità note: (1) sindrome sistemista (2) over-engineering (3) dispersione (4) resistenza al ritmo.${ctx?"\n\nCONTESTO:\n"+ctx:""}`;
}

// ═══════════════════════════════════════════════════════════════════════
// TEXT BUILDERS
// ═══════════════════════════════════════════════════════════════════════

async function buildMenuText(env, idx) {
  if(idx<0) return `✦ *MARCO — Sfida 60 Giorni*\n━━━━━━━━━━━━━━━━━━━━━━\n_La sfida inizia lunedì 4 maggio 2026._\n\nSono pronto. Il sistema è pronto.\nTu?\n\n_Usa i bottoni qui sotto per navigare._`;
  const all = await kv.getData(env);
  const pct = pctOf(all[`day_${idx}`]||{});
  const tot = totalDone(all);
  const avg = weekAvg(all,idx);
  const t   = trend(all,idx);
  const phase = getPhase(idx);
  const {score, currentStreak} = calculateScore(all, idx);
  return [
    `✦ *MARCO — Giorno ${idx+1} di ${TOTAL_DAYS}*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📅 ${formatDay(idx,true)}`,
    `${phase.emoji} *${phase.name}* — _${phase.focus}_`,
    ``,
    `${bar(pct)} *${pct}%* ${medal(pct)}`,
    ``,
    `Settimana · Media: *${avg}%* ${t}`,
    `Sfida · Completi: *${tot}/${idx+1}*`,
    `🏅 Punteggio: *${score}*${currentStreak>=3?` · 🔥 Streak: ${currentStreak}`:""}`,
    ``,
    `_Seleziona un'azione:_`,
  ].join("\n");
}

function buildOggiText(idx, dayData) {
  const pct = pctOf(dayData);
  const phase = getPhase(idx);
  const lines = [
    `📅 *Giorno ${idx+1}/60 — ${formatDay(idx,true)}*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `${phase.emoji} *${phase.name}* — _${phase.headline.slice(0,60)}_`,
    `${bar(pct)} *${pct}%* ${medal(pct)}`,
    ``,
  ];
  for(const [block,meta] of Object.entries(BLOCK_LABELS)){
    const items = SCHEDULE.filter(s=>s.block===block);
    lines.push(`${meta.icon} *${meta.title}*`);
    items.forEach(s=>{
      const done = !!dayData.items?.[s.id];
      lines.push(`${done?"✅":"⬜"} ${s.emoji} ${s.label}`);
    });
    lines.push(``);
  }
  lines.push(`🌊 Attività: *${dayData.activity||"—"}*`);
  lines.push(`📝 Note: _${dayData.note||"nessuna"}_`);
  if (dayData.weight) lines.push(`⚖️ Peso: *${dayData.weight} kg*`);
  if (dayData.photoUrl) lines.push(`📸 [Foto del giorno](${dayData.photoUrl})`);
  return lines.join("\n");
}

async function buildStatoText(env, idx) {
  const all = await kv.getData(env);
  const pct = pctOf(all[`day_${idx}`]||{});
  const avg = weekAvg(all,idx);
  const tot = totalDone(all);
  const phase = getPhase(idx);
  const {score, currentStreak, bestStreak} = calculateScore(all, idx);
  const weekRows = [];
  for(let i=Math.max(0,idx-6);i<=idx;i++){
    const p=pctOf(all[`day_${i}`]);
    weekRows.push(`G${i+1} ${bar(p)} ${p}% ${medal(p)}`);
  }
  const comment = await askGemini(env.GEMINI_API_KEY,marcoSystem(),
    `Dashboard G${idx+1} (${phase.name}): oggi ${pct}%, media ${avg}%, completi ${tot}/${idx+1}, punteggio ${score}, streak ${currentStreak}. Tre righe: trend, punto critico, azione immediata. Zero incoraggiamento generico.`,150);
  return [
    `📊 *Dashboard — Giorno ${idx+1}/60*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `${phase.emoji} *${phase.name}*`,
    `Oggi:       ${bar(pct)} *${pct}%*`,
    `Settimana:  *${avg}%* · Completi: *${tot}/${idx+1}*`,
    `🏅 Score: *${score}* · 🔥 *${currentStreak}* · Best: *${bestStreak}*`,
    ``,
    `*Ultimi 7 giorni:*`,
    "```",
    weekRows.join("\n"),
    "```",
    ``,
    comment,
  ].join("\n");
}

function buildPunteggioText(all, idx) {
  const {score, currentStreak, bestStreak} = calculateScore(all, idx);
  const phase = getPhase(idx);
  const daysAbove70 = Array.from({length:idx+1},(_,i)=>pctOf(all[`day_${i}`])>=70?1:0).reduce((a,b)=>a+b,0);
  const daysAbove80 = Array.from({length:idx+1},(_,i)=>pctOf(all[`day_${i}`])>=80?1:0).reduce((a,b)=>a+b,0);
  const days100 = Array.from({length:idx+1},(_,i)=>pctOf(all[`day_${i}`])===100?1:0).reduce((a,b)=>a+b,0);

  return [
    `🏅 *Punteggio Cumulativo — G${idx+1}*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `${phase.emoji} ${phase.name}`,
    ``,
    `🔢 Score: *${score}*`,
    `🔥 Streak attuale: *${currentStreak}* gg`,
    `🏆 Best streak: *${bestStreak}* gg`,
    ``,
    `*Criteri di Successo (60gg):*`,
    `${daysAbove70>=40?"✅":"⬜"} Minimo: ${daysAbove70}/40 gg sopra 70%`,
    `${daysAbove80>=50?"✅":"⬜"} Target: ${daysAbove80}/50 gg sopra 80%`,
    `${days100>=45?"✅":"⬜"} Eccellenza: ${days100}/45 gg al 100%`,
    ``,
    `*Calcolo:*`,
    `_+1 per item · +10 per 100% · +5 streak 3+gg_`,
    `_+3 Boot completo · -5 sotto 50% · -10 giorno 0%_`,
  ].join("\n");
}

function buildFaseText(idx, all) {
  const phase = getPhase(idx);
  const vuln = detectActiveVulnerability(all, idx);
  const pct = pctOf(all[`day_${idx}`]||{});
  const avg = weekAvg(all, idx);
  const dayInPhase = idx - phase.range[0] + 1;
  const phaseLength = phase.range[1] - phase.range[0] + 1;

  return [
    `🔮 *Sistema Predittivo — G${idx+1}*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `${phase.emoji} *FASE ${phase.id}: ${phase.name}*`,
    `Giorno ${dayInPhase}/${phaseLength} di fase`,
    `Range: G${phase.range[0]+1} → G${phase.range[1]+1}`,
    ``,
    `📋 *Focus:* _${phase.focus}_`,
    ``,
    `💬 _${phase.headline}_`,
    ``,
    `📈 *Previsione Marco:*`,
    `_${phase.prediction}_`,
    ``,
    `📊 *Realtà oggi:* ${pct}% | Media 7gg: ${avg}%`,
    ``,
    vuln ? `⚠️ *Vulnerabilità attiva:*\n${vuln.name}\n_${vuln.desc}_` : "✅ Nessuna vulnerabilità critica rilevata",
  ].join("\n");
}

// ═══════════════════════════════════════════════════════════════════════
// MORNING / EVENING SESSIONS
// ═══════════════════════════════════════════════════════════════════════

async function startMorning(env) {
  try {
    const idx = getDayIndex();
    if(idx<0||idx>=TOTAL_DAYS) return;
    const all = await kv.getData(env);
    const prevConv = idx>0 ? await kv.getConv(env,idx-1) : null;
    const ypct = idx>0 ? pctOf(all[`day_${idx-1}`]) : null;
    const lastIntenzione = prevConv?.evening?.a3||null;
    const events = await getCalendarEvents(env,dateISO(idx));
    const calSummary = events.length ? events.map(e=>`${e.start} ${e.title}`).join(" · ") : "agenda libera";
    const phase = getPhase(idx);

    if(!events.some(e=>e.title?.includes("Boot")||e.title?.includes("Sfida60"))){
      await createCalendarEvent(env,{title:`⏰ Boot Sfida60 — G${idx+1}`,date:dateISO(idx),startTime:"06:00",endTime:"06:45",description:"Flessioni · preghiere · caffè · corda · addominali · ballo"});
      await createCalendarEvent(env,{title:"🙏 Compieta",date:dateISO(idx),startTime:"20:45",endTime:"21:00"});
    }

    // Preghiera del giorno
    const preghiera = await getPreghieraDelGiorno(env, idx);

    const ctx = `G${idx+1}/60 — ${formatDay(idx,true)} — FASE: ${phase.name}\nIeri: ${ypct!==null?ypct+"%":"primo giorno"}\n${lastIntenzione?`Intenzione dichiarata ieri sera: "${lastIntenzione}"`:"Prima sessione."}\nMedia 7gg: ${weekAvg(all,Math.max(0,idx-1))}%\nAgenda: ${calSummary}\nFocus fase: ${phase.focus}`;
    const msg = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),`Briefing mattutino. ${ypct!==null?`Ieri: ${ypct}%.`:""} ${lastIntenzione?`Hai promesso: "${lastIntenzione}". Inizia da lì.`:""} Fase: ${phase.name}. Prima domanda: risultato NON NEGOZIABILE di oggi. Max 90 parole.`,280);

    const morningMsg = [
      `☀️ *Buongiorno — Giorno ${idx+1}/60*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📅 ${formatDay(idx,true)}`,
      `${phase.emoji} *${phase.name}* — _${phase.focus}_`,
      `📆 ${calSummary}`,
    ];

    if (preghiera) {
      morningMsg.push(``, `🙏 *Lettura del giorno:*`, `_${preghiera}_`);
    }

    morningMsg.push(``, msg);

    await tg(env.TELEGRAM_TOKEN, morningMsg.join("\n"));
    await kv.setState(env,{step:"morning_q1",lastDay:idx,context:{calSummary,ypct}});
  } catch(e) { console.error("startMorning failed:", e.message); }
}

async function handleMorningAnswer(env, step, answer, idx) {
  try {
    const state = await kv.getState(env);
    const conv  = await kv.getConv(env,idx);

    if(step==="morning_q1"){
      conv.morning.a1=answer;
      const ack = await askGemini(env.GEMINI_API_KEY,marcoSystem(),`Obiettivo dichiarato: "${answer}". ACK secco 10 parole. Poi: seconda domanda — cosa rischia di farti uscire dallo schema oggi?`,120);
      await tg(env.TELEGRAM_TOKEN,ack);
      await kv.setConv(env,idx,conv); await kv.setState(env,{...state,step:"morning_q2"});

    } else if(step==="morning_q2"){
      conv.morning.a2=answer;
      const ack = await askGemini(env.GEMINI_API_KEY,marcoSystem(),`Rischio: "${answer}". ACK 10 parole. Poi: terza domanda — energia fisica stamattina, da 1 a 5.`,100);
      await tg(env.TELEGRAM_TOKEN,ack);
      await kv.setConv(env,idx,conv); await kv.setState(env,{...state,step:"morning_q3"});

    } else if(step==="morning_q3"){
      conv.morning.a3=answer;
      conv.morning.energy=answer.match(/[1-5]/)?.[0]||"?";
      const phase = getPhase(idx);
      const ctx=`Obiettivo: ${conv.morning.a1} | Rischio: ${conv.morning.a2} | Energia: ${conv.morning.energy}/5 | Agenda: ${state.context?.calSummary} | Fase: ${phase.name}`;
      const briefing = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),`Briefing finale. Schema del giorno + focus sull'obiettivo. Fase ${phase.name}: ${phase.focus}. Chiudi con una parola sola tipo "Vai." o "Muoviti." Max 100 parole.`,300);
      const all = await kv.getData(env);
      const pct = pctOf(all[`day_${idx}`]||{});
      await tg(env.TELEGRAM_TOKEN,[
        `✦ *Briefing Giorno ${idx+1}*`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        briefing,
      ].join("\n"), kb.main(pct));
      await appendToSheet(env,[dateISO(idx),`G${idx+1}`,"morning",conv.morning.a1,conv.morning.a2,conv.morning.energy,"","","",pct,phase.name]);
      await kv.setConv(env,idx,conv); await kv.setState(env,{...state,step:"morning_done"});
    }
  } catch(e) { console.error("handleMorningAnswer failed:", e.message); }
}

async function startEvening(env) {
  try {
    const idx = getDayIndex();
    if(idx<0||idx>=TOTAL_DAYS) return;
    const all = await kv.getData(env);
    const dayData = all[`day_${idx}`]||{};
    const pct = pctOf(dayData);
    const conv = await kv.getConv(env,idx);
    const goal = conv.morning?.a1||null;
    const missed = SCHEDULE.filter(s=>!dayData.items?.[s.id]).map(s=>s.label);
    const phase = getPhase(idx);
    const ctx = `G${idx+1} (${phase.name}): ${pct}% | Obiettivo: ${goal||"—"} | Mancanti: ${missed.join(", ")||"nessuno"} | Settimana: ${weekAvg(all,idx)}%`;
    const msg = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),`Apertura serale. ${pct}% oggi. Fase ${phase.name}. ${goal?`Obiettivo dichiarato: "${goal}".`:""} 2 righe oneste. Poi prima domanda: l'obiettivo è stato raggiunto?`,220);
    await tg(env.TELEGRAM_TOKEN,[
      `🌙 *Giorno ${idx+1} — Esame di Coscienza*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `${phase.emoji} *${phase.name}*`,
      `${bar(pct)} *${pct}%* ${medal(pct)}`,
      ``,
      msg,
    ].join("\n"));
    await kv.setState(env,{step:"evening_q1",lastDay:idx,context:{pct,goal,missed:missed.join(", "),calSummary:"—"}});
  } catch(e) { console.error("startEvening failed:", e.message); }
}

async function handleEveningAnswer(env, step, answer, idx) {
  try {
    const state = await kv.getState(env);
    const conv  = await kv.getConv(env,idx);

    if(step==="evening_q1"){
      conv.evening.a1=answer;
      const ack = await askGemini(env.GEMINI_API_KEY,marcoSystem(),`Obiettivo raggiunto: "${answer}". ACK onesto 15 parole. Poi: cosa ti ha fatto uscire dallo schema oggi?`,150);
      await tg(env.TELEGRAM_TOKEN,ack);
      await kv.setConv(env,idx,conv); await kv.setState(env,{...state,step:"evening_q2"});

    } else if(step==="evening_q2"){
      conv.evening.a2=answer;
      const ack = await askGemini(env.GEMINI_API_KEY,marcoSystem(),`Deviazione: "${answer}". ACK 10 parole. Poi: cosa prepari stasera per non fallire il Boot di domani?`,120);
      await tg(env.TELEGRAM_TOKEN,ack);
      await kv.setConv(env,idx,conv); await kv.setState(env,{...state,step:"evening_q3"});

    } else if(step==="evening_q3"){
      conv.evening.a3=answer;
      const all = await kv.getData(env);
      const phase = getPhase(idx);
      const vuln = detectActiveVulnerability(all, idx);
      const ctx = `Oggi: ${state.context?.pct}% | Fase: ${phase.name} | Raggiunto: ${conv.evening.a1} | Deviazione: ${conv.evening.a2} | Domani: ${answer} | Settimana: ${weekAvg(all,idx)}% | Vulnerabilità: ${vuln?.name||"nessuna"}`;
      const analysis = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),`Esame di coscienza. Dati alla mano. Fase ${phase.name}. Pattern se esiste. Confronta con previsione: ${phase.prediction}. Un'intenzione concreta per il Boot di domani. Max 130 parole.`,380);

      const predictiveNote = await askGemini(env.GEMINI_API_KEY,marcoSystem(),
        `Nota predittiva per G${idx+2}: fase ${phase.name}, oggi ${state.context?.pct}%, vulnerabilità ${vuln?.name||"nessuna"}. Una riga: cosa Marco si aspetta domani.`, 80);

      const pct = state.context?.pct||0;
      const {score} = calculateScore(all, idx);

      await tg(env.TELEGRAM_TOKEN,[
        `✦ *Analisi Giorno ${idx+1}*`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        analysis,
        ``,
        `🏅 Score: *${score}* · ${phase.emoji} ${phase.name}`,
        `📄 _Log aggiornato nel Dossier._`,
      ].join("\n"), kb.main(pct));

      const dayData = all[`day_${idx}`]||{};
      const calSummary = state.context?.calSummary||"—";
      await appendDailyLog(env, idx, { morning:conv.morning, evening:conv.evening, dayData, analysis, calSummary, allData:all, predictiveNote });
      await appendToSheet(env,[dateISO(idx),`G${idx+1}`,"evening",conv.evening.a1,conv.evening.a2,conv.evening.a3,"","","",pct,phase.name,score]);
      await syncToAirtable(env, idx, dayData, conv);
      await checkPredictiveAlerts(env, idx, all);
      await createPredictiveBriefing(env, idx);

      // Friday: weekly report + PDF + public accountability
      const dow = new Date().toLocaleDateString("it-IT",{weekday:"long",timeZone:"Europe/Rome"});
      if(dow==="venerdì") {
        await sendWeeklyReport(env,idx,all);
        const pdfLink = await generateWeeklyPDF(env, idx, all);
        if (pdfLink) await tg(env.TELEGRAM_TOKEN, `📑 *Report PDF settimanale*\n[Apri PDF](${pdfLink})`);
        await postPublicAccountability(env, idx, all);
      }

      let low=0; for(let i=Math.max(0,idx-1);i<=idx;i++) if(pctOf(all[`day_${i}`])<50) low++;
      if(low>=2) await createGmailDraft(env,{subject:`⚠️ Sfida60 — Alert: ${low} giorni sotto 50%`,body:`Marco ha rilevato ${low} giorni consecutivi sotto 50%.\n\nG${idx+1}: ${pct}%\nG${idx}: ${pctOf(all[`day_${idx-1}`])}%\n\nIntervento necessario.`});

      await kv.setConv(env,idx,conv); await kv.setState(env,{...state,step:"evening_done"});
    }
  } catch(e) { console.error("handleEveningAnswer failed:", e.message); }
}

// ═══════════════════════════════════════════════════════════════════════
// WEEKLY REPORT
// ═══════════════════════════════════════════════════════════════════════

async function sendWeeklyReport(env, idx, all) {
  try {
    const start = Math.max(0,idx-6);
    const week  = Array.from({length:idx-start+1},(_,i)=>({day:start+i+1,pct:pctOf(all[`day_${start+i}`]),date:formatDay(start+i)}));
    const avg   = Math.round(week.reduce((a,b)=>a+b.pct,0)/week.length);
    const perfect = week.filter(d=>d.pct===100).length;
    const phase = getPhase(idx);
    const {score} = calculateScore(all, idx);

    const weights = [];
    for (let i=start; i<=idx; i++) {
      const w = all[`day_${i}`]?.weight;
      if (w) weights.push({day:i+1, weight:parseFloat(w)});
    }
    const weightTrend = weights.length>=2 ?
      `Peso: ${weights[0].weight}→${weights[weights.length-1].weight} kg (${(weights[weights.length-1].weight-weights[0].weight)>0?"+":""}${(weights[weights.length-1].weight-weights[0].weight).toFixed(1)})` : "";

    const analysis = await askGemini(env.GEMINI_API_KEY,marcoSystem(),
      `Report W${Math.ceil((idx+1)/7)} G${start+1}-${idx+1} (${phase.name}):\n${week.map(d=>`G${d.day}: ${d.pct}%`).join("\n")}\nMedia: ${avg}% · Perfetti: ${perfect}/7 · Score: ${score}\nTotale: ${totalDone(all)}/60\n${weightTrend}\nAnalisi: trend, forza, critico, obiettivo settimana prossima. Max 180 parole.`,500);

    await tg(env.TELEGRAM_TOKEN,[
      `📊 *Report Settimana ${Math.ceil((idx+1)/7)} — G${start+1}→${idx+1}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `${phase.emoji} *${phase.name}*`,
      `Media: *${avg}%* ${medal(avg)} · Perfetti: *${perfect}/7*`,
      `🏅 Score: *${score}*`,
      weightTrend ? `⚖️ ${weightTrend}` : "",
      ``,
      "```",
      week.map(d=>`G${d.day} (${d.date}) ${bar(d.pct)} ${d.pct}%`).join("\n"),
      "```",
      ``,
      analysis,
    ].filter(Boolean).join("\n"),[[{text:"📑 PDF",callback_data:"report_pdf"},{text:"📧 Gmail",callback_data:"report_gmail"}],[{text:"↩ Menu",callback_data:"show_menu"}]]);

    await createGmailDraft(env,{subject:`Sfida60 · W${Math.ceil((idx+1)/7)} · ${phase.name} · ${avg}%`,body:`Report Settimana ${Math.ceil((idx+1)/7)} — ${phase.name}\n\n${analysis}\n\n${week.map(d=>`G${d.day} (${d.date}): ${d.pct}%`).join("\n")}\n\nMedia: ${avg}% | Perfetti: ${perfect}/7 | Score: ${score}\n${weightTrend}`});
  } catch(e) { console.error("sendWeeklyReport failed:", e.message); }
}

// ═══════════════════════════════════════════════════════════════════════
// CALLBACK HANDLER
// ═══════════════════════════════════════════════════════════════════════

async function handleCallback(env, cbq) {
  const data  = cbq.data;
  const msgId = cbq.message?.message_id;
  const realIdx = getDayIndex();
  const idx   = Math.max(0, realIdx);
  const all   = await kv.getData(env);
  const dayData = all[`day_${idx}`]||{};
  const pct   = pctOf(dayData);

  await answerCb(env.TELEGRAM_TOKEN, cbq.id);

  if(data==="show_menu"){
    const text = await buildMenuText(env,realIdx);
    return editMsg(env.TELEGRAM_TOKEN,msgId,text,kb.main(pct));
  }
  if(data==="show_oggi"){
    return editMsg(env.TELEGRAM_TOKEN,msgId,buildOggiText(idx,dayData),[[{text:"✅ Check-in",callback_data:"show_checkin"}],...kb.back()]);
  }
  if(data==="show_stato"){
    const text = await buildStatoText(env,idx);
    return editMsg(env.TELEGRAM_TOKEN,msgId,text,kb.back());
  }
  if(data==="show_checkin"){
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `✅ *Check-in — Giorno ${idx+1}*\n━━━━━━━━━━━━━━━━━━━━━━\n${bar(pct)} *${pct}%*\n\n_Tocca per spuntare o rimuovere:_`,
      kb.checkin(dayData.items||{}));
  }
  if(data.startsWith("check_")&&data!=="check_all"){
    const itemId=data.replace("check_","");
    const item=SCHEDULE.find(s=>s.id===itemId); if(!item) return;
    if(!all[`day_${idx}`]) all[`day_${idx}`]={items:{}};
    if(!all[`day_${idx}`].items) all[`day_${idx}`].items={};
    all[`day_${idx}`].items[itemId]=!all[`day_${idx}`].items[itemId];
    await kv.setData(env,all);
    const np=pctOf(all[`day_${idx}`]);
    await checkPredictiveAlerts(env, idx, all);
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `✅ *Check-in — Giorno ${idx+1}*\n━━━━━━━━━━━━━━━━━━━━━━\n${bar(np)} *${np}%*\n\n${item.emoji} *${item.label}* ${all[`day_${idx}`].items[itemId]?"✅ fatto":"⬜ rimosso"}`,
      kb.checkin(all[`day_${idx}`].items||{}));
  }
  if(data==="check_all"){
    if(!all[`day_${idx}`]) all[`day_${idx}`]={items:{}};
    SCHEDULE.forEach(s=>{all[`day_${idx}`].items[s.id]=true;});
    await kv.setData(env,all);
    await checkPredictiveAlerts(env, idx, all);
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `✅ *Giorno ${idx+1} — Completo*\n━━━━━━━━━━━━━━━━━━━━━━\n${"█".repeat(10)} *100%* 🏆\n\nTutto completato. Marco ne prende nota.`,
      kb.main(100));
  }
  if(data==="show_note"){
    await kv.setState(env,{...(await kv.getState(env)),step:"waiting_note",lastDay:idx});
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `📝 *Note — Giorno ${idx+1}*\n━━━━━━━━━━━━━━━━━━━━━━\nNota attuale: _${dayData.note||"nessuna"}_\n\nScrivi la tua nota come messaggio libero.`,
      kb.back());
  }
  if(data==="show_agenda"){
    const events = await getCalendarEvents(env,dateISO(idx));
    const list = events.length ? events.map(e=>`• *${e.title}* — ${e.start}`).join("\n") : "_Agenda libera oggi._";
    return editMsg(env.TELEGRAM_TOKEN,msgId,`📆 *Agenda ${formatDay(idx,true)}*\n━━━━━━━━━━━━━━━━━━━━━━\n${list}`,kb.back());
  }
  if(data==="show_report") return editMsg(env.TELEGRAM_TOKEN,msgId,`📋 *Report*\n━━━━━━━━━━━━━━━━━━━━━━\nScegli il tipo:`,kb.report());
  if(data==="report_week"){ await sendWeeklyReport(env,idx,all); return; }
  if(data==="report_full"){
    const rows=Array.from({length:idx+1},(_,i)=>`G${i+1} ${bar(pctOf(all[`day_${i}`]))} ${pctOf(all[`day_${i}`])}%`);
    return editMsg(env.TELEGRAM_TOKEN,msgId,[`📈 *Sfida Completa G1→${idx+1}*`,`━━━━━━━━━━━━━━━━━━━━━━`,`Media: *${weekAvg(all,idx)}%* · Completi: *${totalDone(all)}/${idx+1}*`,``,`\`\`\``,rows.join("\n"),`\`\`\``].join("\n"),kb.back("show_report"));
  }
  if(data==="report_gmail"){ await sendWeeklyReport(env,idx,all); return; }
  if(data==="report_pdf"){
    await tg(env.TELEGRAM_TOKEN, `⏳ _Generazione PDF in corso..._`);
    const link = await generateWeeklyPDF(env, idx, all);
    if (link) {
      return tg(env.TELEGRAM_TOKEN, `📑 *Report PDF Settimana ${Math.ceil((idx+1)/7)}*\n[Apri PDF](${link})`, kb.back());
    }
    return tg(env.TELEGRAM_TOKEN, `_Errore generazione PDF. Riprova._`, kb.back());
  }
  if(data==="show_silenzio") return editMsg(env.TELEGRAM_TOKEN,msgId,`🔇 *Silenzio Notifiche*\n━━━━━━━━━━━━━━━━━━━━━━\nPer quanto tempo?`,kb.silence());
  if(data.startsWith("silence_")){
    const ore=parseInt(data.replace("silence_",""));
    await env.KV.put("sfida60_silence_until",(Date.now()+ore*3600000).toString());
    const h=new Date(Date.now()+ore*3600000).toLocaleTimeString("it-IT",{timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit"});
    return editMsg(env.TELEGRAM_TOKEN,msgId,`🔇 *Silenzio attivo*\n━━━━━━━━━━━━━━━━━━━━━━\nNotifiche sospese per *${ore} ${ore===1?"ora":"ore"}*.\nRiprendo alle *${h}*.`,[[{text:"↩ Menu",callback_data:"show_menu"}]]);
  }
  if(data==="show_attivita") return editMsg(env.TELEGRAM_TOKEN,msgId,`🌊 *Attività Pomeriggio — G${idx+1}*\n━━━━━━━━━━━━━━━━━━━━━━\nCosa fai oggi?`,kb.activity());
  if(data.startsWith("activity_")){
    const act=ACTIVITIES.find(a=>a.id===data.replace("activity_",""));
    if(!all[`day_${idx}`]) all[`day_${idx}`]={};
    all[`day_${idx}`].activity=`${act.emoji} ${act.label}`;
    await kv.setData(env,all);
    return editMsg(env.TELEGRAM_TOKEN,msgId,`${act.emoji} *${act.label}* registrata per oggi.`,kb.main(pct));
  }

  // New callbacks
  if(data==="show_punteggio"){
    return editMsg(env.TELEGRAM_TOKEN,msgId,buildPunteggioText(all,idx),kb.back());
  }
  if(data==="show_fase"){
    return editMsg(env.TELEGRAM_TOKEN,msgId,buildFaseText(idx,all),kb.back());
  }
  if(data==="show_peso"){
    await kv.setState(env,{...(await kv.getState(env)),step:"waiting_weight",lastDay:idx});
    const lastWeight = dayData.weight || null;
    let prevWeight = null;
    for (let i=idx-1; i>=0; i--) {
      if (all[`day_${i}`]?.weight) { prevWeight = all[`day_${i}`].weight; break; }
    }
    return editMsg(env.TELEGRAM_TOKEN,msgId,[
      `⚖️ *Peso/Misure — G${idx+1}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      lastWeight ? `Oggi: *${lastWeight} kg*` : "_Non registrato oggi._",
      prevWeight ? `Ultimo: *${prevWeight} kg*` : "",
      ``,
      `Scrivi il tuo peso (es: _78.5_)`,
    ].filter(Boolean).join("\n"), kb.back());
  }
  if(data==="show_foto"){
    await kv.setState(env,{...(await kv.getState(env)),step:"waiting_photo",lastDay:idx});
    return editMsg(env.TELEGRAM_TOKEN,msgId,[
      `📸 *Foto del Giorno — G${idx+1}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      dayData.photoUrl ? `Foto attuale: [Apri](${dayData.photoUrl})` : "_Nessuna foto oggi._",
      ``,
      `Invia una foto come messaggio.`,
      `Verrà salvata su Drive nella cartella Sfida60_Foto.`,
    ].join("\n"), kb.back());
  }
}

// ═══════════════════════════════════════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════════════════════════════════════

async function handleCommand(env, cmd, args, idx) {
  const realIdx = getDayIndex();
  const all     = await kv.getData(env);
  const dayData = all[`day_${idx}`]||{};
  const pct     = pctOf(dayData);

  if(cmd==="start"||cmd==="menu"){
    await setBotCommands(env.TELEGRAM_TOKEN);
    const text = await buildMenuText(env,realIdx);
    return tg(env.TELEGRAM_TOKEN,text,kb.main(pct));
  }
  if(cmd==="oggi")   return tg(env.TELEGRAM_TOKEN,buildOggiText(idx,dayData),[[{text:"✅ Check-in",callback_data:"show_checkin"}],...kb.back()]);
  if(cmd==="check"){
    const itemId=findItemId(args.join(" ")); if(!itemId){return tg(env.TELEGRAM_TOKEN,`Non riconosco "${args.join(" ")}". Es: /check flessioni`);}
    if(!all[`day_${idx}`]) all[`day_${idx}`]={items:{}};
    if(!all[`day_${idx}`].items) all[`day_${idx}`].items={};
    all[`day_${idx}`].items[itemId]=true; await kv.setData(env,all);
    const item=SCHEDULE.find(s=>s.id===itemId);
    await checkPredictiveAlerts(env, idx, all);
    return tg(env.TELEGRAM_TOKEN,`${item.emoji} *${item.label}* ✓\n${bar(pctOf(all[`day_${idx}`]))} *${pctOf(all[`day_${idx}`])}%*`);
  }
  if(cmd==="agenda"){
    const events=await getCalendarEvents(env,dateISO(idx));
    const list=events.length?events.map(e=>`• *${e.title}* — ${e.start}`).join("\n"):"_Agenda libera._";
    return tg(env.TELEGRAM_TOKEN,`📆 *${formatDay(idx,true)}*\n━━━━━━━━━━━━━━━━━━━━━━\n${list}`,kb.back());
  }
  if(cmd==="stato"){
    const text=await buildStatoText(env,idx);
    return tg(env.TELEGRAM_TOKEN,text,kb.back());
  }
  if(cmd==="report") return tg(env.TELEGRAM_TOKEN,`📋 *Report*\n━━━━━━━━━━━━━━━━━━━━━━\nScegli:`,kb.report());

  // ─── New commands ───
  if(cmd==="peso"){
    const val = args[0]?.replace(",",".");
    if (val && !isNaN(parseFloat(val))) {
      if(!all[`day_${idx}`]) all[`day_${idx}`]={};
      all[`day_${idx}`].weight = val;
      await kv.setData(env, all);
      let prev = null;
      for (let i=idx-1; i>=0; i--) { if(all[`day_${i}`]?.weight) { prev = parseFloat(all[`day_${i}`].weight); break; } }
      const delta = prev ? (parseFloat(val)-prev) : null;
      return tg(env.TELEGRAM_TOKEN, [
        `⚖️ *Peso registrato: ${val} kg*`,
        delta !== null ? `${delta>0?"📈":"📉"} ${delta>0?"+":""}${delta.toFixed(1)} kg dal precedente` : "",
      ].filter(Boolean).join("\n"), kb.main(pct));
    }
    return tg(env.TELEGRAM_TOKEN, `⚖️ Uso: /peso 78.5`);
  }
  if(cmd==="foto"){
    await kv.setState(env,{...(await kv.getState(env)),step:"waiting_photo",lastDay:idx});
    return tg(env.TELEGRAM_TOKEN, `📸 *Foto del Giorno*\n━━━━━━━━━━━━━━━━━━━━━━\nInvia la foto come messaggio.`);
  }
  if(cmd==="punteggio"){
    return tg(env.TELEGRAM_TOKEN, buildPunteggioText(all, idx), kb.back());
  }
  if(cmd==="fase"){
    return tg(env.TELEGRAM_TOKEN, buildFaseText(idx, all), kb.back());
  }

  if(cmd==="silenzio"){
    const ore=parseInt(args[0])||0;
    if(ore>0){
      await env.KV.put("sfida60_silence_until",(Date.now()+ore*3600000).toString());
      const h=new Date(Date.now()+ore*3600000).toLocaleTimeString("it-IT",{timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit"});
      return tg(env.TELEGRAM_TOKEN,`🔇 Silenzio per *${ore}h*. Torno alle *${h}*.`);
    }
    return tg(env.TELEGRAM_TOKEN,`🔇 *Silenzio*\nPer quanto?`,kb.silence());
  }
  if(cmd==="setstart"){
    const date = args[0];
    if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      await env.KV.put("sfida60_start_date", date);
      START_DATE = new Date(date + "T00:00:00Z");
      return tg(env.TELEGRAM_TOKEN, `📆 Data inizio: *${date}*`);
    }
    return tg(env.TELEGRAM_TOKEN, `📆 Uso: /setstart 2026-05-04`);
  }
  if(cmd==="aiuto") return tg(env.TELEGRAM_TOKEN,[
    `✦ *Marco — Guida Comandi v5*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `/menu — 📱 Menu principale`,
    `/oggi — 📅 Stato giornata`,
    `/check [item] — ✅ Segna completato`,
    `/agenda — 📆 Calendar oggi`,
    `/stato — 📊 Dashboard`,
    `/report — 📋 Report settimanale`,
    `/peso [kg] — ⚖️ Registra peso`,
    `/foto — 📸 Foto del giorno`,
    `/punteggio — 🏅 Score cumulativo`,
    `/fase — 🔮 Fase predittiva`,
    `/silenzio [ore] — 🔇 Pausa`,
    ``,
    `_Invia foto/numero direttamente._`,
    ``,
    `[🌐 Tracker](${MINI_APP_URL}) · [📄 Dossier](https://docs.google.com/document/d/${DOC_ID}/edit)`,
  ].join("\n"),kb.back());
}

// ═══════════════════════════════════════════════════════════════════════
// FREE TEXT + PHOTO HANDLER
// ═══════════════════════════════════════════════════════════════════════

async function handleFreeText(env, text, idx) {
  const all     = await kv.getData(env);
  const dayData = all[`day_${idx}`]||{};
  const state   = await kv.getState(env);

  if(state.step==="waiting_note"){
    if(!all[`day_${idx}`]) all[`day_${idx}`]={};
    all[`day_${idx}`].note=text;
    await kv.setData(env,all); await kv.setState(env,{...state,step:null});
    return tg(env.TELEGRAM_TOKEN,`📝 *Nota salvata*\n_"${text}"_`,kb.main(pctOf(all[`day_${idx}`])));
  }

  if(state.step==="waiting_weight"){
    const val = text.replace(",",".").match(/[\d.]+/)?.[0];
    if (val && !isNaN(parseFloat(val))) {
      if(!all[`day_${idx}`]) all[`day_${idx}`]={};
      all[`day_${idx}`].weight = val;
      await kv.setData(env,all); await kv.setState(env,{...state,step:null});
      let prev = null;
      for (let i=idx-1; i>=0; i--) { if(all[`day_${i}`]?.weight) { prev = parseFloat(all[`day_${i}`].weight); break; } }
      const delta = prev ? (parseFloat(val)-prev) : null;
      return tg(env.TELEGRAM_TOKEN, [
        `⚖️ *Peso: ${val} kg*`,
        delta !== null ? `${delta>0?"📈":"📉"} ${delta>0?"+":""}${delta.toFixed(1)} kg` : "",
      ].filter(Boolean).join("\n"), kb.main(pctOf(all[`day_${idx}`])));
    }
    await kv.setState(env,{...state,step:null});
    return tg(env.TELEGRAM_TOKEN, `⚖️ Numero non valido. Es: _78.5_`);
  }

  const itemId=findItemId(text);
  const lc=text.toLowerCase();
  const isDone=lc.includes("fatto")||lc.includes("completato")||lc.includes("finito")||!!lc.match(/^(ho|l'ho|sì|si)/);
  if(itemId&&isDone){
    if(!all[`day_${idx}`]) all[`day_${idx}`]={items:{}};
    if(!all[`day_${idx}`].items) all[`day_${idx}`].items={};
    all[`day_${idx}`].items[itemId]=true; await kv.setData(env,all);
    const item=SCHEDULE.find(s=>s.id===itemId);
    const np=pctOf(all[`day_${idx}`]);
    await checkPredictiveAlerts(env, idx, all);
    return tg(env.TELEGRAM_TOKEN,`${item.emoji} *${item.label}* registrato.\n${bar(np)} *${np}%*`);
  }

  // Auto-detect weight (just a number like "78.5" or "78,5")
  const weightMatch = text.replace(",",".").match(/^\s*([\d]{2,3}(?:\.\d{1,2})?)\s*(?:kg)?\s*$/i);
  if (weightMatch) {
    const w = weightMatch[1];
    if(!all[`day_${idx}`]) all[`day_${idx}`]={};
    all[`day_${idx}`].weight = w;
    await kv.setData(env,all);
    return tg(env.TELEGRAM_TOKEN, `⚖️ *Peso: ${w} kg* registrato.`, kb.main(pctOf(all[`day_${idx}`])));
  }

  const phase = getPhase(idx);
  const ctx=`G${idx+1} (${phase.name}): ${pctOf(dayData)}% | Completati: ${SCHEDULE.filter(s=>dayData.items?.[s.id]).map(s=>s.label).join(", ")||"—"} | Attività: ${dayData.activity||"—"}`;
  const reply=await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),`Chris: "${text}"\nRispondi come Marco. Fase ${phase.name}. Max 100 parole.`,280);
  return tg(env.TELEGRAM_TOKEN,reply,kb.main(pctOf(dayData)));
}

async function handlePhoto(env, msg) {
  try {
    const idx = getDayIndex();
    const realIdx = Math.max(0, idx);

    const photos = msg.photo;
    const biggest = photos[photos.length - 1];
    const fileR = await tgCall(env.TELEGRAM_TOKEN, "getFile", {file_id: biggest.file_id});
    const filePath = fileR.result?.file_path;
    if (!filePath) { return tg(env.TELEGRAM_TOKEN, `_Errore: impossibile scaricare la foto._`); }

    const fileUrl = `https://api.telegram.org/file/bot${env.TELEGRAM_TOKEN}/${filePath}`;
    const fileResp = await fetch(fileUrl);
    const fileBuffer = await fileResp.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);
    let binary = "";
    for (let i = 0; i < fileBytes.byteLength; i++) binary += String.fromCharCode(fileBytes[i]);
    const base64 = btoa(binary);

    const ext = filePath.split(".").pop() || "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";
    const fileName = `G${realIdx+1}_${dateISO(realIdx)}_foto.${ext}`;

    const link = await uploadToDrive(env, base64, fileName, mimeType);

    const all = await kv.getData(env);
    if(!all[`day_${realIdx}`]) all[`day_${realIdx}`]={};
    all[`day_${realIdx}`].photoUrl = link;
    await kv.setData(env, all);

    const state = await kv.getState(env);
    if (state.step === "waiting_photo") await kv.setState(env, {...state, step:null});

    const caption = msg.caption || "";
    const ack = await askGemini(env.GEMINI_API_KEY, marcoSystem(`G${realIdx+1}. Chris ha inviato la foto del giorno${caption?` con caption: "${caption}"`:""}.`),
      `ACK foto del giorno. 15 parole max. Conferma salvataggio.${caption?` Commenta brevemente la caption.`:""}`, 80);

    return tg(env.TELEGRAM_TOKEN, [
      `📸 *Foto G${realIdx+1} salvata*`,
      link ? `[Apri su Drive](${link})` : "",
      ``,
      ack,
    ].filter(Boolean).join("\n"), kb.main(pctOf(all[`day_${realIdx}`])));
  } catch(e) {
    console.error("handlePhoto failed:", e.message);
    return tg(env.TELEGRAM_TOKEN, `_Errore foto: ${e.message?.slice(0,50)}_`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// WEBHOOK
// ═══════════════════════════════════════════════════════════════════════

async function processUpdate(body, env) {
  try {
    await loadStartDate(env);
    if(body.callback_query){
      const silence=await env.KV.get("sfida60_silence_until");
      if(silence&&Date.now()<parseInt(silence)){ await answerCb(env.TELEGRAM_TOKEN,body.callback_query.id); return; }
      await handleCallback(env,body.callback_query);
      return;
    }

    const msg=body?.message;
    if(!msg) return;

    const silence=await env.KV.get("sfida60_silence_until");
    if(silence&&Date.now()<parseInt(silence)) return;

    if (msg.photo) {
      await handlePhoto(env, msg);
      return;
    }

    if(!msg.text) return;

    const text=msg.text.trim();
    const realIdx=getDayIndex();
    const idx=Math.max(0,realIdx);
    const state=await kv.getState(env);

    const flowSteps=["morning_q1","morning_q2","morning_q3","evening_q1","evening_q2","evening_q3"];
    if(flowSteps.includes(state.step)&&state.lastDay===realIdx){
      if(state.step.startsWith("morning")) await handleMorningAnswer(env,state.step,text,realIdx);
      else await handleEveningAnswer(env,state.step,text,realIdx);
      return;
    }

    if(text.startsWith("/")){
      const parts=text.slice(1).split(" ");
      await handleCommand(env,parts[0].toLowerCase().split("@")[0],parts.slice(1),idx);
      return;
    }

    await handleFreeText(env,text,idx);
  } catch(e) {
    console.error("processUpdate error:", e.message, e.stack);
    try {
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({chat_id:CHAT_ID, text:`_[${e.message?.slice(0,80)||"errore"}]_`, parse_mode:"Markdown"})
      });
    } catch(e2) {}
  }
}

async function handleWebhook(request, env, ctx) {
  const body = await request.json();
  ctx.waitUntil(processUpdate(body, env));
  return new Response("ok", { status: 200 });
}

// ═══════════════════════════════════════════════════════════════════════
// HTTP ROUTER
// ═══════════════════════════════════════════════════════════════════════

const CORS={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":"Content-Type"
};
const json=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{...CORS,"Content-Type":"application/json"}});

async function handleRequest(request, env, ctx) {
  await loadStartDate(env);
  const url=new URL(request.url), path=url.pathname;
  if(request.method==="OPTIONS") return new Response(null,{headers:CORS});
  if(path==="/webhook"&&request.method==="POST") return handleWebhook(request,env,ctx);
  if(path==="/ping") return json({ok:true,day:getDayIndex()+1,total:TOTAL_DAYS,doc:DOC_ID,version:"v5-predictive"});
  if(path==="/data") return new Response(await env.KV.get("sfida60_data")||"{}",{headers:{...CORS,"Content-Type":"application/json"}});
  if(path==="/sync"&&request.method==="POST"){await env.KV.put("sfida60_data",JSON.stringify(await request.json()));return json({ok:true});}

  // Phase API for the app
  if(path==="/phase") {
    const idx = getDayIndex();
    const safeIdx = Math.max(0, idx);
    const phase = getPhase(safeIdx);
    const all = await kv.getData(env);
    const vuln = detectActiveVulnerability(all, safeIdx);
    const {score, currentStreak, bestStreak} = calculateScore(all, safeIdx);
    return json({
      phase: {
        id: phase.id, name: phase.name, focus: phase.focus,
        headline: phase.headline, prediction: phase.prediction,
        color: phase.color, emoji: phase.emoji,
        range: phase.range,
      },
      vulnerability: vuln,
      score, currentStreak, bestStreak,
      dayIndex: idx,
    });
  }

  // Scores API
  if(path==="/scores") {
    const idx = Math.max(0, getDayIndex());
    const all = await kv.getData(env);
    return json(calculateScore(all, idx));
  }

  // Weight history API
  if(path==="/weights") {
    const all = await kv.getData(env);
    const weights = [];
    for (let i=0; i<TOTAL_DAYS; i++) {
      if (all[`day_${i}`]?.weight) weights.push({day:i+1, date:dateISO(i), weight:parseFloat(all[`day_${i}`].weight)});
    }
    return json(weights);
  }

  if(path==="/test"&&request.method==="POST"){
    const idx=0, all=await kv.getData(env);
    const events=await getCalendarEvents(env,dateISO(idx));
    const calSummary=events.length?events.map(e=>`${e.start} ${e.title}`).join(" · "):"agenda libera";
    const phase = getPhase(idx);
    const msg=await askGemini(env.GEMINI_API_KEY,marcoSystem(`TEST G1 | Agenda: ${calSummary} | Fase: ${phase.name}`),`TEST sistema. Presentati come Marco brevemente e fai la prima domanda mattutina. Max 80 parole.`,250);
    await tg(env.TELEGRAM_TOKEN,[`☀️ *TEST — Giorno 1/60*`,`━━━━━━━━━━━━━━━━━━━━━━`,`${phase.emoji} *${phase.name}*`,`📆 ${calSummary}`,``,msg].join("\n"),kb.main(0));
    await kv.setState(env,{step:"morning_q1",lastDay:idx,context:{calSummary,ypct:null}});
    return json({ok:true,calendar_events:events.length,phase:phase.name});
  }
  if(path==="/test-morning"&&request.method==="POST"){await startMorning(env);return json({ok:true});}
  if(path==="/test-evening"&&request.method==="POST"){await startEvening(env);return json({ok:true});}
  if(path==="/test-alerts"&&request.method==="POST"){
    const idx=Math.max(0,getDayIndex()); const all=await kv.getData(env);
    const alerts = await checkPredictiveAlerts(env, idx, all);
    return json({ok:true, alerts});
  }
  if(path==="/test-pdf"&&request.method==="POST"){
    const idx=Math.max(0,getDayIndex()); const all=await kv.getData(env);
    const link = await generateWeeklyPDF(env, idx, all);
    return json({ok:true, link});
  }
  if(path==="/diag"&&request.method==="POST"){
    const diag = {};
    try {
      const raw = await env.KV.get("google_service_account");
      diag.kv = raw ? "OK" : "MISSING";
      if (!raw) return json(diag);
      const sa = JSON.parse(raw);
      diag.client_email = sa.client_email;
      const token = await getGoogleToken(env);
      diag.token = token ? "OK" : "FAIL";
      if (token) {
        const driveR = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {headers:{Authorization:`Bearer ${token}`}});
        diag.drive_status = driveR.status;
        const docR = await fetch("https://docs.googleapis.com/v1/documents",{
          method:"POST",
          headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
          body:JSON.stringify({title:"Sfida60_diag_test"})
        });
        diag.docs_status = docR.status;
        const docBody = await docR.json();
        if (docBody.documentId) {
          const pdfR = await fetch(`https://www.googleapis.com/drive/v3/files/${docBody.documentId}/export?mimeType=application/pdf`,{
            headers:{Authorization:`Bearer ${token}`}
          });
          diag.pdf_export_status = pdfR.status;
          diag.pdf_size = (await pdfR.arrayBuffer()).byteLength;
          await fetch(`https://www.googleapis.com/drive/v3/files/${docBody.documentId}`,{
            method:"DELETE", headers:{Authorization:`Bearer ${token}`}
          });
        }
      }
    } catch(e) { diag.error = e.message; }
    return json(diag);
  }
  if(path==="/test-deviation"&&request.method==="POST"){
    await checkDeviationAlarm(env);
    return json({ok:true});
  }
  if(path==="/test-briefing"&&request.method==="POST"){
    const idx = Math.max(0, getDayIndex());
    await createPredictiveBriefing(env, idx);
    return json({ok:true});
  }
  if(path==="/test-preghiera"&&request.method==="POST"){
    const idx = Math.max(0, getDayIndex());
    const p = await getPreghieraDelGiorno(env, idx);
    return json({ok:true, preghiera:p});
  }
  if(path==="/test-public"&&request.method==="POST"){
    const idx = Math.max(0, getDayIndex());
    const all = await kv.getData(env);
    await postPublicAccountability(env, idx, all);
    return json({ok:true});
  }
  if(path==="/setup-webhook"&&request.method==="POST"){
    const r=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/setWebhook`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:`https://sfida60-motivatore.soliwkr.workers.dev/webhook`,allowed_updates:["message","callback_query"],drop_pending_updates:true})});
    await setBotCommands(env.TELEGRAM_TOKEN);
    return json(await r.json());
  }
  if(path==="/setup-sheets"&&request.method==="POST"){const{sheetId}=await request.json();await env.KV.put("sfida60_sheets_id",sheetId);return json({ok:true});}
  if(path==="/setup-airtable"&&request.method==="POST"){
    const{token,baseId}=await request.json();
    await env.KV.put("sfida60_airtable_token",token);
    await env.KV.put("sfida60_airtable_base",baseId);
    return json({ok:true});
  }
  if(path==="/setup-public-channel"&&request.method==="POST"){
    const{channelId}=await request.json();
    await env.KV.put("sfida60_public_channel",channelId);
    return json({ok:true});
  }
  return new Response("✦ Marco — Sfida60 v5 — Predictive System",{headers:CORS});
}

// ═══════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

export default {
  async fetch(request,env,ctx){return handleRequest(request,env,ctx);},
  async scheduled(event,env,ctx){
    try {
      await loadStartDate(env);
      const silence=await env.KV.get("sfida60_silence_until");
      if(silence&&Date.now()<parseInt(silence)) return;

      if(event.cron==="5 4 * * *")  await startMorning(env);
      if(event.cron==="5 19 * * *") await startEvening(env);
      if(event.cron==="0 6 * * *")  await checkDeviationAlarm(env);
    } catch(e) { console.error("scheduled error:", e.message); }
  },
};

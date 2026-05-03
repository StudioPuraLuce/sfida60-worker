// ═══════════════════════════════════════════════════════════════════════
// MARCO — Sfida 60 Giorni · Coach Bot v4
// Inline Keyboards · Google Docs Log · Formattazione magistrale
// ═══════════════════════════════════════════════════════════════════════

const START_DATE   = new Date("2026-05-04T00:00:00Z");
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

// ─── Formatting helpers ───────────────────────────────────────────────

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
    {command:"silenzio", description:"🔇 Pausa notifiche — es. /silenzio 2"},
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
    [{text:"📧 Salva su Gmail",   callback_data:"report_gmail"},
     {text:"↩ Menu",             callback_data:"show_menu"}],
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
  const pemLines = sa.private_key.split("\\n").filter(l=>l&&!l.startsWith("---"));
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
  } catch(e) {
    console.error("getCalendarEvents failed:", e.message);
    return [];
  }
}

async function createCalendarEvent(env,{title,date,startTime,endTime,description=""}) {
  try {
    const token = await getGoogleToken(env); if(!token) return null;
    const r = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({summary:title,description,start:{dateTime:`${date}T${startTime}:00`,timeZone:"Europe/Rome"},end:{dateTime:`${date}T${endTime}:00`,timeZone:"Europe/Rome"}})});
    if(!r.ok) console.error("createCalendarEvent error:", r.status);
  } catch(e) { console.error("createCalendarEvent failed:", e.message); }
}

async function appendToSheet(env,values) {
  const sheetId = await env.KV.get("sfida60_sheets_id"); if(!sheetId) return;
  const token = await getGoogleToken(env); if(!token) return;
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Log!A:Z:append?valueInputOption=USER_ENTERED`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({values:[values]})});
}

async function createGmailDraft(env,{subject,body}) {
  const token = await getGoogleToken(env); if(!token) return;
  const email = [`To: me@soliwkr.pro`,`Subject: ${subject}`,`Content-Type: text/plain; charset=utf-8`,``,body].join("\r\n");
  const encoded = btoa(unescape(encodeURIComponent(email))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({message:{raw:encoded}})});
}

// ─── Google Docs — Daily Log ──────────────────────────────────────────

async function appendDailyLog(env, idx, data) {
  const token = await getGoogleToken(env);
  if(!token) return;

  const { morning, evening, dayData, analysis, calSummary } = data;
  const pct   = pctOf(dayData);
  const done  = SCHEDULE.filter(s=>dayData.items?.[s.id]).map(s=>s.label);
  const miss  = SCHEDULE.filter(s=>!dayData.items?.[s.id]).map(s=>s.label);
  const stars = pct>=90?"★★★★★":pct>=70?"★★★★☆":pct>=50?"★★★☆☆":pct>=30?"★★☆☆☆":"★☆☆☆☆";

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
    "",
    "▸ SERA — Esame di Coscienza",
    `  Obiettivo raggiunto  : ${evening?.a1||"—"}`,
    `  Deviazione           : ${evening?.a2||"—"}`,
    `  Prep Boot domani     : ${evening?.a3||"—"}`,
    "",
    "▸ VALUTAZIONE MARCO",
    analysis||"—",
    "",
  ].join("\n");

  // Get current doc length to append at end
  const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${DOC_ID}`,{headers:{Authorization:`Bearer ${token}`}});
  const doc = await docRes.json();
  const endIndex = doc.body?.content?.slice(-1)[0]?.endIndex || 2;

  const batch = {requests:[
    // Insert full entry text
    {insertText:{location:{index:endIndex-1},text:entry}},
    // Style the day header (first line of entry)
    {updateParagraphStyle:{
      range:{startIndex:endIndex-1, endIndex:endIndex-1+divider.length+`GIORNO ${idx+1}/60  —  ${formatDay(idx,true).toUpperCase()}  —  ${dateISO(idx)}`.length+1},
      paragraphStyle:{namedStyleType:"HEADING_2"},
      fields:"namedStyleType"
    }},
    // Bold the day title
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
}

// ═══════════════════════════════════════════════════════════════════════
// GEMINI
// ═══════════════════════════════════════════════════════════════════════

async function askGemini(apiKey, system, prompt, maxTokens=400) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:maxTokens,temperature:0.85}})
  });
  const d = await r.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||"…";
}

function marcoSystem(ctx="") {
  return `Sei Marco, coach personale di Chris — Sfida 60 Giorni Decompressione Cervello.
Ex McKinsey, PM senior. Diretto, dati-driven, aspettative alte. Zero scuse, zero banalità.
Conosce Fourth Way, cattolicesimo, Messa, Compieta. Esigente, non crudele.
Frasi corte. Memoria elefantina. Tu. Italiano.
Schema: Boot 06:00, Messa 07:30, Lavoro 09-14, Pranzo 15:00, Cena 20:30, No screen, Compieta, Letto 21:30.${ctx?"\n\nCONTESTO:\n"+ctx:""}`;
}

// ═══════════════════════════════════════════════════════════════════════
// TEXT BUILDERS — FORMATTAZIONE MAGISTRALE
// ═══════════════════════════════════════════════════════════════════════

async function buildMenuText(env, idx) {
  if(idx<0) return `✦ *MARCO — Sfida 60 Giorni*\n━━━━━━━━━━━━━━━━━━━━━━\n_La sfida inizia lunedì 4 maggio 2026._\n\nSono pronto. Il sistema è pronto.\nTu?\n\n_Usa i bottoni qui sotto per navigare._`;
  const all = await kv.getData(env);
  const pct = pctOf(all[`day_${idx}`]||{});
  const tot = totalDone(all);
  const avg = weekAvg(all,idx);
  const t   = trend(all,idx);
  return [
    `✦ *MARCO — Giorno ${idx+1} di ${TOTAL_DAYS}*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📅 ${formatDay(idx,true)}`,
    ``,
    `${bar(pct)} *${pct}%* ${medal(pct)}`,
    ``,
    `Settimana · Media: *${avg}%* ${t}`,
    `Sfida · Completi: *${tot}/${idx+1}*`,
    ``,
    `_Seleziona un'azione:_`,
  ].join("\n");
}

function buildOggiText(idx, dayData) {
  const pct = pctOf(dayData);
  const lines = [
    `📅 *Giorno ${idx+1}/60 — ${formatDay(idx,true)}*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
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
  return lines.join("\n");
}

async function buildStatoText(env, idx) {
  const all = await kv.getData(env);
  const pct = pctOf(all[`day_${idx}`]||{});
  const avg = weekAvg(all,idx);
  const tot = totalDone(all);
  const weekRows = [];
  for(let i=Math.max(0,idx-6);i<=idx;i++){
    const p=pctOf(all[`day_${i}`]);
    weekRows.push(`G${i+1} ${bar(p)} ${p}% ${medal(p)}`);
  }
  const comment = await askGemini(env.GEMINI_API_KEY,marcoSystem(),
    `Dashboard G${idx+1}: oggi ${pct}%, media ${avg}%, completi ${tot}/${idx+1}. Tre righe: trend, punto critico, azione immediata. Zero incoraggiamento generico.`,150);
  return [
    `📊 *Dashboard — Giorno ${idx+1}/60*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `Oggi:       ${bar(pct)} *${pct}%*`,
    `Settimana:  *${avg}%* · Giorni completi: *${tot}/${idx+1}*`,
    ``,
    `*Ultimi 7 giorni:*`,
    "```",
    weekRows.join("\n"),
    "```",
    ``,
    comment,
  ].join("\n");
}

// ═══════════════════════════════════════════════════════════════════════
// MORNING / EVENING SESSIONS
// ═══════════════════════════════════════════════════════════════════════

async function startMorning(env) {
  const idx = getDayIndex();
  if(idx<0||idx>=TOTAL_DAYS) return;
  const all = await kv.getData(env);
  const prevConv = idx>0 ? await kv.getConv(env,idx-1) : null;
  const ypct = idx>0 ? pctOf(all[`day_${idx-1}`]) : null;
  const lastIntenzione = prevConv?.evening?.a3||null;
  const events = await getCalendarEvents(env,dateISO(idx));
  const calSummary = events.length ? events.map(e=>`${e.start} ${e.title}`).join(" · ") : "agenda libera";

  if(!events.some(e=>e.title?.includes("Boot")||e.title?.includes("Sfida60"))){
    await createCalendarEvent(env,{title:`⏰ Boot Sfida60 — G${idx+1}`,date:dateISO(idx),startTime:"06:00",endTime:"06:45",description:"Flessioni · preghiere · caffè · corda · addominali · ballo"});
    await createCalendarEvent(env,{title:"🙏 Compieta",date:dateISO(idx),startTime:"20:45",endTime:"21:00"});
  }

  const ctx = `G${idx+1}/60 — ${formatDay(idx,true)}\nIeri: ${ypct!==null?ypct+"%":"primo giorno"}\n${lastIntenzione?`Intenzione dichiarata ieri sera: "${lastIntenzione}"`:"Prima sessione."}\nMedia 7gg: ${weekAvg(all,Math.max(0,idx-1))}%\nAgenda: ${calSummary}`;
  const msg = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),`Briefing mattutino. ${ypct!==null?`Ieri: ${ypct}%.`:""} ${lastIntenzione?`Hai promesso: "${lastIntenzione}". Inizia da lì.`:""} Prima domanda: risultato NON NEGOZIABILE di oggi. Personale, contestuale. Max 90 parole.`,280);

  await tg(env.TELEGRAM_TOKEN,[
    `☀️ *Buongiorno — Giorno ${idx+1}/60*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📅 ${formatDay(idx,true)}`,
    `📆 ${calSummary}`,
    ``,
    msg,
  ].join("\n"));

  await kv.setState(env,{step:"morning_q1",lastDay:idx,context:{calSummary,ypct}});
}

async function handleMorningAnswer(env, step, answer, idx) {
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
    const ctx=`Obiettivo: ${conv.morning.a1} | Rischio: ${conv.morning.a2} | Energia: ${conv.morning.energy}/5 | Agenda: ${state.context?.calSummary}`;
    const briefing = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),`Briefing finale. Schema del giorno + focus sull'obiettivo. Chiudi con una parola sola tipo "Vai." o "Muoviti." Max 100 parole.`,300);
    const all = await kv.getData(env);
    const pct = pctOf(all[`day_${idx}`]||{});
    await tg(env.TELEGRAM_TOKEN,[
      `✦ *Briefing Giorno ${idx+1}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      briefing,
    ].join("\n"), kb.main(pct));
    await appendToSheet(env,[dateISO(idx),`G${idx+1}`,"morning",conv.morning.a1,conv.morning.a2,conv.morning.energy,"","","",pct]);
    await kv.setConv(env,idx,conv); await kv.setState(env,{...state,step:"morning_done"});
  }
}

async function startEvening(env) {
  const idx = getDayIndex();
  if(idx<0||idx>=TOTAL_DAYS) return;
  const all = await kv.getData(env);
  const dayData = all[`day_${idx}`]||{};
  const pct = pctOf(dayData);
  const conv = await kv.getConv(env,idx);
  const goal = conv.morning?.a1||null;
  const missed = SCHEDULE.filter(s=>!dayData.items?.[s.id]).map(s=>s.label);
  const ctx = `G${idx+1}: ${pct}% | Obiettivo: ${goal||"—"} | Mancanti: ${missed.join(", ")||"nessuno"} | Settimana: ${weekAvg(all,idx)}%`;
  const msg = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),`Apertura serale. ${pct}% oggi. ${goal?`Obiettivo dichiarato: "${goal}".`:""} 2 righe oneste. Poi prima domanda: l'obiettivo è stato raggiunto?`,220);
  await tg(env.TELEGRAM_TOKEN,[
    `🌙 *Giorno ${idx+1} — Esame di Coscienza*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `${bar(pct)} *${pct}%* ${medal(pct)}`,
    ``,
    msg,
  ].join("\n"));
  await kv.setState(env,{step:"evening_q1",lastDay:idx,context:{pct,goal,missed:missed.join(", ")}});
}

async function handleEveningAnswer(env, step, answer, idx) {
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
    const ctx = `Oggi: ${state.context?.pct}% | Raggiunto: ${conv.evening.a1} | Deviazione: ${conv.evening.a2} | Domani: ${answer} | Settimana: ${weekAvg(all,idx)}%`;
    const analysis = await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),`Esame di coscienza. Dati alla mano. Pattern se esiste. Un'intenzione concreta per il Boot di domani. Max 130 parole.`,380);
    const pct = state.context?.pct||0;
    await tg(env.TELEGRAM_TOKEN,[
      `✦ *Analisi Giorno ${idx+1}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      analysis,
      ``,
      `📄 _Log aggiornato nel Dossier._`,
    ].join("\n"), kb.main(pct));

    // Write to Google Docs
    const dayData = all[`day_${idx}`]||{};
    const calSummary = state.context?.calSummary||"—";
    await appendDailyLog(env, idx, { morning:conv.morning, evening:conv.evening, dayData, analysis, calSummary });

    // Sheet log
    await appendToSheet(env,[dateISO(idx),`G${idx+1}`,"evening",conv.evening.a1,conv.evening.a2,conv.evening.a3,"","","",pct]);

    // Friday report
    const dow = new Date().toLocaleDateString("it-IT",{weekday:"long",timeZone:"Europe/Rome"});
    if(dow==="venerdì") await sendWeeklyReport(env,idx,all);

    // Alert 2 giorni sotto 50%
    let low=0; for(let i=Math.max(0,idx-1);i<=idx;i++) if(pctOf(all[`day_${i}`])<50) low++;
    if(low>=2) await createGmailDraft(env,{subject:`⚠️ Sfida60 — Alert: ${low} giorni sotto 50%`,body:`Marco ha rilevato ${low} giorni consecutivi sotto 50%.\n\nG${idx+1}: ${pct}%\nG${idx}: ${pctOf(all[`day_${idx-1}`])}%\n\nIntervento necessario.`});

    await kv.setConv(env,idx,conv); await kv.setState(env,{...state,step:"evening_done"});
  }
}

// ═══════════════════════════════════════════════════════════════════════
// WEEKLY REPORT
// ═══════════════════════════════════════════════════════════════════════

async function sendWeeklyReport(env, idx, all) {
  const start = Math.max(0,idx-6);
  const week  = Array.from({length:idx-start+1},(_,i)=>({day:start+i+1,pct:pctOf(all[`day_${start+i}`]),date:formatDay(start+i)}));
  const avg   = Math.round(week.reduce((a,b)=>a+b.pct,0)/week.length);
  const perfect = week.filter(d=>d.pct===100).length;
  const analysis = await askGemini(env.GEMINI_API_KEY,marcoSystem(),
    `Report W${Math.ceil(idx/7)} G${start+1}-${idx+1}:\n${week.map(d=>`G${d.day} (${d.date}): ${d.pct}%`).join("\n")}\nMedia: ${avg}% · Perfetti: ${perfect}/7\nTotale: ${totalDone(all)}/60\nAnalisi: trend, forza, critico, obiettivo settimana prossima. Max 180 parole.`,500);

  await tg(env.TELEGRAM_TOKEN,[
    `📊 *Report Settimana ${Math.ceil(idx/7)} — G${start+1}→${idx+1}*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `Media: *${avg}%* ${medal(avg)} · Perfetti: *${perfect}/7*`,
    ``,
    "```",
    week.map(d=>`G${d.day} (${d.date}) ${bar(d.pct)} ${d.pct}%`).join("\n"),
    "```",
    ``,
    analysis,
  ].join("\n"),[[{text:"📧 Salva Gmail",callback_data:"report_gmail"},{text:"↩ Menu",callback_data:"show_menu"}]]);

  await createGmailDraft(env,{subject:`Sfida60 · W${Math.ceil(idx/7)} · ${avg}%`,body:`Report Settimana ${Math.ceil(idx/7)}\n\n${analysis}\n\n${week.map(d=>`G${d.day} (${d.date}): ${d.pct}%`).join("\n")}\n\nMedia: ${avg}% | Perfetti: ${perfect}/7`});
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
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `✅ *Check-in — Giorno ${idx+1}*\n━━━━━━━━━━━━━━━━━━━━━━\n${bar(np)} *${np}%*\n\n${item.emoji} *${item.label}* ${all[`day_${idx}`].items[itemId]?"✅ fatto":"⬜ rimosso"}`,
      kb.checkin(all[`day_${idx}`].items||{}));
  }
  if(data==="check_all"){
    if(!all[`day_${idx}`]) all[`day_${idx}`]={items:{}};
    SCHEDULE.forEach(s=>{all[`day_${idx}`].items[s.id]=true;});
    await kv.setData(env,all);
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `✅ *Giorno ${idx+1} — Completo*\n━━━━━━━━━━━━━━━━━━━━━━\n${"█".repeat(10)} *100%* 🏆\n\nTutto completato. Marco ne prende nota.`,
      kb.main(100));
  }
  if(data==="show_note"){
    await kv.setState(env,{...(await kv.getState(env)),step:"waiting_note",lastDay:idx});
    return editMsg(env.TELEGRAM_TOKEN,msgId,
      `📝 *Note — Giorno ${idx+1}*\n━━━━━━━━━━━━━━━━━━━━━━\nNota attuale: _${dayData.note||"nessuna"}_\n\nScrivi la tua nota come messaggio libero.\nMarco la registra automaticamente.`,
      kb.back());
  }
  if(data==="show_agenda"){
    const events = await getCalendarEvents(env,dateISO(idx));
    const list = events.length ? events.map(e=>`• *${e.title}* — ${e.start}`).join("\n") : "_Agenda libera oggi._";
    return editMsg(env.TELEGRAM_TOKEN,msgId,`📆 *Agenda ${formatDay(idx,true)}*\n━━━━━━━━━━━━━━━━━━━━━━\n${list}`,kb.back());
  }
  if(data==="show_report") return editMsg(env.TELEGRAM_TOKEN,msgId,`📋 *Report*\n━━━━━━━━━━━━━━━━━━━━━━\nScegli il tipo:`,kb.report());
  if(data==="report_week"||data==="report_gmail_week"){ await sendWeeklyReport(env,idx,all); return; }
  if(data==="report_full"){
    const rows=Array.from({length:idx+1},(_,i)=>`G${i+1} ${bar(pctOf(all[`day_${i}`]))} ${pctOf(all[`day_${i}`])}%`);
    return editMsg(env.TELEGRAM_TOKEN,msgId,[`📈 *Sfida Completa G1→${idx+1}*`,`━━━━━━━━━━━━━━━━━━━━━━`,`Media: *${weekAvg(all,idx)}%* · Completi: *${totalDone(all)}/${idx+1}*`,``,`\`\`\``,rows.join("\n"),`\`\`\``].join("\n"),kb.back("show_report"));
  }
  if(data==="report_gmail"){ await sendWeeklyReport(env,idx,all); return answerCb(env.TELEGRAM_TOKEN,cbq.id,"Salvato su Gmail ✓"); }
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
    return editMsg(env.TELEGRAM_TOKEN,msgId,`${act.emoji} *${act.label}* registrata per oggi.\n\nBuona ${act.label.toLowerCase()}, Chris.`,kb.main(pct));
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
  if(cmd==="silenzio"){
    const ore=parseInt(args[0])||0;
    if(ore>0){
      await env.KV.put("sfida60_silence_until",(Date.now()+ore*3600000).toString());
      const h=new Date(Date.now()+ore*3600000).toLocaleTimeString("it-IT",{timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit"});
      return tg(env.TELEGRAM_TOKEN,`🔇 Silenzio per *${ore}h*. Torno alle *${h}*.`);
    }
    return tg(env.TELEGRAM_TOKEN,`🔇 *Silenzio*\nPer quanto?`,kb.silence());
  }
  if(cmd==="aiuto") return tg(env.TELEGRAM_TOKEN,[
    `✦ *Marco — Guida Comandi*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `/menu — 📱 Menu principale`,
    `/oggi — 📅 Stato giornata completo`,
    `/check [item] — ✅ Segna completato`,
    `/agenda — 📆 Google Calendar oggi`,
    `/stato — 📊 Dashboard e trend`,
    `/report — 📋 Report settimanale`,
    `/silenzio [ore] — 🔇 Pausa notifiche`,
    ``,
    `_Scrivi liberamente: Marco legge e risponde._`,
    ``,
    `[🌐 Tracker](${MINI_APP_URL}) · [📄 Dossier](https://docs.google.com/document/d/${DOC_ID}/edit)`,
  ].join("\n"),kb.back());
}

// ═══════════════════════════════════════════════════════════════════════
// FREE TEXT
// ═══════════════════════════════════════════════════════════════════════

async function handleFreeText(env, text, idx) {
  const all     = await kv.getData(env);
  const dayData = all[`day_${idx}`]||{};
  const state   = await kv.getState(env);
  const conv    = await kv.getConv(env,idx);

  if(state.step==="waiting_note"){
    if(!all[`day_${idx}`]) all[`day_${idx}`]={};
    all[`day_${idx}`].note=text;
    await kv.setData(env,all); await kv.setState(env,{...state,step:null});
    return tg(env.TELEGRAM_TOKEN,`📝 *Nota salvata*\n_"${text}"_`,kb.main(pctOf(all[`day_${idx}`])));
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
    return tg(env.TELEGRAM_TOKEN,`${item.emoji} *${item.label}* registrato.\n${bar(np)} *${np}%*`);
  }

  const ctx=`G${idx+1}: ${pctOf(dayData)}% | Completati: ${SCHEDULE.filter(s=>dayData.items?.[s.id]).map(s=>s.label).join(", ")||"—"} | Attività: ${dayData.activity||"—"}`;
  const reply=await askGemini(env.GEMINI_API_KEY,marcoSystem(ctx),`Chris: "${text}"\nRispondi come Marco. Max 100 parole.`,280);
  return tg(env.TELEGRAM_TOKEN,reply,kb.main(pctOf(dayData)));
}

// ═══════════════════════════════════════════════════════════════════════
// WEBHOOK
// ═══════════════════════════════════════════════════════════════════════

async function processUpdate(body, env) {
  try {
    if(body.callback_query){
      const silence=await env.KV.get("sfida60_silence_until");
      if(silence&&Date.now()<parseInt(silence)){ await answerCb(env.TELEGRAM_TOKEN,body.callback_query.id); return; }
      await handleCallback(env,body.callback_query);
      return;
    }

    const msg=body?.message; if(!msg?.text) return;
    const silence=await env.KV.get("sfida60_silence_until");
    if(silence&&Date.now()<parseInt(silence)) return;

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
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({chat_id:CHAT_ID, text:`_[${e.message?.slice(0,80)||"errore"}]_`, parse_mode:"Markdown"})
    }).catch(()=>{});
  }
}

async function handleWebhook(request, env, ctx) {
  const body = await request.json();

  // Answer Telegram IMMEDIATELY — before any processing
  // This prevents the 5s timeout that causes "no response" issues
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
  const url=new URL(request.url), path=url.pathname;
  if(request.method==="OPTIONS") return new Response(null,{headers:CORS});
  if(path==="/webhook"&&request.method==="POST") return handleWebhook(request,env,ctx);
  if(path==="/ping") return json({ok:true,day:getDayIndex()+1,total:TOTAL_DAYS,doc:DOC_ID});
  if(path==="/data") return new Response(await env.KV.get("sfida60_data")||"{}",{headers:{...CORS,"Content-Type":"application/json"}});
  if(path==="/sync"&&request.method==="POST"){await env.KV.put("sfida60_data",JSON.stringify(await request.json()));return json({ok:true});}
  if(path==="/test"&&request.method==="POST"){
    const idx=0, all=await kv.getData(env);
    const events=await getCalendarEvents(env,dateISO(idx));
    const calSummary=events.length?events.map(e=>`${e.start} ${e.title}`).join(" · "):"agenda libera";
    const msg=await askGemini(env.GEMINI_API_KEY,marcoSystem(`TEST G1 | Agenda: ${calSummary}`),`TEST sistema. Presentati come Marco brevemente e fai la prima domanda mattutina. Max 80 parole.`,250);
    await tg(env.TELEGRAM_TOKEN,[`☀️ *TEST — Giorno 1/60*`,`━━━━━━━━━━━━━━━━━━━━━━`,`📆 ${calSummary}`,``,msg].join("\n"),kb.main(0));
    await kv.setState(env,{step:"morning_q1",lastDay:idx,context:{calSummary,ypct:null}});
    return json({ok:true,calendar_events:events.length});
  }
  if(path==="/test-morning"&&request.method==="POST"){await startMorning(env);return json({ok:true});}
  if(path==="/test-evening"&&request.method==="POST"){await startEvening(env);return json({ok:true});}
  if(path==="/setup-webhook"&&request.method==="POST"){
    const r=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/setWebhook`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:`https://sfida60-motivatore.soliwkr.workers.dev/webhook`,allowed_updates:["message","callback_query"],drop_pending_updates:true})});
    await setBotCommands(env.TELEGRAM_TOKEN);
    return json(await r.json());
  }
  if(path==="/setup-sheets"&&request.method==="POST"){const{sheetId}=await request.json();await env.KV.put("sfida60_sheets_id",sheetId);return json({ok:true});}
  return new Response("✦ Marco — Sfida60 v4",{headers:CORS});
}

// ═══════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

export default {
  async fetch(request,env,ctx){return handleRequest(request,env,ctx);},
  async scheduled(event,env){
    const silence=await env.KV.get("sfida60_silence_until");
    if(silence&&Date.now()<parseInt(silence)) return;
    if(event.cron==="5 4 * * *")  await startMorning(env);
    if(event.cron==="5 19 * * *") await startEvening(env);
  },
};

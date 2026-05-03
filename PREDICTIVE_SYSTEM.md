# Marco — Sistema Predittivo Integrato

## Stato Implementazione

**v5 deployata 2026-05-03** — Tutti i punti del design doc + 8 feature aggiuntive.

## Fase Engine

```
FASE 1 — "Luna di Miele"     G1-7    tono: setup, aspettative alte
FASE 2 — "Primo Calo"        G8-14   focus: Boot 06:00, Messa, primo cedimento
FASE 3 — "Zona Critica"      G15-25  focus: routine non automatica, qui si vince
FASE 4 — "Disciplina o Noia" G26-45  focus: auto-sabotaggio, pattern detection
FASE 5 — "Sprint Finale"     G46-60  focus: countdown, retrospettiva, chiusura
```

## Vulnerabilità Tracciate (da briefing)

1. Sindrome del sistemista pesante — infrastruttura > domanda
2. Over-engineering compulsivo — configurare > vendere
3. Dispersione progettuale — 3 ecosistemi da solo
4. Resistenza al ritmo regolare — creatività > disciplina

Detector: analizza ultimi 3 giorni di note, completamento Boot, varietà attività.

## Punti di Integrazione — IMPLEMENTATI

### Google Calendar — Briefing Predittivo (sera per il giorno dopo)
✅ `createPredictiveBriefing()` chiamato a fine sessione serale.
- Titolo: `⚔️ G{N} — {FASE}`
- Descrizione: emoji fase, focus, %ieri/media, vulnerabilità, briefing Gemini

### App — Banner di Fase (tab Oggi, top)
✅ `PhaseBanner` component in App.jsx.
- Colore gradient per fase
- Headline + day-in-phase counter
- Score, streak, vulnerabilità inline
- Fetch da `/phase` endpoint del worker

### Telegram — Messaggi Fuori Programma
✅ `checkPredictiveAlerts()` invocato dopo ogni check/sessione.
- Boot saltato 2gg consecutivi (Fase 2+) → alert immediato
- Sotto 50% per 3gg (Fase 3+) → alert critico
- 100% per 5gg consecutivi → congratulazione rara
- Deduplicato via KV (`sfida60_alert_{type}_{idx}`, TTL 24h)

✅ `checkDeviationAlarm()` cron 06:00 UTC (08:00 Rome) — messaggio se Boot saltato 2gg.

### Docs — Sezione "Allineamento Previsione"
✅ `appendDailyLog()` aggiornato.
```
▸ ALLINEAMENTO CON PREVISIONE
  Fase attuale: [nome fase + range]
  Previsione: [da PHASES.prediction]
  Realtà: [pct]% completamento
  Scarto: [SOPRA/ALLINEATO/SOTTO]
  Vulnerabilità attiva: [name + desc]
  Nota Marco: [predittiva per domani — Gemini]
```

## Criteri di Successo (dal briefing)
- Minimo: 40/60 giorni sopra il 70%
- Target: 50/60 giorni sopra l'80%
- Eccellenza: 45+ giorni al 100%

Visibili in `/punteggio` su Telegram con checkbox status.

## TODO Implementazione — TUTTO FATTO
- [x] getPhase(dayIndex) → { id, name, focus, color, headline }
- [x] Cron serale: createCalendarEvent con briefing predittivo per G+1
- [x] App: PhaseBanner component con messaging dinamico
- [x] Telegram: checkPredictiveAlerts() dopo ogni check/sessione
- [x] Docs: appendDailyLog aggiornato con sezione allineamento
- [x] Pattern detector: confronta ultimi N giorni con previsione fase
- [x] Vulnerability tracker: quale delle 4 vulnerabilità è attiva oggi

## Feature Aggiuntive Implementate

1. **Foto del giorno** ✅ — Telegram photo handler → `uploadToDrive` → Sfida60_Foto folder
2. **Peso/misure** ✅ — `/peso` cmd, auto-detect numerici, WeightChart su Stats tab
3. **Accountability pubblica** ✅ — `postPublicAccountability()` su canale, attivabile via `/setup-public-channel`
4. **Airtable** ✅ — `syncToAirtable()` ogni sera, upsert via `{Giorno}=N`
5. **Preghiera del giorno** ✅ — Gemini-generated, contestualizzata fase + Fourth Way + cattolicesimo
6. **Allarme deviazione** ✅ — Cron `0 6 * * *` (08:00 Rome) controllo Boot 2gg
7. **Punteggio cumulativo** ✅ — `calculateScore()`: +1/item, +10 100%, +5 streak3+, +3 Boot, -5/-10 penalties
8. **Export PDF settimanale** ✅ — `generateWeeklyPDF()`: crea Doc → export PDF → upload Drive

## API Endpoints Aggiunti

- `GET  /phase` — Fase corrente + score + vulnerabilità
- `GET  /scores` — Score, streak, best streak
- `GET  /weights` — Cronologia pesi
- `POST /test-pdf` — Genera PDF manualmente
- `POST /test-deviation` — Forza check allarme
- `POST /test-briefing` — Forza creazione briefing Calendar
- `POST /test-preghiera` — Test preghiera Gemini
- `POST /test-public` — Test post canale pubblico
- `POST /setup-airtable` — Configura `{token, baseId}`
- `POST /setup-public-channel` — Configura `{channelId}`

## Cron Schedule

```
5 4 * * *   → 06:05 Rome — startMorning (briefing + Q1)
5 19 * * *  → 21:05 Rome — startEvening (esame coscienza)
0 6 * * *   → 08:00 Rome — checkDeviationAlarm
```

## Comandi Telegram Aggiunti

- `/peso 78.5` — registra peso
- `/foto` — invita a inviare foto del giorno
- `/punteggio` — score cumulativo + criteri successo
- `/fase` — fase predittiva attuale + vulnerabilità

## Setup Manuali Necessari (One-Time)

Per attivare le feature opzionali:

```bash
# Airtable (opzionale)
curl -X POST https://sfida60-motivatore.soliwkr.workers.dev/setup-airtable \
  -H "Content-Type: application/json" \
  -d '{"token":"keyXXXX","baseId":"appXXXX"}'
# Tabella richiesta: "Sfida60" con campi:
# Giorno (number), Data (date), Fase (text), Percentuale (number),
# Completati, Saltati, Attivita, Note, Peso (number),
# Obiettivo, Rischio, Energia (number), Raggiunto, Deviazione, BootDomani

# Canale pubblico (opzionale)
curl -X POST https://sfida60-motivatore.soliwkr.workers.dev/setup-public-channel \
  -H "Content-Type: application/json" \
  -d '{"channelId":"@mycanale"}'

# Sheets (già configurato)
curl -X POST https://sfida60-motivatore.soliwkr.workers.dev/setup-sheets \
  -H "Content-Type: application/json" \
  -d '{"sheetId":"XXX"}'
```

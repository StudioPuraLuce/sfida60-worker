# Marco — Sistema Predittivo Integrato

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

## Punti di Integrazione

### Google Calendar — Briefing Predittivo (sera per il giorno dopo)
- Titolo: `⚔️ G{N} — {FASE}: {headline}`
- Descrizione: 3-4 righe contestuali con:
  - Fase attuale e cosa Marco prevede
  - Dato del giorno precedente (%)
  - Vulnerabilità specifica attivata
  - Una domanda/sfida per domani

### App — Banner di Fase (tab Oggi, top)
- Colore per fase: verde/giallo/rosso/arancio/oro
- Testo: headline della fase + messaggio predittivo
- Cambia ogni giorno basato su getDayIndex()

### Telegram — Messaggi Fuori Programma
Trigger:
- Boot saltato 2gg consecutivi in Fase 2 → messaggio 07:30
- Sotto 50% per 3gg in Fase 3 → messaggio urgente
- 100% per 5gg consecutivi → congratulazione rara
- Pattern di deviazione ricorrente → confronto con previsione

### Docs — Sezione "Allineamento Previsione"
Ogni entry serale include:
```
▸ ALLINEAMENTO CON PREVISIONE
  Fase attuale: [nome fase]
  Previsione: [cosa Marco si aspettava]
  Realtà: [cosa è successo]  
  Scarto: [sopra/sotto/allineato]
  Nota Marco: [commento predittivo per domani]
```

## Criteri di Successo (dal briefing)
- Minimo: 40/60 giorni sopra il 70%
- Target: 50/60 giorni sopra l'80%
- Eccellenza: 45+ giorni al 100%

## TODO Implementazione
- [ ] getPhase(dayIndex) → { id, name, focus, color, headline }
- [ ] Cron serale: createCalendarEvent con briefing predittivo per G+1
- [ ] App: PhaseBanner component con messaging dinamico
- [ ] Telegram: checkPredictiveAlerts() dopo ogni check/sessione
- [ ] Docs: appendDailyLog aggiornato con sezione allineamento
- [ ] Pattern detector: confronta ultimi N giorni con previsione fase
- [ ] Vulnerability tracker: quale delle 4 vulnerabilità è attiva oggi

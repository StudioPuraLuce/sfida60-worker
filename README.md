# Sfida60 — Motivatore Worker

Cloudflare Worker con cron job mattina/sera che manda messaggi Telegram personalizzati via Claude.

## Endpoints
- `GET /ping` — health check
- `GET /data` — leggi dati sfida da KV
- `POST /sync` — scrivi dati sfida su KV (body: JSON)
- `POST /test-morning` — trigger manuale messaggio mattina
- `POST /test-evening` — trigger manuale messaggio sera

## Cron
- `0 4 * * *` → 06:00 Rome — Buongiorno
- `0 19 * * *` → 21:00 Rome — Esame di coscienza

## Secrets richiesti
- `ANTHROPIC_API_KEY`
- `TELEGRAM_TOKEN`
- `CLOUDFLARE_API_TOKEN` (per deploy)
- `CLOUDFLARE_ACCOUNT_ID` (per deploy)

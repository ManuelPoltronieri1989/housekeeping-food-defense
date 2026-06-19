# PRD — Housekeeping & Food Defense (Logistica)

## Problem Statement
Clone pixel-perfect dell'app `https://housekeepingcchbc.base44.app`: design, layout, colori, font, elementi interattivi, grafici, struttura. Sezione Logistica con sistema di audit Safety/Quality, gestione criticità e configurazione domande.

## Lingua
Italian (it-IT) — sempre rispondere all'utente in italiano.

## Architettura
- **Frontend**: React + TailwindCSS + shadcn/ui + Recharts
- **Backend**: FastAPI + MongoDB (auth + audit + criticità + config)
- **Auth**: JWT custom (passlib/bcrypt), ruoli Owner/Operator
- **Persistenza dati**: MongoDB centralizzato (collections: `users`, `audits`, `criticita_state`, `config`)

## Ruoli
- **Owner**: `poltronieri.manuel@gmail.com` (hardcoded) — accesso completo (Dashboard, Storico Audit, Storico Segnalazioni, Configurazione, Nuovo Audit, Zone e Calendario). Vede tutti gli audit di tutti gli operatori.
- **Operator**: qualunque altra email — accesso ristretto a Nuovo Audit e Zone e Calendario. Vede solo i propri audit/criticità.

## Funzionalità Implementate
- [DONE] UI completa: Dashboard, Nuovo Audit, Storico Audit, Zone & Calendario, Configurazione, Storico Segnalazioni
- [DONE] Backend Auth FastAPI + MongoDB + JWT (`/api/auth/register`, `/login`, `/me`, `/reset-password`)
- [DONE] Role-based UI gating (Owner vs Operator) tramite `OwnerGuard`
- [DONE] Domande dinamiche da Configurazione → Nuovo Audit (ordinate per code, persistenza centrale)
- [DONE] Validazione 100% completamento prima del salvataggio audit
- [DONE] Sidebar: "Magazzino" rinominato in "Logistica"
- [DONE] KPI e grafici real-time basati su storico audit
- [DONE] **(2026-02-12)** Rimossa funzionalità upload foto — solo commento testuale per criticità
- [DONE] **(2026-02-12)** Reset password semplice (no email): `POST /api/auth/reset-password` con email + nuova password
- [DONE] **(2026-02-12)** Migrazione dati da `localStorage` a **MongoDB centralizzato**:
  - `POST /api/audits` — operator/owner crea audit (auto-collegato a `user_id`)
  - `GET /api/audits` — owner vede tutti, operator solo i propri
  - `DELETE /api/audits/{id}` / `PATCH /api/audits/{id}` — role-based
  - `GET /api/criticita-state` — stato risolte/dismesse
  - `POST /api/criticita/{id}/resolve|unresolve|dismiss`
  - `GET/PUT /api/config/questions` — config domande (PUT solo Owner, 403 per Operator)
- [DONE] Migrazione one-time automatica al primo login: dati localStorage → backend, flag `hk_migrated_to_backend_v1`
- [DONE] **(2026-02-19)** Ordinamento domande in Configurazione: ora ordinate per Area (secondo AREA_ORDER) → Reparto → Codice
- [DONE] **(2026-02-19)** Import domande da Excel/CSV in Configurazione:
  - Bottone "Importa Excel/CSV" + dialog di preview con valide/scartate
  - Formato: `Codice | Testo Domanda | Area | Reparto | Tipo (Safety/Quality)`
  - Codice opzionale (auto-generato se vuoto)
  - Salvataggio su MongoDB via PUT /api/config/questions
  - Dipendenza aggiunta: `xlsx` (SheetJS)

- [DONE] **(2026-02-19)** Dashboard refactor:
  - Rimossa card KPI "Trend" (in alto)
  - Rimossa sezione "Punteggi per Area e Reparto"
  - Card "Criticità" semplificata: solo numero + testo riassuntivo (lista dettagliata rimossa, evidenze già visibili in Storico Segnalazioni)
- [DONE] **(2026-02-19)** Storico Audit — scheda dettaglio:
  - Ora mostra le domande REALI inserite e valutate (lette da `audit.sectorScores` + lookup testo da `configQuestions`)
  - Rimosso l'uso dei mock `SAFETY_QUESTIONS`/`QUALITY_QUESTIONS` come fonte di domande
  - Mostrato il `code` della domanda (es. "S001") invece dell'id interno
  - Fallback "Nessun dettaglio per-domanda disponibile" per audit storici senza sectorScores
## Endpoint API completi
- `POST /api/auth/register` — registrazione (operator default, owner se email = OWNER_EMAIL)
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/reset-password` — reset semplice (no email)
- `POST /api/audits` — crea audit
- `GET /api/audits` — lista filtrata per ruolo
- `PATCH /api/audits/{id}`
- `DELETE /api/audits/{id}`
- `GET /api/criticita-state`
- `POST /api/criticita/{id}/resolve` / `/unresolve` / `/dismiss`
- `GET /api/config/questions`
- `PUT /api/config/questions` — owner only (403 altrimenti)

## DB Schema (MongoDB)
- `users`: `{id, email, name, password_hash, role, created_at}`
- `audits`: `{id, user_id, user_email, user_name, type, mode, area, date, inspector, score, criticita[], sectorScores, sectorComments, threshold, maxScore, wk, yr, created_at}`
- `criticita_state`: `{crit_id, resolved, resolvedDate, resolvedBy, dismissed, user_id, updated_at}`
- `config`: `{_id: "questions", Safety[], Quality[], updated_at}`

## File chiave
- `/app/backend/server.py` — tutti gli endpoint API
- `/app/frontend/src/context/AuthContext.jsx` — JWT state
- `/app/frontend/src/context/AuditContext.jsx` — fetch+migrazione+write ops via API
- `/app/frontend/src/App.js` — Router & OwnerGuard
- `/app/frontend/src/pages/AuthPage.jsx` — Login/Register/Reset
- `/app/frontend/src/pages/NuovoAudit.jsx` — Form audit
- `/app/backend/tests/test_api.py` — 19 test pytest (creato da testing agent)

## Stato Testing (2026-02-12)
- Backend: **19/19 pytest passati** (auth, reset, audit CRUD, criticità, config, RBAC)
- Frontend: **17/17 flow Playwright passati** (login Owner/Operator, sidebar role-based, reset UI, OwnerGuard)
- Credenziali ripristinate post-test (vedi `/app/memory/test_credentials.md`)

## Backlog / Future Tasks
- **P2**: Integrazione email reale (Resend/SendGrid) per reset password con token (più sicuro del reset semplice)
- **P2**: Aggiungere `data-testid` ai NavLink sidebar e al logout button
- **P3**: Sostituire `<input type="date">` in Nuovo Audit con shadcn Calendar
- **P3**: Aggiungere `minHeight` al wrapper Recharts per evitare warning width(-1)/height(-1)
- **P3**: Compound unique index su `audits(user_id, id)` per evitare collisioni id cross-user

## Test Credentials
Vedi `/app/memory/test_credentials.md`

# PRD — Housekeeping & Food Defense (Logistica)

## Problem Statement
Clone pixel-perfect dell'app `https://housekeepingcchbc.base44.app`: design, layout, colori, font, elementi interattivi, grafici, struttura. Sezione Logistica con sistema di audit Safety/Quality, gestione criticità e configurazione domande.

## Lingua
Italian (it-IT) — sempre rispondere all'utente in italiano.

## Architettura
- **Frontend**: React + TailwindCSS + shadcn/ui
- **Backend**: FastAPI + MongoDB (solo Auth attualmente)
- **Auth**: JWT custom, ruoli Owner/Operator
- **Persistenza dati app**: localStorage via `AuditContext` (audit, criticità, configurazione)

## Ruoli
- **Owner**: `poltronieri.manuel@gmail.com` (hardcoded) — accesso completo (Dashboard, Storico Audit, Storico Segnalazioni, Configurazione, Nuovo Audit, Zone e Calendario)
- **Operator**: qualunque altra email — accesso ristretto a Nuovo Audit e Zone e Calendario

## Funzionalità Implementate
- [DONE] UI completa: Dashboard, Nuovo Audit, Storico Audit, Zone & Calendario, Configurazione, Storico Segnalazioni
- [DONE] Backend Auth FastAPI + MongoDB + JWT (`/api/auth/register`, `/login`, `/me`)
- [DONE] Role-based UI gating (Owner vs Operator)
- [DONE] Persistenza localStorage per audit, criticità, configurazione
- [DONE] Domande dinamiche da Configurazione → Nuovo Audit (ordinate per code)
- [DONE] Validazione 100% completamento prima del salvataggio audit
- [DONE] Sidebar: "Magazzino" rinominato in "Logistica"
- [DONE] KPI e grafici real-time basati su storico audit
- [DONE] **(2026-02-12)** Rimossa completamente la funzionalità di upload foto per criticità — solo commento testuale è disponibile

## Endpoint API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## DB Schema
- `users`: `{email, full_name, password_hash, role, created_at}`

## File chiave
- `/app/backend/server.py` — Auth endpoints
- `/app/frontend/src/context/AuthContext.jsx` — JWT state
- `/app/frontend/src/context/AuditContext.jsx` — localStorage persistence
- `/app/frontend/src/App.js` — Router & guard
- `/app/frontend/src/pages/AuthPage.jsx` — Login/Register
- `/app/frontend/src/pages/NuovoAudit.jsx` — Form audit
- `/app/frontend/src/pages/StoricoAudit.jsx` — Storico audit
- `/app/frontend/src/pages/StoricoSegnalazioni.jsx` — Storico criticità

## Backlog / Future Tasks
- **P0**: Implementare "Password dimenticata" / Reset Password (richiesto dall'utente, ancora in sospeso)
- **P1**: Migrare audit/criticità/configurazione da localStorage a MongoDB (sync multi-device)
- **P2**: Integrazione email reale (Resend/SendGrid) per reset password produzione

## Test Credentials
Vedi `/app/memory/test_credentials.md`

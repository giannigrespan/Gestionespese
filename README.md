# Gestione Spese

Riscrittura in Next.js (App Router) + Postgres dell'app di gestione spese familiari,
pensata per essere deployata nativamente su Vercel.

## Stack

- Next.js 14 (App Router), React 18, Tailwind CSS
- Prisma ORM su Postgres (Vercel Postgres / Neon)
- Autenticazione email + password oppure login con Google, sessione JWT in cookie httpOnly
- Recharts per i grafici

## Funzionalità

- Registrazione/login, famiglie (crea o unisciti tramite ID)
- Spese condivise/personali con categorie
- Budget mensili per categoria
- Statistiche mensili e bilancio spese condivise tra membri
- Promemoria scadenze/bollette, con conversione automatica in spesa una volta pagate
- Esportazione CSV delle spese

Le funzioni AI (scansione scontrini/bollette) e l'integrazione Google Sheets della
versione precedente sono state rimosse: erano legate a servizi della piattaforma
Emergent (`emergentintegrations`, `EMERGENT_LLM_KEY`) non portabili su Vercel.

## Sviluppo locale

```bash
npm install
cp .env.example .env   # imposta DATABASE_URL e JWT_SECRET
npx prisma db push     # crea le tabelle sul database Postgres
npm run dev
```

## Deploy su Vercel

1. Collega questo repository a un progetto Vercel.
2. Nella scheda **Storage** del progetto, crea/collega un database **Postgres**
   (Vercel Postgres o Neon): Vercel inietta automaticamente `DATABASE_URL` e
   `DATABASE_URL_UNPOOLED`.
3. Imposta la variabile d'ambiente `JWT_SECRET` (stringa lunga e casuale).
4. Esegui `npx prisma db push` una volta (localmente, puntando al DB di produzione,
   oppure aggiungendo temporaneamente il comando al build) per creare le tabelle.
   In alternativa, se la rete da cui operi non riesce a raggiungere Postgres
   direttamente, imposta `MIGRATE_SECRET` su Vercel e chiama una volta
   `POST /api/admin/migrate` con l'header `x-migrate-secret` per creare lo
   schema tramite la funzione serverless (che ha accesso di rete pieno).

### Login con Google (opzionale)

1. Crea delle credenziali OAuth 2.0 su [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (tipo "Applicazione web").
2. Aggiungi come URI di reindirizzamento autorizzato:
   `https://<tuo-dominio-vercel>/api/auth/google/callback`.
3. Imposta su Vercel le variabili `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
   Opzionale: `GOOGLE_REDIRECT_URI` se vuoi forzare un dominio specifico invece
   di quello dedotto automaticamente dalla richiesta.

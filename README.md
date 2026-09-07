# Gestione Spese

Riscrittura in Next.js (App Router) + Postgres dell'app di gestione spese familiari,
pensata per essere deployata nativamente su Vercel.

## Stack

- Next.js 14 (App Router), React 18, Tailwind CSS
- Prisma ORM su Postgres (Vercel Postgres / Neon)
- Autenticazione email + password con sessione JWT in cookie httpOnly
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

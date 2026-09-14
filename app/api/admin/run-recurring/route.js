import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Materializza le transazioni ricorrenti (spese ed entrate) scadute in
// vere e proprie Expense/Income. Chiamato da un cron (Vercel Cron invia
// Authorization: Bearer $CRON_SECRET) oppure manualmente con l'header
// x-migrate-secret.
function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const migrateSecret = process.env.MIGRATE_SECRET;
  const provided = request.headers.get("x-migrate-secret");
  if (migrateSecret && provided === migrateSecret) return true;

  return false;
}

function advance(date, frequency) {
  const d = new Date(date);
  if (frequency === "yearly") {
    d.setUTCFullYear(d.getUTCFullYear() + 1);
  } else {
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return d;
}

export async function GET(request) {
  return runRecurring(request);
}

export async function POST(request) {
  return runRecurring(request);
}

async function runRecurring(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ detail: "Non autorizzato" }, { status: 401 });
  }

  const now = new Date();
  const due = await prisma.recurringTransaction.findMany({
    where: { active: true, nextRunDate: { lte: now } },
  });

  let created = 0;
  for (const r of due) {
    // Se il job non gira per un po', recupera tutte le occorrenze passate.
    let runDate = r.nextRunDate;
    while (runDate <= now) {
      if (r.type === "income") {
        await prisma.income.create({
          data: {
            familyId: r.familyId,
            userId: r.userId,
            amount: r.amount,
            category: r.category,
            description: r.description,
            date: runDate,
          },
        });
      } else {
        await prisma.expense.create({
          data: {
            familyId: r.familyId,
            userId: r.userId,
            forUserId: r.forUserId,
            amount: r.amount,
            category: r.category,
            description: r.description,
            expenseType: r.expenseType,
            date: runDate,
          },
        });
      }
      created += 1;
      runDate = advance(runDate, r.frequency);
    }
    await prisma.recurringTransaction.update({
      where: { id: r.id },
      data: { nextRunDate: runDate, lastRunAt: now },
    });
  }

  return NextResponse.json({ processed: due.length, created });
}

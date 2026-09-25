import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Strumento di supporto per correggere manualmente la nextRunDate di una
// transazione ricorrente (es. quando il form è stato salvato con la data
// sbagliata), senza dover eliminare e ricreare la voce dall'app. Protetto
// dallo stesso header x-migrate-secret usato dagli altri endpoint admin.
function isAuthorized(request) {
  const migrateSecret = process.env.MIGRATE_SECRET;
  const provided = request.headers.get("x-migrate-secret");
  return Boolean(migrateSecret) && provided === migrateSecret;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ detail: "Non autorizzato" }, { status: 401 });
  }

  const items = await prisma.recurringTransaction.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    items.map((r) => ({
      id: r.id,
      family_id: r.familyId,
      type: r.type,
      description: r.description,
      amount: r.amount,
      category: r.category,
      frequency: r.frequency,
      next_run_date: r.nextRunDate,
      active: r.active,
      last_run_at: r.lastRunAt,
    }))
  );
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ detail: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, next_run_date } = body;
  if (!id || !next_run_date) {
    return NextResponse.json({ detail: "id e next_run_date sono obbligatori" }, { status: 400 });
  }

  const updated = await prisma.recurringTransaction.update({
    where: { id },
    data: { nextRunDate: new Date(next_run_date) },
  });

  return NextResponse.json({ id: updated.id, next_run_date: updated.nextRunDate });
}

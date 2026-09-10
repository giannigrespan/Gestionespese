import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Endpoint di importazione dati storici, usato una tantum per popolare il
// database da CSV esportati dalla vecchia app. Protetto da MIGRATE_SECRET.
const CATEGORY_MAP = {
  utenze: "bollette",
  alimentari: "spesa",
  casa: "casa",
  svago: "svago",
  salute: "salute",
  trasporti: "trasporti",
  "ricarica auto": "carburante",
  figli: "figli",
  altro: "altro",
};

const TYPE_MAP = {
  condivisa: "shared",
  personale: "personal",
  "per partner": "for_partner",
};

export async function POST(request) {
  const secret = process.env.MIGRATE_SECRET;
  if (!secret) {
    return NextResponse.json({ detail: "MIGRATE_SECRET non configurato" }, { status: 503 });
  }
  const provided = request.headers.get("x-migrate-secret");
  if (provided !== secret) {
    return NextResponse.json({ detail: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { email, expenses, create_family_if_missing, family_name } = body;
  if (!email || !Array.isArray(expenses)) {
    return NextResponse.json({ detail: "email e expenses[] obbligatori" }, { status: 400 });
  }

  let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ detail: "Utente non trovato" }, { status: 404 });
  }
  if (!user.familyId) {
    if (!create_family_if_missing) {
      return NextResponse.json({ detail: "L'utente non ha una famiglia" }, { status: 400 });
    }
    const family = await prisma.family.create({
      data: { name: family_name || user.name, createdBy: user.id },
    });
    user = await prisma.user.update({ where: { id: user.id }, data: { familyId: family.id } });
  }

  const rows = expenses.map((e) => ({
    familyId: user.familyId,
    userId: user.id,
    amount: Number(e.amount),
    category: CATEGORY_MAP[String(e.category).toLowerCase()] || "altro",
    description: e.description,
    expenseType: TYPE_MAP[String(e.type).toLowerCase()] || "shared",
    date: new Date(e.date),
  }));

  const result = await prisma.expense.createMany({ data: rows });

  return NextResponse.json({ imported: result.count });
}

export async function GET(request) {
  const secret = process.env.MIGRATE_SECRET;
  if (!secret) {
    return NextResponse.json({ detail: "MIGRATE_SECRET non configurato" }, { status: 503 });
  }
  const provided = request.headers.get("x-migrate-secret");
  if (provided !== secret) {
    return NextResponse.json({ detail: "Non autorizzato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ detail: "email obbligatoria" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ detail: "Utente non trovato" }, { status: 404 });
  }

  const expenses = await prisma.expense.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
    select: { id: true, date: true, description: true, amount: true, category: true, expenseType: true, familyId: true },
  });

  return NextResponse.json({ user_id: user.id, family_id: user.familyId, count: expenses.length, expenses });
}

export async function DELETE(request) {
  const secret = process.env.MIGRATE_SECRET;
  if (!secret) {
    return NextResponse.json({ detail: "MIGRATE_SECRET non configurato" }, { status: 503 });
  }
  const provided = request.headers.get("x-migrate-secret");
  if (provided !== secret) {
    return NextResponse.json({ detail: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { email, from, to } = body;
  if (!email || !from || !to) {
    return NextResponse.json({ detail: "email, from e to obbligatori" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ detail: "Utente non trovato" }, { status: 404 });
  }

  const result = await prisma.expense.deleteMany({
    where: {
      userId: user.id,
      familyId: user.familyId,
      date: { gte: new Date(from), lt: new Date(to) },
    },
  });

  return NextResponse.json({ deleted: result.count });
}

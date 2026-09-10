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

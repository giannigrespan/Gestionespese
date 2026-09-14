import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function GET(request) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  const where = { familyId: user.familyId };
  if (month) {
    const [y, m] = month.split("-").map(Number);
    where.date = { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) };
  }

  const incomes = await prisma.income.findMany({
    where,
    orderBy: { date: "desc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(
    incomes.map((i) => ({
      income_id: i.id,
      family_id: i.familyId,
      user_id: i.userId,
      user_name: i.user.name,
      amount: i.amount,
      category: i.category,
      description: i.description,
      date: i.date,
      created_at: i.createdAt,
    }))
  );
}

export async function POST(request) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { amount, category, description, date } = body;

  if (amount === undefined || !category || !description) {
    return NextResponse.json({ detail: "Importo, categoria e descrizione sono obbligatori" }, { status: 400 });
  }
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return NextResponse.json({ detail: "Importo non valido" }, { status: 400 });
  }

  const income = await prisma.income.create({
    data: {
      familyId: user.familyId,
      userId: user.id,
      amount: numAmount,
      category,
      description,
      date: date ? new Date(date) : new Date(),
    },
  });

  return NextResponse.json({ income_id: income.id }, { status: 201 });
}

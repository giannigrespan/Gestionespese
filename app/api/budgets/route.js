import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function GET(request) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  const where = { familyId: user.familyId };
  if (month) where.month = month;

  const budgets = await prisma.budget.findMany({ where, orderBy: { category: "asc" } });
  return NextResponse.json(
    budgets.map((b) => ({
      budget_id: b.id,
      family_id: b.familyId,
      category: b.category,
      amount: b.amount,
      month: b.month,
    }))
  );
}

export async function POST(request) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { category, amount, month } = body;
  if (!category || amount === undefined || !month) {
    return NextResponse.json({ detail: "Categoria, importo e mese sono obbligatori" }, { status: 400 });
  }

  const budget = await prisma.budget.upsert({
    where: { familyId_category_month: { familyId: user.familyId, category, month } },
    update: { amount: Number(amount) },
    create: { familyId: user.familyId, category, amount: Number(amount), month },
  });

  return NextResponse.json({ budget_id: budget.id }, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function GET(request) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const category = searchParams.get("category");

  const where = { familyId: user.familyId };
  if (month) {
    const [y, m] = month.split("-").map(Number);
    where.date = { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) };
  }
  if (category) where.category = category;

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
    include: { user: { select: { name: true } }, forUser: { select: { name: true } } },
  });

  return NextResponse.json(
    expenses.map((e) => ({
      expense_id: e.id,
      family_id: e.familyId,
      user_id: e.userId,
      user_name: e.user.name,
      for_user_id: e.forUserId,
      for_user_name: e.forUser?.name || null,
      amount: e.amount,
      category: e.category,
      description: e.description,
      expense_type: e.expenseType,
      date: e.date,
      created_at: e.createdAt,
    }))
  );
}

export async function POST(request) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { amount, category, description, date, expense_type, for_user_id } = body;

  if (amount === undefined || !category || !description) {
    return NextResponse.json({ detail: "Importo, categoria e descrizione sono obbligatori" }, { status: 400 });
  }
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return NextResponse.json({ detail: "Importo non valido" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      familyId: user.familyId,
      userId: user.id,
      amount: numAmount,
      category,
      description,
      expenseType: expense_type || "shared",
      forUserId: for_user_id || null,
      date: date ? new Date(date) : new Date(),
    },
  });

  return NextResponse.json({ expense_id: expense.id }, { status: 201 });
}

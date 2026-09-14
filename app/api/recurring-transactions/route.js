import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

const FREQUENCIES = ["monthly", "yearly"];
const TYPES = ["expense", "income"];

export async function GET() {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const recurring = await prisma.recurringTransaction.findMany({
    where: { familyId: user.familyId },
    orderBy: { nextRunDate: "asc" },
  });

  return NextResponse.json(
    recurring.map((r) => ({
      recurring_id: r.id,
      family_id: r.familyId,
      type: r.type,
      amount: r.amount,
      category: r.category,
      description: r.description,
      expense_type: r.expenseType,
      frequency: r.frequency,
      next_run_date: r.nextRunDate,
      active: r.active,
      last_run_at: r.lastRunAt,
    }))
  );
}

export async function POST(request) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { amount, category, description, expense_type, frequency, next_run_date, for_user_id, type } = body;

  if (amount === undefined || !category || !description || !next_run_date) {
    return NextResponse.json(
      { detail: "Importo, categoria, descrizione e data prima esecuzione sono obbligatori" },
      { status: 400 }
    );
  }
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return NextResponse.json({ detail: "Importo non valido" }, { status: 400 });
  }
  const freq = FREQUENCIES.includes(frequency) ? frequency : "monthly";
  const txType = TYPES.includes(type) ? type : "expense";

  const recurring = await prisma.recurringTransaction.create({
    data: {
      familyId: user.familyId,
      userId: user.id,
      forUserId: txType === "expense" ? for_user_id || null : null,
      type: txType,
      amount: numAmount,
      category,
      description,
      expenseType: expense_type || "shared",
      frequency: freq,
      nextRunDate: new Date(next_run_date),
    },
  });

  return NextResponse.json({ recurring_id: recurring.id }, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiKeyUser } from "@/lib/apiAuth";
import { resolveCategory } from "@/lib/categories";

// Endpoint pensato per automazioni esterne (es. un Gem/azione di Gemini che
// riceve una spesa dettata a voce). Autenticato via header x-api-key, non
// via sessione cookie: vedi POST /api/account/api-key per generare la chiave.
export async function POST(request) {
  const { user, error } = await requireApiKeyUser(request);
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { amount, category, description, date, expense_type, for_user_id } = body;

  if (amount === undefined || !description) {
    return NextResponse.json({ detail: "Importo e descrizione sono obbligatori" }, { status: 400 });
  }
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return NextResponse.json({ detail: "Importo non valido" }, { status: 400 });
  }

  const resolvedCategory = resolveCategory(category);
  const expenseDate = date ? new Date(date) : new Date();

  const expense = await prisma.expense.create({
    data: {
      familyId: user.familyId,
      userId: user.id,
      amount: numAmount,
      category: resolvedCategory,
      description,
      expenseType: expense_type || "shared",
      forUserId: for_user_id || null,
      date: expenseDate,
    },
  });

  return NextResponse.json(
    {
      expense_id: expense.id,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    },
    { status: 201 }
  );
}

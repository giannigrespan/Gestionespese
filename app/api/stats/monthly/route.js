import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function GET(request) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  if (!month) {
    return NextResponse.json({ detail: "Parametro month obbligatorio (YYYY-MM)" }, { status: 400 });
  }
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));

  const expenses = await prisma.expense.findMany({
    where: { familyId: user.familyId, date: { gte: start, lt: end } },
  });
  const budgets = await prisma.budget.findMany({ where: { familyId: user.familyId, month } });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  }

  const budgetByCategory = {};
  for (const b of budgets) budgetByCategory[b.category] = b.amount;

  const categories = Array.from(new Set([...Object.keys(byCategory), ...Object.keys(budgetByCategory)])).map(
    (category) => ({
      category,
      spent: byCategory[category] || 0,
      budget: budgetByCategory[category] || null,
    })
  );

  return NextResponse.json({
    month,
    total_spent: total,
    total_budget: budgets.reduce((s, b) => s + b.amount, 0),
    expense_count: expenses.length,
    by_category: categories,
  });
}

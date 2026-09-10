import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function GET(request) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year"));
  if (!year) {
    return NextResponse.json({ detail: "Parametro year obbligatorio (YYYY)" }, { status: 400 });
  }

  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const expenses = await prisma.expense.findMany({
    where: { familyId: user.familyId, date: { gte: start, lt: end } },
    select: { amount: true, date: true },
  });

  const byMonth = Array(12).fill(0);
  for (const e of expenses) {
    byMonth[e.date.getUTCMonth()] += e.amount;
  }

  let cumulative = 0;
  const months = byMonth.map((total, i) => {
    cumulative += total;
    return { month: i + 1, total, cumulative };
  });

  return NextResponse.json({
    year,
    total_spent: cumulative,
    months,
  });
}

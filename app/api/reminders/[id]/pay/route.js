import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function POST(request, { params }) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const reminder = await prisma.reminder.findUnique({ where: { id: params.id } });
  if (!reminder || reminder.familyId !== user.familyId) {
    return NextResponse.json({ detail: "Promemoria non trovato" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.reminder.update({
      where: { id: params.id },
      data: { paid: true, paidAt: new Date() },
    }),
    prisma.expense.create({
      data: {
        familyId: user.familyId,
        userId: user.id,
        amount: reminder.amount,
        category: "bollette",
        description: reminder.title,
        expenseType: "shared",
        date: new Date(),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

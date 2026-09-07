import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function GET() {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const reminders = await prisma.reminder.findMany({
    where: { familyId: user.familyId },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(
    reminders.map((r) => ({
      reminder_id: r.id,
      family_id: r.familyId,
      title: r.title,
      amount: r.amount,
      due_date: r.dueDate,
      paid: r.paid,
      paid_at: r.paidAt,
    }))
  );
}

export async function POST(request) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { title, amount, due_date } = body;
  if (!title || amount === undefined || !due_date) {
    return NextResponse.json({ detail: "Titolo, importo e scadenza sono obbligatori" }, { status: 400 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      familyId: user.familyId,
      title,
      amount: Number(amount),
      dueDate: new Date(due_date),
    },
  });

  return NextResponse.json({ reminder_id: reminder.id }, { status: 201 });
}

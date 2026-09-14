import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function PATCH(request, { params }) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const recurring = await prisma.recurringTransaction.findUnique({ where: { id: params.id } });
  if (!recurring || recurring.familyId !== user.familyId) {
    return NextResponse.json({ detail: "Transazione ricorrente non trovata" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const data = {};
  if (body.amount !== undefined) data.amount = Number(body.amount);
  if (body.category !== undefined) data.category = body.category;
  if (body.description !== undefined) data.description = body.description;
  if (body.expense_type !== undefined) data.expenseType = body.expense_type;
  if (body.frequency !== undefined) data.frequency = body.frequency;
  if (body.next_run_date !== undefined) data.nextRunDate = new Date(body.next_run_date);
  if (body.active !== undefined) data.active = Boolean(body.active);

  await prisma.recurringTransaction.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const recurring = await prisma.recurringTransaction.findUnique({ where: { id: params.id } });
  if (!recurring || recurring.familyId !== user.familyId) {
    return NextResponse.json({ detail: "Transazione ricorrente non trovata" }, { status: 404 });
  }

  await prisma.recurringTransaction.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

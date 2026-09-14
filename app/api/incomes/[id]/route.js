import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function PUT(request, { params }) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const income = await prisma.income.findUnique({ where: { id: params.id } });
  if (!income || income.familyId !== user.familyId) {
    return NextResponse.json({ detail: "Entrata non trovata" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const data = {};
  if (body.amount !== undefined) data.amount = Number(body.amount);
  if (body.category !== undefined) data.category = body.category;
  if (body.description !== undefined) data.description = body.description;
  if (body.date !== undefined) data.date = new Date(body.date);

  await prisma.income.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const income = await prisma.income.findUnique({ where: { id: params.id } });
  if (!income || income.familyId !== user.familyId) {
    return NextResponse.json({ detail: "Entrata non trovata" }, { status: 404 });
  }

  await prisma.income.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

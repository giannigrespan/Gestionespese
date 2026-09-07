import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function DELETE(request, { params }) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const budget = await prisma.budget.findUnique({ where: { id: params.id } });
  if (!budget || budget.familyId !== user.familyId) {
    return NextResponse.json({ detail: "Budget non trovato" }, { status: 404 });
  }

  await prisma.budget.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

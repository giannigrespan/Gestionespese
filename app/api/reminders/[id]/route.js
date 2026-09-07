import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFamilyUser } from "@/lib/apiAuth";

export async function DELETE(request, { params }) {
  const { user, error } = await requireFamilyUser();
  if (error) return error;

  const reminder = await prisma.reminder.findUnique({ where: { id: params.id } });
  if (!reminder || reminder.familyId !== user.familyId) {
    return NextResponse.json({ detail: "Promemoria non trovato" }, { status: 404 });
  }

  await prisma.reminder.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

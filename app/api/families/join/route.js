import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";

export async function POST(request) {
  const { user, error } = await requireUser();
  if (error) return error;

  if (user.familyId) {
    return NextResponse.json({ detail: "Fai già parte di una famiglia" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const familyId = (body.family_id || "").trim();
  if (!familyId) {
    return NextResponse.json({ detail: "ID famiglia obbligatorio" }, { status: 400 });
  }

  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) {
    return NextResponse.json({ detail: "Famiglia non trovata" }, { status: 404 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { familyId: family.id } });

  return NextResponse.json({ family_id: family.id, name: family.name });
}

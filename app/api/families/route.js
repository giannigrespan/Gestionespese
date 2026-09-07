import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";

function genInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(request) {
  const { user, error } = await requireUser();
  if (error) return error;

  if (user.familyId) {
    return NextResponse.json({ detail: "Fai già parte di una famiglia" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const name = (body.name || "").trim();
  if (!name) {
    return NextResponse.json({ detail: "Il nome della famiglia è obbligatorio" }, { status: 400 });
  }

  const family = await prisma.family.create({
    data: { name, createdBy: user.id },
  });
  await prisma.user.update({ where: { id: user.id }, data: { familyId: family.id } });

  return NextResponse.json({ family_id: family.id, name: family.name });
}

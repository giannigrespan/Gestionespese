import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  if (!user.familyId) {
    return NextResponse.json({ detail: "Nessuna famiglia associata" }, { status: 404 });
  }

  const family = await prisma.family.findUnique({
    where: { id: user.familyId },
    include: { members: { select: { id: true, name: true, email: true } } },
  });

  if (!family) {
    return NextResponse.json({ detail: "Famiglia non trovata" }, { status: 404 });
  }

  return NextResponse.json({
    family_id: family.id,
    name: family.name,
    created_by: family.createdBy,
    members: family.members,
  });
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    family_id: user.familyId,
  });
}

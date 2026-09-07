import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ detail: "Non autenticato" }, { status: 401 }) };
  }
  return { user };
}

export async function requireFamilyUser() {
  const { user, error } = await requireUser();
  if (error) return { error };
  if (!user.familyId) {
    return { error: NextResponse.json({ detail: "Nessuna famiglia associata" }, { status: 400 }) };
  }
  return { user };
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { prisma } from "./db";

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

export async function requireApiKeyUser(request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return { error: NextResponse.json({ detail: "Header x-api-key mancante" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({ where: { apiKey } });
  if (!user) {
    return { error: NextResponse.json({ detail: "API key non valida" }, { status: 401 }) };
  }
  if (!user.familyId) {
    return { error: NextResponse.json({ detail: "Nessuna famiglia associata" }, { status: 400 }) };
  }
  return { user };
}

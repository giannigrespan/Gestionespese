import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ detail: "Email, password e nome sono obbligatori" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ detail: "La password deve avere almeno 8 caratteri" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ detail: "Esiste già un utente con questa email" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), passwordHash, name },
  });

  const token = signSession(user.id);
  setSessionCookie(token);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    family_id: user.familyId,
  });
}

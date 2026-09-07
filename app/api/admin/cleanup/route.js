import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Endpoint di pulizia dati di test, protetto da MIGRATE_SECRET. Cancella
// un utente e, se era l'unico membro, la sua famiglia (con le relative
// spese/budget/promemoria a cascata).
export async function POST(request) {
  const secret = process.env.MIGRATE_SECRET;
  if (!secret) {
    return NextResponse.json({ detail: "MIGRATE_SECRET non configurato" }, { status: 503 });
  }
  const provided = request.headers.get("x-migrate-secret");
  if (provided !== secret) {
    return NextResponse.json({ detail: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { email } = body;
  if (!email) {
    return NextResponse.json({ detail: "email obbligatoria" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ detail: "Utente non trovato" }, { status: 404 });
  }

  let familyDeleted = false;
  if (user.familyId) {
    const memberCount = await prisma.user.count({ where: { familyId: user.familyId } });
    await prisma.user.update({ where: { id: user.id }, data: { familyId: null } });
    if (memberCount === 1) {
      await prisma.family.delete({ where: { id: user.familyId } });
      familyDeleted = true;
    }
  }

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ deleted: true, familyDeleted });
}

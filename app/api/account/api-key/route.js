import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";

function maskKey(key) {
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const current = await prisma.user.findUnique({ where: { id: user.id }, select: { apiKey: true } });
  return NextResponse.json({
    has_api_key: !!current.apiKey,
    api_key_preview: current.apiKey ? maskKey(current.apiKey) : null,
  });
}

export async function POST() {
  const { user, error } = await requireUser();
  if (error) return error;

  const apiKey = crypto.randomBytes(24).toString("hex");
  await prisma.user.update({ where: { id: user.id }, data: { apiKey } });

  return NextResponse.json({ api_key: apiKey }, { status: 201 });
}

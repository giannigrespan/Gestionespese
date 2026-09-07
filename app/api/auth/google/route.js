import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getRedirectUri, buildAuthUrl } from "@/lib/googleAuth";

export async function GET(request) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ detail: "Login Google non configurato" }, { status: 503 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  cookies().set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  const redirectUri = getRedirectUri(request);
  const url = buildAuthUrl({ redirectUri, state });
  return NextResponse.redirect(url);
}

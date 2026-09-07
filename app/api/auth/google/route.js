import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getRedirectUri, buildAuthUrl } from "@/lib/googleAuth";

export async function GET(request) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ detail: "Login Google non configurato" }, { status: 503 });
  }

  // Il cookie di stato va impostato sullo stesso dominio su cui Google
  // farà il redirect di callback, altrimenti il browser non lo rimanda
  // indietro. Se l'utente è arrivato da un alias diverso (es. un altro
  // dominio *.vercel.app dello stesso progetto), lo portiamo prima sul
  // dominio canonico configurato in GOOGLE_REDIRECT_URI.
  if (process.env.GOOGLE_REDIRECT_URI) {
    const canonicalHost = new URL(process.env.GOOGLE_REDIRECT_URI).host;
    const currentHost = new URL(request.url).host;
    if (canonicalHost !== currentHost) {
      return NextResponse.redirect(`https://${canonicalHost}/api/auth/google`);
    }
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

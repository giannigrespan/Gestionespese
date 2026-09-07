import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";
import { getRedirectUri, exchangeCodeForToken, fetchGoogleUser } from "@/lib/googleAuth";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = cookies().get("google_oauth_state")?.value;
  cookies().delete("google_oauth_state");

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(new URL("/login?error=google_state", url.origin));
  }

  try {
    const redirectUri = getRedirectUri(request);
    const tokenData = await exchangeCodeForToken({ code, redirectUri });
    const profile = await fetchGoogleUser(tokenData.access_token);

    if (!profile.email) {
      return NextResponse.redirect(new URL("/login?error=google_no_email", url.origin));
    }

    let user = await prisma.user.findUnique({ where: { email: profile.email.toLowerCase() } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email.toLowerCase(),
          name: profile.name || profile.email,
          googleId: profile.id,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id } });
    }

    const token = signSession(user.id);
    setSessionCookie(token);

    return NextResponse.redirect(new URL("/dashboard", url.origin));
  } catch (err) {
    return NextResponse.redirect(new URL("/login?error=google_failed", url.origin));
  }
}

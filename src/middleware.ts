import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest, response: NextResponse) {
  const session = request.cookies.get("session");

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const responseAPI = await fetch(`${request.nextUrl.origin}/api/login`, {
      headers: {
        Cookie: `session=${session?.value}`,
      },
    });

    if (responseAPI.status !== 200) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup' || request.nextUrl.pathname === '/') {
    if (session) {

      const responseAPI = await fetch(`${request.nextUrl.origin}/api/login`, {
        headers: {
          Cookie: `session=${session?.value}`,
        },
      });

      if (responseAPI.status === 200) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/"],
};


// Reference = https://dev.to/geiel/how-to-use-firebase-authentication-in-nextjs-13-client-and-server-side-1bbn
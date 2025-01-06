import { NextResponse } from "next/server";

const protectedPaths = ["/profile"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token");
  if (!sessionToken && protectedPaths.includes(pathname)) {
    console.log("Session token not found. Redirecting to login");
    return NextResponse.redirect(new URL("/", request.url));
  } else if (sessionToken && pathname === "/") {
    console.log("Session token found. Redirecting to profile");
    return NextResponse.redirect(new URL("/profile", request.url));
  } else {
    console.log("Default response");
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/profile", "/"]
};

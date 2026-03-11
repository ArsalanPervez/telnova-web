import { NextResponse } from "next/server";

// Auth is handled client-side via zustand + localStorage.
// Middleware only passes requests through.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};

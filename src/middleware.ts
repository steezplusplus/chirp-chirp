import { withClerkMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default withClerkMiddleware(() => {
  console.log('moddleware running');
  return NextResponse.next();
});

// Prevents Middleware from running on static files
export const config = {
  matcher: '/((?!_next/image|_next/static|favicon.ico).*)',
};
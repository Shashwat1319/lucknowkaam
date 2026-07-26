import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://pagead2.googlesyndication.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src 'self' https://www.google.com https://api.razorpay.com https://checkout.razorpay.com",
    "connect-src 'self' https://rswszmbzykrzidndyeed.supabase.co https://api.github.com https://api.razorpay.com https://checkout.razorpay.com",
    "form-action 'self'",
    "base-uri 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|ads.txt|robots.txt|sitemap.xml).*)"],
};

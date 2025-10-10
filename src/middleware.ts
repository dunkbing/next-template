import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { i18n, type Locale } from "@/lib/i18n/config";

const { auth } = NextAuth(authConfig);

// Helper function to get locale from pathname
function getLocaleFromPathname(pathname: string): Locale | undefined {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];
  return i18n.locales.includes(potentialLocale as Locale)
    ? (potentialLocale as Locale)
    : undefined;
}

// Helper function to get preferred locale from request
function getPreferredLocale(request: NextRequest): Locale {
  // Check if there's a locale cookie
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (localeCookie && i18n.locales.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language");
  if (acceptLanguage) {
    // Parse Accept-Language header and find best match
    const languages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [locale, q = "1"] = lang.trim().split(";q=");
        return { locale: locale.split("-")[0], quality: Number.parseFloat(q) };
      })
      .sort((a, b) => b.quality - a.quality);

    for (const { locale } of languages) {
      if (i18n.locales.includes(locale as Locale)) {
        return locale as Locale;
      }
    }
  }

  return i18n.defaultLocale;
}

async function i18nMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Check if there is a locale in the pathname
  const pathnameLocale = getLocaleFromPathname(pathname);

  // If pathname has a valid locale, continue
  if (pathnameLocale) {
    return NextResponse.next();
  }

  // Redirect to URL with locale if not present
  const locale = getPreferredLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export default auth(async (req) => {
  // First handle i18n routing
  const i18nResponse = await i18nMiddleware(req);
  if (i18nResponse.status === 307 || i18nResponse.status === 308) {
    return i18nResponse;
  }

  // Then handle auth (NextAuth will handle protected routes)
  return NextResponse.next();
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

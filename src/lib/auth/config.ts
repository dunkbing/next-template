import { NextAuthConfig } from "next-auth";
import { i18n } from "@/lib/i18n/config";

function getLocaleFromPathname(pathname: string) {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];
  return i18n.locales.includes(potentialLocale as any)
    ? potentialLocale
    : i18n.defaultLocale;
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const locale = getLocaleFromPathname(nextUrl.pathname);

      // Check if pathname includes locale prefix
      const pathnameWithoutLocale = nextUrl.pathname.replace(
        new RegExp(`^/${locale}`),
        "",
      );
      const isOnDashboard = pathnameWithoutLocale.startsWith("/dashboard");
      const isOnLoginPage = pathnameWithoutLocale.startsWith("/login");
      const isOnRegisterPage = pathnameWithoutLocale.startsWith("/register");
      const isOnHomePage =
        pathnameWithoutLocale === "" || pathnameWithoutLocale === "/";

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      // Redirect logged-in users away from login/register to dashboard
      if (isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
        return Response.redirect(new URL(`/${locale}/dashboard`, nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

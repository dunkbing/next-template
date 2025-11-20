"use client";

import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { handleSignOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { useSession } from "@/lib/auth-client";
import { LanguageSwitcher } from "./language-switcher";
import { TabNavigation } from "./tab-navigation";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  isHome?: boolean;
}

export function DashboardLayout({
  children,
  lang,
  dict,
}: {
  children: React.ReactNode;
  lang: Locale;
  dict: Dictionary;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const navigation: NavItem[] = [
    {
      name: dict.dashboard.title,
      href: `/${lang}/dashboard`,
      icon: LayoutDashboard,
      isHome: true,
    },
    {
      name: dict.users.title,
      href: `/${lang}/dashboard/users`,
      icon: Users,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex md:flex-col border-r transition-all duration-300 ${
          isCollapsed ? "md:w-20" : "md:w-64"
        }`}
      >
        <div className="flex items-center h-16 px-6 border-b justify-between">
          {!isCollapsed && <h1 className="text-xl font-bold">App</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={isCollapsed ? "mx-auto" : ""}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.name}>
              <button
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{item.name}</span>
                )}
              </button>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t">
          {!isCollapsed && (
            <div className="mb-3 px-3">
              <p className="text-sm font-medium truncate">{userEmail}</p>
            </div>
          )}
          <form action={handleSignOut}>
            <input type="hidden" name="locale" value={lang} />
            <Button
              type="submit"
              variant="ghost"
              className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
              title={isCollapsed ? dict.common.signOut : undefined}
            >
              <LogOut className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
              {!isCollapsed && dict.common.signOut}
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with tabs */}
        <div className="h-16 border-b flex items-center px-4 gap-2">
          <button className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <TabNavigation />
          <div className="ml-auto">
            <LanguageSwitcher currentLang={lang} />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

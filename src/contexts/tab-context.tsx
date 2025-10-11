"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface Tab {
  path: string;
  name: string;
}

interface TabContextType {
  tabs: Tab[];
  addTab: (tab: Tab) => void;
  removeTab: (path: string) => void;
  clearOtherTabs: (currentPath: string) => void;
  reorderTabs: (oldIndex: number, newIndex: number) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

const getTabName = (path: string): string => {
  if (path === "/dashboard") return "Dashboard";
  const segments = path.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (!lastSegment) return "";
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
};

export function TabProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [tabs, setTabs] = useState<Tab[]>([
    { path: "/dashboard", name: "Dashboard" },
  ]);

  // Add tab when pathname changes
  useEffect(() => {
    // Skip adding tab for plan-optimise as it has a fixed tab
    if (pathname === "/dashboard/plan-optimise") {
      return;
    }

    setTabs((prev) => {
      const exists = prev.some((tab) => tab.path === pathname);
      if (!exists) {
        return [...prev, { path: pathname, name: getTabName(pathname) }];
      }
      return prev;
    });
  }, [pathname]);

  const addTab = (tab: Tab) => {
    setTabs((prev) => {
      if (prev.some((t) => t.path === tab.path)) return prev;
      return [...prev, tab];
    });
  };

  const removeTab = (path: string) => {
    setTabs((prev) => prev.filter((tab) => tab.path !== path));
  };

  const clearOtherTabs = (currentPath: string) => {
    setTabs((prev) => prev.filter((tab) => tab.path === currentPath));
  };

  const reorderTabs = (oldIndex: number, newIndex: number) => {
    setTabs((prev) => {
      const newTabs = [...prev];
      const [removed] = newTabs.splice(oldIndex, 1);
      newTabs.splice(newIndex, 0, removed);
      return newTabs;
    });
  };

  return (
    <TabContext.Provider
      value={{ tabs, addTab, removeTab, clearOtherTabs, reorderTabs }}
    >
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabs must be used within TabProvider");
  }
  return context;
}

"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createContextualCan } from "@casl/react";
import { useSession } from "next-auth/react";
import { type AppAbility, defineAbilityFor } from "./ability";

const AbilityContext = createContext<AppAbility>(defineAbilityFor([]));

export const Can = createContextualCan(AbilityContext.Consumer);

export function AbilityProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  const ability = useMemo(() => {
    const permissions = session?.user?.permissions || [];
    return defineAbilityFor(permissions);
  }, [session?.user?.permissions]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  return useContext(AbilityContext);
}

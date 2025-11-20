"use client";

import { createContextualCan } from "@casl/react";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { SelectRole } from "@/db/schema";
import { type AppAbility, defineAbilityFor } from "./ability";

const AbilityContext = createContext<AppAbility>(defineAbilityFor([]));

interface RolesContextValue {
  roles: SelectRole[];
  canEditUsers: boolean;
}

const RolesContext = createContext<RolesContextValue>({
  roles: [],
  canEditUsers: false,
});

export const Can = createContextualCan(AbilityContext.Consumer);

export function AbilityProvider({
  children,
  roles = [],
  permissions = [],
}: {
  children: ReactNode;
  roles?: SelectRole[];
  permissions?: string[];
}) {
  const ability = useMemo(() => {
    return defineAbilityFor(permissions);
  }, [permissions]);

  const canEditUsers = useMemo(() => ability.can("update", "User"), [ability]);

  const rolesContextValue = useMemo(
    () => ({
      roles,
      canEditUsers,
    }),
    [roles, canEditUsers],
  );

  return (
    <AbilityContext.Provider value={ability}>
      <RolesContext.Provider value={rolesContextValue}>
        {children}
      </RolesContext.Provider>
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  return useContext(AbilityContext);
}

export function useRoles() {
  return useContext(RolesContext);
}

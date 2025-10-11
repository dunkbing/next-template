"use client";

import { createContextualCan } from "@casl/react";
import { useSession } from "next-auth/react";
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
}: {
  children: ReactNode;
  roles?: SelectRole[];
}) {
  const { data: session } = useSession();

  const ability = useMemo(() => {
    const permissions = session?.user?.permissions || [];
    return defineAbilityFor(permissions);
  }, [session?.user?.permissions]);

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

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ClerkProvider,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
} from "@clerk/clerk-react";
import { CLERK_PUBLISHABLE_KEY, TEST_ACCOUNTS } from "./client";

export interface AppAuthContextType {
  userId: string | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  userEmail?: string;
  userName?: string;
  userPhoto?: string;
  userRole?: string;
  userLab?: string;
}

const AppAuthContext = createContext<AppAuthContextType>({
  userId: null,
  isSignedIn: false,
  isLoaded: false,
});

function InnerAuthProvider({ children }: { children: React.ReactNode }) {
  const { userId, isSignedIn, isLoaded: authLoaded } = useClerkAuth();
  const { user, isLoaded: userLoaded } = useClerkUser();

  const isLoaded = Boolean(authLoaded && (isSignedIn ? userLoaded : true));
  const email = user?.primaryEmailAddress?.emailAddress;
  const fullName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";

  // Derive role and resident lab based on test accounts or email
  const matchedAccount = TEST_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email?.toLowerCase()
  );
  const role = matchedAccount ? matchedAccount.role : "Teacher Training Manager";
  const lab = matchedAccount ? (matchedAccount as any).lab : "Warren Park Hub Lab (Dual-Role)";

  const value: AppAuthContextType = {
    userId: userId ?? null,
    isSignedIn: Boolean(isSignedIn),
    isLoaded,
    userEmail: email,
    userName: fullName || (matchedAccount ? matchedAccount.name : "Anesu Muchirewesi"),
    userPhoto: user?.imageUrl,
    userRole: role,
    userLab: lab,
  };

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      {mounted ? (
        <InnerAuthProvider>{children}</InnerAuthProvider>
      ) : (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground font-display font-extrabold text-lg shadow-xs animate-pulse">
              u.
            </div>
            <p className="font-display text-xs font-semibold text-muted-foreground animate-pulse">
              Loading workspace...
            </p>
          </div>
        </div>
      )}
    </ClerkProvider>
  );
}

export function useAppAuth(): AppAuthContextType {
  return useContext(AppAuthContext);
}

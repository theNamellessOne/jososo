"use client";

import { UserData } from "@/lib";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  type PropsWithChildren,
} from "react";

type AuthContextType = {
  user: UserData | null;
  hasValidSubscription: boolean;
};

type AuthProviderProps = PropsWithChildren<AuthContextType>;

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = (props: AuthProviderProps) => {
  const router = useRouter();

  useEffect(() => {
    if (!props.user) return;

    fetch(`/api/custom-claims`, {
      method: "POST",
    }).then(router.refresh);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: props.user,
        hasValidSubscription: props.hasValidSubscription,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

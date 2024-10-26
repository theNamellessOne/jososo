"use client";

import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm, RegisterForm } from "@/app/(features)/auth";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type AuthActiveState = "login" | "register";

export const AuthCard = () => {
  const [active, setActive] = useState<AuthActiveState>("login");

  const cardFooterContent = useMemo(() => {
    if (active === "register") {
      return (
        <div className="flex flex-row items-center justify-center">
          <p className="text-sm muted">Already have an account?</p>
          <Button variant="link" onClick={() => setActive("login")}>
            Login now
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-row items-center justify-center">
        <p className="text-sm muted">Don't have an account yet?</p>
        <Button variant="link" onClick={() => setActive("register")}>
          Register now
        </Button>
      </div>
    );
  }, [active]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center">
        <CardTitle>Jobsenderbot</CardTitle>
        <CardDescription>Find your dream job, fast</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="my-8">
          <Separator orientation="horizontal" className="shrink grow" />
        </div>

        {active === "login" && <LoginForm />}
        {active === "register" && <RegisterForm />}

        <div className="mb-4 mt-8">
          <Separator orientation="horizontal" className="shrink grow" />
        </div>

        {cardFooterContent}
      </CardContent>
    </Card>
  );
};

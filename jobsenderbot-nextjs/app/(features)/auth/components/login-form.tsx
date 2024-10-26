"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormField } from "@/components/form-field";
import { LoaderButton } from "@/components/loader-button";
import {
  loginSchema,
  type LoginSchemaType,
  login,
} from "@/app/(features)/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const LoginForm = () => {
  const form = useForm<LoginSchemaType>({
    mode: "all",
    resolver: zodResolver(loginSchema),
  });

  const { isValid, isSubmitting } = form.formState;
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword, setShowPassword]);

  const router = useRouter();

  const onSubmit = useCallback(
    async (data: LoginSchemaType) => {
      const response = await login(data);

      response.success
        ? toast.success(response.message)
        : toast.error(response.message);

      if (response.success) {
        router.push("/dashboard");
        router.refresh();
      }
    },
    [form],
  );

  const passwordFieldLabel = useMemo(() => {
    return (
      <div className="flex flex-row items-center justify-between">
        <p>Password</p>

        <Button
          variant="link"
          type="button"
          size="sm"
          className="text-muted-foreground"
          onClick={() => router.push("auth/reset-password")}
        >
          Forgot password?
        </Button>
      </div>
    );
  }, []);

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          name="email"
          label="Email"
          register={(field) => {
            return <Input {...field} />;
          }}
        />

        <FormField
          name="password"
          label={passwordFieldLabel}
          register={(field) => {
            return (
              <div className="relative">
                <Input {...field} type={showPassword ? "text" : "password"} />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-0 top-0 p-2"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            );
          }}
        />
        <div></div>

        <LoaderButton
          isLoading={isSubmitting}
          isDisabled={!isValid || isSubmitting}
        >
          Login
        </LoaderButton>
      </form>
    </FormProvider>
  );
};

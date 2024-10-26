"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormField } from "@/components/form-field";
import { LoaderButton } from "@/components/loader-button";
import {
  login,
  register,
  registerSchema,
  type RegisterSchemaType,
} from "@/app/(features)/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const RegisterForm = () => {
  const form = useForm<RegisterSchemaType>({
    mode: "all",
    resolver: zodResolver(registerSchema),
  });

  const { isValid, isSubmitting } = form.formState;
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword, setShowPassword]);

  const router = useRouter();

  const onSubmit = useCallback(
    async (data: RegisterSchemaType) => {
      const response = await register(data);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      const loginResponse = await login(data);

      loginResponse.success
        ? toast.success(loginResponse.message)
        : toast.error(loginResponse.message);

      if (loginResponse.success) {
        router.push("/dashboard");
        router.refresh();
      }
    },
    [form],
  );

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          name="name"
          label="Name"
          register={(field) => {
            return <Input {...field} />;
          }}
        />

        <FormField
          name="email"
          label="Email"
          register={(field) => {
            return <Input {...field} />;
          }}
        />

        <FormField
          name="password"
          label="Password"
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

        <LoaderButton
          isLoading={isSubmitting}
          isDisabled={!isValid || isSubmitting}
        >
          Register
        </LoaderButton>
      </form>
    </FormProvider>
  );
};

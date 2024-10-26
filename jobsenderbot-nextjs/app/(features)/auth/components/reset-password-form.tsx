"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  sendResetPasswordEmail,
  resetPasswordSchema,
  type ResetPasswordSchemaType,
} from "@/app/(features)/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { LoaderButton } from "@/components/loader-button";
import { FormField } from "@/components/form-field";
import { useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ResetPasswordForm = () => {
  const form = useForm<ResetPasswordSchemaType>({
    mode: "all",
    resolver: zodResolver(resetPasswordSchema),
  });

  const router = useRouter();

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = useCallback(
    (data: ResetPasswordSchemaType) => {
      sendResetPasswordEmail(data).then((response) => {
        response.success
          ? toast.success(response.message)
          : toast.error(response.message);
      });
    },
    [form],
  );

  return (
    <FormProvider {...form}>
      <Card className="w-full max-w-md">
        <CardHeader className="items-center relative">
          <Button
            variant="ghost"
            type="button"
            size="icon"
            className="absolute left-2 top-2"
            onClick={() => router.back()}
          >
            <ArrowLeft />
          </Button>
          <CardTitle>Jobsenderbot</CardTitle>
          <CardDescription>Find your dream job, fast</CardDescription>
        </CardHeader>

        <CardContent>
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

            <LoaderButton
              isLoading={isSubmitting}
              isDisabled={!isValid || isSubmitting}
            >
              Reset password
            </LoaderButton>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};

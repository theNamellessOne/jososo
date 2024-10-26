import {
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { type ReactNode } from "react";
import {
  type ControllerRenderProps,
  type FieldValues,
  useFormContext,
} from "react-hook-form";

type FormFieldProps = {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  controlPosition?: "beforeLabel" | "afterLabel";
  register: (field: ControllerRenderProps<FieldValues, string>) => ReactNode;
};

export function FormField(props: FormFieldProps) {
  const { control } = useFormContext();
  const { controlPosition = "afterLabel" } = props;

  return (
    <ShadcnFormField
      control={control}
      name={props.name}
      render={({ field }) => {
        return (
          <FormItem>
            {controlPosition === "beforeLabel" && (
              <FormControl>{props.register(field)}</FormControl>
            )}

            {props.label && <FormLabel>{props.label}</FormLabel>}

            {controlPosition === "afterLabel" && (
              <FormControl>{props.register(field)}</FormControl>
            )}

            <FormMessage />

            {props.description && (
              <FormDescription>{props.description}</FormDescription>
            )}
          </FormItem>
        );
      }}
    />
  );
}

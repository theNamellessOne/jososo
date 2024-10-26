"use client";

import { useRef } from "react";
import { FormField } from "@/components/form-field";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const BadgeInputField = (props: {
  label: string;
  name: string;
  description?: string;
  items: string[];
  removeItem: (idx: number) => void;
  appendItem: (item: string) => void;
  error?: string;
}) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <FormField
      label={props.label}
      name={props.name}
      description={props.description}
      register={() => {
        return (
          <div className="flex flex-col gap-2">
            <div className={"flex gap-2 flex-wrap"}>
              {props.items.map((item, idx) => (
                <Badge
                  key={idx}
                  className="cursor-pointer"
                  onClick={() => {
                    props.removeItem(idx);
                  }}
                >
                  {item}
                </Badge>
              ))}
            </div>

            {props.error && (
              <span className={"text-red-500 font-medium"}>{props.error}</span>
            )}

            <Input
              ref={ref}
              onKeyUp={(e) => {
                if (ref.current === null) return;

                if (e.key !== ",") return;

                const value = ref.current.value.trim().split(",")[0];

                if (!value) return;
                if (props.items.find((v) => v === value)) return;

                props.appendItem(value);

                ref.current.value = "";
              }}
            />
          </div>
        );
      }}
    />
  );
};

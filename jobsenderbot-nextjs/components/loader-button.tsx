"use client";

import { Button } from "@/components/ui/button";
import { LoadingIcon } from "@/components/icons";
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  isLoading?: boolean;
  isDisabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}>;

const MotionButton = motion.create(Button);

export const LoaderButton = (props: Props) => {
  return (
    <MotionButton
      type={props.type ?? "submit"}
      layout
      className="flex w-full items-center justify-center gap-2"
      disabled={!!props.isDisabled}
      onClick={props.onClick}
    >
      <LoadingIcon show={!!props.isLoading} />
      {props.children}
    </MotionButton>
  );
};

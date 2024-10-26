import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type Props = {
  show: boolean;
  className?: string;
};

const MotionLoader = motion(Loader2);

export const variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const LoadingIcon = (props: Props) => {
  return (
    <AnimatePresence mode="popLayout">
      {props.show && (
        <MotionLoader
          layout
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn("size-5 animate-spin", props.className)}
        />
      )}
    </AnimatePresence>
  );
};

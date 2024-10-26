import { cn } from "@/lib/utils";
import { LoadingIcon } from "@/components/icons";

type Props = {
  className?: string;
};

export const LoadingOverlay = (props: Props) => {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur z-40",
        props.className,
      )}
    >
      <LoadingIcon show={true} className={"size-8 z-50"} />
    </div>
  );
};

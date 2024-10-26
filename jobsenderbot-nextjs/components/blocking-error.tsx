import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{}>;

export const BlockingError = (props: Props) => {
  return (
    <div className="absolute inset-0 rounded-md bg-primary/10 z-40 backdrop-blur">
      {props.children}
    </div>
  );
};

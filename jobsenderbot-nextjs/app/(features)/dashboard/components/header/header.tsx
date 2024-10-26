import { Logo } from "./logo";
import { Avatar } from "./avatar";

export const Header = () => {
  return (
    <header className="flex items-center justify-between py-4 px-8 sm:px-12 lg:px-16">
      <Logo />
      <Avatar />
    </header>
  );
};

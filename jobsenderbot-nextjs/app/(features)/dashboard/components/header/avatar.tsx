"use client";

import { logout, useAuth } from "@/app/(features)/auth";
import { AvatarFallback, Avatar as ShadcnAvatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, Headset, LogOut } from "lucide-react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createStripeCustomerPortalSession } from "@/app/(features)/dashboard";
import { LoadingIcon } from "@/components/icons";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const Alert = () => {
  return (
    <div className={"ml-auto mr-2 bg-red-500 rounded-full p-0.5"}>
      <Icon icon="bi:exclamation-lg" className={"text-background size-3.5"} />
    </div>
  );
};

export const Avatar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isSubscriptionValid = useMemo(() => {
    return user.subscriptionValidTo > Date.now() / 1000;
  }, [user.subscriptionValidTo]);

  const showAlert = useMemo(() => {
    return !isSubscriptionValid || !user.linkedinConnected;
  }, [isSubscriptionValid, user.linkedinConnected]);

  const handleLogout = () => {
    logout().then((response) => {
      response.success
        ? toast.success(response.message)
        : toast.error(response.message);

      router.refresh();
    });
  };

  const customerPortalQuery = useQuery({
    queryKey: ["stripeCustomerPortalSession"],
    queryFn: () => createStripeCustomerPortalSession(),
    enabled: false,
  });

  useEffect(() => {
    if (!customerPortalQuery.isLoading) return;

    setOpen(true);
  }, [customerPortalQuery.isLoading]);

  useEffect(() => {
    if (!customerPortalQuery.data) return;

    router.push(customerPortalQuery.data);
  }, [customerPortalQuery.data]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <div className="relative">
          <ShadcnAvatar>
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </ShadcnAvatar>

          {showAlert && (
            <div className="absolute -top-0.5 -right-0.5 rounded-full p-0.5 bg-red-500">
              <Icon
                icon="bi:exclamation-lg"
                className="text-background size-3"
              />
            </div>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-[200px]">
        <DropdownMenuLabel>
          <span className="mr-2">👋</span>
          <span>Hi, {user.name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => customerPortalQuery.refetch()}>
            <CreditCard className={"mr-2 size-4"} />
            <span>Subscription</span>
            {!customerPortalQuery.isLoading && !isSubscriptionValid && (
              <Alert />
            )}

            <LoadingIcon
              show={!!customerPortalQuery.isLoading}
              className={"ml-auto mr-2"}
            />
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon="ri:linkedin-line" className={"mr-2 size-4"} />
            <span>LinkedIn</span>
            {!user.linkedinConnected && <Alert />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Headset className={"mr-2 size-4"} />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className={"mr-2 size-4"} />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/(features)/auth";
import { useRouter } from "next/navigation";
import { createPaymentSession } from "@/app/(features)/dashboard";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const NoSubscriptionAlert = () => {
  const router = useRouter();
  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
  const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

  const { user, hasValidSubscription } = useAuth();

  if (!user || hasValidSubscription) return null;

  const handleSubscribeMonthly = () => {
    createPaymentSession(monthlyPriceId!, user.customerId).then((response) => {
      response.success
        ? toast.success(response.message)
        : toast.error(response.message);

      if (response.success) {
        router.push(response.data);
      }
    });
  };

  const handleSubscribeYearly = () => {
    createPaymentSession(yearlyPriceId!, user.customerId).then((response) => {
      response.success
        ? toast.success(response.message)
        : toast.error(response.message);

      if (response.success) {
        router.push(response.data);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row gap-2 items-center">
          <AlertTriangle className="text-red-500 h-6 w-6" />
          It looks like you don't have a subscription yet.
        </CardTitle>
        <CardDescription>
          You can subscribe to JobsenderBot for{" "}
          <Button
            className="p-0"
            variant="link"
            onClick={handleSubscribeMonthly}
          >
            $20.00 per month
          </Button>{" "}
          or{" "}
          <Button
            variant="link"
            className="p-0"
            onClick={handleSubscribeYearly}
          >
            $200.00 per year.
          </Button>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

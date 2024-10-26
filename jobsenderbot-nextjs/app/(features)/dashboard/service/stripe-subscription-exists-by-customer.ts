"use server";

import { stripe } from "@/lib/stripe";
import { type BasicReturn } from "@/app/types";

export const stripeSubscriptionExistsByCustomer = async (
  customerId: string,
): Promise<BasicReturn<boolean>> => {
  try {
    const subscriptions = await stripe().subscriptions.list({
      customer: customerId,
      limit: 3,
    });

    return {
      success: true,
      message: "Stripe subscription exists",
      data: subscriptions.data.length > 0,
    };
  } catch {
    return {
      success: false,
      message: "Error retrieving stripe subscriptions. Please try again later",
    };
  }
};

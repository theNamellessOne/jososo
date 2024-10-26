"use server";

import { stripe } from "@/lib/stripe";
import { type BasicReturn } from "@/app/types";

export const createPaymentSession = async (
  priceId: string,
  customerId: string,
): Promise<BasicReturn<string>> => {
  try {
    const session = await stripe().checkout.sessions.create({
      success_url: process.env.NEXT_PUBLIC_APP_URL + "/dashboard",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: customerId,
    });

    if (!session.url)
      return {
        success: false,
        message:
          "Error creating stripe payment session. Please try again later",
      };

    return {
      success: true,
      data: session.url,
      message: "Stripe payment session created successfully",
    };
  } catch {
    return {
      success: false,
      message: "Error creating stripe payment session. Please try again later",
    };
  }
};

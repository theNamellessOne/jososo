"use server";

import { authConfig, stripe } from "@/lib";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";

export const createStripeCustomerPortalSession = async () => {
  const tokens = await getTokens(cookies(), authConfig);

  if (!tokens) {
    throw new Error(
      "Cannot create Stripe customer portal session of unauthenticated user",
    );
  }

  if (typeof tokens.decodedToken.customerId !== "string") {
    throw new Error(
      "Cannot create Stripe customer portal session of user without Stripe customer ID",
    );
  }

  const stripeCustomerPortalSession =
    await stripe().billingPortal.sessions.create({
      customer: tokens.decodedToken.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

  return stripeCustomerPortalSession.url;
};

import { exit } from "process";
import { Stripe } from "stripe";

export const stripe = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    exit(
      "Cannot instantiate Stripe client. STRIPE_SECRET_KEY needs to be set in environment variables.",
    );
  }

  return new Stripe(stripeSecretKey, {
    typescript: true,
  });
};

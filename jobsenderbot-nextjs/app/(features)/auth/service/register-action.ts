"use server";

import {
  auth,
  getAdminFirestore,
  userInfoCollection,
  type UserInfo,
} from "@/lib";
import { type RegisterSchemaType, registerSchema } from "@/app/(features)/auth";
import { AuthErrorCodes, createUserWithEmailAndPassword } from "firebase/auth";
import { stripe } from "@/lib";
import { BasicReturn } from "@/app/types";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const register = async (
  input: RegisterSchemaType,
): Promise<BasicReturn> => {
  const { email, password, name } = input;

  const validatedInput = registerSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      message: validatedInput.error.message,
    };
  }

  try {
    const stripeCustomer = await stripe().customers.create({
      name,
      email,
    });

    const sub = await stripe().subscriptions.create({
      customer: stripeCustomer.id,
      items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
        },
      ],
      trial_period_days: 7,
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      trial_settings: {
        end_behavior: {
          missing_payment_method: "pause",
        },
      },
    });

    await createUserWithEmailAndPassword(auth, email, password);

    const trialEnd = (Date.now() + SEVEN_DAYS) / 1000;

    const userInfo: UserInfo = {
      name: name,
      email: email,
      isTrial: true,
      subscriptionValidTo: trialEnd,
      linkedinConnected: false,
      customerId: stripeCustomer.id,
    };

    await getAdminFirestore().collection(userInfoCollection).add(userInfo);

    return {
      success: true,
      message: "Successfully registered! You can now login!",
    };
  } catch (error) {
    if (!(error instanceof Error) || !error.message) {
      return {
        message: "An unexpected error occurred. Please try again later.",
      };
    }

    if (error.message.includes(AuthErrorCodes.EMAIL_EXISTS)) {
      return {
        message: "Email already exists.",
      };
    }

    return {
      message: error.message,
    };
  }
};

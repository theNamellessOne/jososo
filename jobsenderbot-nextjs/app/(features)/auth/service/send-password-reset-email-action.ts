"use server";

import { auth } from "@/lib/firebase/firebase";
import {
  ResetPasswordSchemaType,
  resetPasswordSchema,
} from "@/app/(features)/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { BasicReturn } from "@/app/types";

export const sendResetPasswordEmail = async (
  input: ResetPasswordSchemaType,
): Promise<BasicReturn> => {
  const { email } = input;

  const validatedInput = resetPasswordSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      message: validatedInput.error.message,
    };
  }

  try {
    await sendPasswordResetEmail(auth, email);

    return {
      success: true,
      message: `Successfully sent reset password email to ${email}`,
    };
  } catch (error) {
    if (!(error instanceof Error) || !error.message) {
      return {
        message: "An unexpected error occurred. Please try again later.",
      };
    }

    return {
      message: error.message,
    };
  }
};

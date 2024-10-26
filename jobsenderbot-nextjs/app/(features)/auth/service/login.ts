import { auth } from "@/lib/firebase/firebase";
import { LoginSchemaType, loginSchema } from "@/app/(features)/auth";
import { signInWithEmailAndPassword, AuthErrorCodes } from "firebase/auth";
import { exit } from "process";
import { BasicReturn } from "@/app/types";

export const login = async (input: LoginSchemaType): Promise<BasicReturn> => {
  const { email, password } = input;

  const validatedInput = loginSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      message: validatedInput.error.message,
    };
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    const idToken = await credential.user.getIdToken();

    const loginResponse = await fetch(`/api/login`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (loginResponse.status !== 200) {
      return {
        message: "An unexpected error occurred. Please try again later.",
      };
    }

    const customClaimsResponse = await fetch(`/api/custom-claims`, {
      method: "POST",
    });

    if (customClaimsResponse.status !== 200) {
      const logoutResponse = await fetch(`/api/logout`, {
        method: "POST",
      });

      if (logoutResponse.status !== 200) {
        exit();
      }

      return {
        message: "An unexpected error occurred. Please try again later.",
      };
    }

    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    if (!(error instanceof Error) || !error.message) {
      return {
        message: "An unexpected error occurred. Please try again later.",
      };
    }

    if (error.message.includes(AuthErrorCodes.INVALID_LOGIN_CREDENTIALS)) {
      return {
        message: "Invalid email or password.",
      };
    }

    return {
      message: error.message,
    };
  }
};

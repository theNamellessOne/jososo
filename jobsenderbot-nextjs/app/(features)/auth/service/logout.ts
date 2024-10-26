import { BasicReturn } from "@/app/types";

export const logout = async (): Promise<BasicReturn> => {
  const response = await fetch(`/api/logout`, {
    method: "POST",
  });

  if (response.status !== 200) {
    return {
      message: "An unexpected error occurred. Please try again later.",
    };
  }

  return {
    success: true,
    message: "Logout successful",
  };
};

import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";
import { refreshNextResponseCookies } from "next-firebase-auth-edge/lib/next/cookies";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/config/server-config";
import { getAdminFirestore, userInfoCollection } from "@/lib";

const { setCustomUserClaims, getUser } = getFirebaseAuth({
  serviceAccount: authConfig.serviceAccount,
  apiKey: authConfig.apiKey,
});

export async function POST(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);

  if (!tokens) {
    throw new Error("Cannot update custom claims of unauthenticated user");
  }

  const docs = await getAdminFirestore()
    .collection(userInfoCollection)
    .where("email", "==", tokens.decodedToken.email)
    .get();

  const customClaims = docs.docs[0].data();

  await setCustomUserClaims(tokens.decodedToken.uid, {
    ...customClaims,
  });

  const user = await getUser(tokens.decodedToken.uid);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = new NextResponse(
    JSON.stringify({
      customClaims: user?.customClaims,
    }),
    {
      status: 200,
      headers,
    },
  );

  return refreshNextResponseCookies(request, response, authConfig);
}

const sqlite3 = require("sqlite3").verbose();

import { getSqliteUserByEmail } from "@/app/(features)/dashboard/service/get-sqlite-user-by-email";
import { authConfig, getAdminFirestore, userInfoCollection } from "@/lib";
import { getTokens } from "next-firebase-auth-edge";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest } from "next/server";

const sqliteConnectionString = process.env.SQLITE_DB_CONNECTION_STRING!;

if (!sqliteConnectionString) {
  process.exit("SQLITE_DB_CONNECTION_STRING is not set");
}

export async function POST(req: NextRequest) {
  const cookies = new RequestCookies(
    new Headers({
      Cookie: `AuthToken=${req.headers.get("Authorization")}`,
    }),
  );

  const tokens = await getTokens(cookies, authConfig);

  if (!tokens) {
    return new Response("Please login to Jobsenderbot", { status: 401 });
  }

  const body = await req.json();

  const { linkedInCookies } = body;

  // TODO: additional linkedin cookies validation
  if (!linkedInCookies) {
    return new Response("Please login to Linkedin", { status: 401 });
  }

  const isSubscriptionValid =
    (tokens.decodedToken.subscriptionValidTo as number) > Date.now() / 1000;

  if (!isSubscriptionValid) {
    return new Response("Your subscription has expired", { status: 401 });
  }

  const userInfo = await getAdminFirestore()
    .collection(userInfoCollection)
    .where("email", "==", tokens.decodedToken.email)
    .get();

  // TODO: Save cookies to database
  userInfo.docs[0].ref.update({
    linkedinConnected: true,
  });

  const cookieString = linkedInCookies
    .map((cookie: any) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const userId = await getSqliteUserByEmail(tokens.decodedToken!.email!);

  const db = new sqlite3.Database(
    sqliteConnectionString,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err: any) => {
      if (err) {
        return console.error(err.message);
      }
    },
  );

  if (userId) {
    db.run("update users set cookie = ? where id = ?", [cookieString, userId]);
  } else {
    db.run("INSERT OR REPLACE INTO users (email, cookie) VALUES (?, ? )", [
      tokens.decodedToken.email,
      cookieString,
    ]);
  }

  return new Response("Success");
}

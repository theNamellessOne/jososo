import Stripe from "stripe";
import { getAdminFirestore, stripe, userInfoCollection } from "@/lib";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { QuerySnapshot } from "firebase/firestore";

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  process.exit("Stripe webhook secret not set");
}

export const POST = async (req: NextRequest, _: NextResponse) => {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  if (!body || !sig) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  let customerId: string;
  let subscriptionId: string;

  switch (event.type) {
    case "invoice.paid":
      subscriptionId = event.data.object.lines.data[0].subscription as string;
      customerId = event.data.object.customer as string;

      console.log("updated");
      console.log(JSON.stringify(event));
      await grantAccessToCustomer(customerId, subscriptionId);

      break;
    case "customer.subscription.resumed":
      subscriptionId = event.data.object.id;
      customerId = event.data.object.customer as string;

      console.log("resumed");
      await grantAccessToCustomer(customerId, subscriptionId);

      break;
    case "customer.subscription.deleted":
      customerId = event.data.object.customer as string;

      console.log("deleted");
      await removeAccessFromCustomer(customerId);

      break;
    case "customer.subscription.paused":
      customerId = event.data.object.customer as string;

      console.log("paused");
      await removeAccessFromCustomer(customerId);

      break;
  }

  return new NextResponse(null, { status: 200 });
};

const grantAccessToCustomer = async (
  customerId: string,
  subscriptionId: string,
) => {
  const docs = await getAdminFirestore()
    .collection(userInfoCollection)
    .where("customerId", "==", customerId)
    .get();

  const subscription = await stripe().subscriptions.retrieve(subscriptionId);

  docs.forEach((doc: any) => {
    doc.ref.update({
      subscriptionValidTo: subscription.current_period_end,
    });
  });
};

const removeAccessFromCustomer = async (customerId: string) => {
  const docs = await getAdminFirestore()
    .collection(userInfoCollection)
    .where("customerId", "==", customerId)
    .get();

  docs.forEach((doc: any) => {
    doc.ref.update({
      subscriptionValidTo: Date.now() / 1000 - 1000,
    });
  });
};

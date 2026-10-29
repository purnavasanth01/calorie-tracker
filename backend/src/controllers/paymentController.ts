import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import { User } from "../models/User";

const PREMIUM_PRICE_USD_CENTS = 499;

function markPremium(userId: string): Promise<unknown> {
  return User.findByIdAndUpdate(userId, { isPremium: true }).exec();
}

export async function createCheckoutSession(req: Request, res: Response): Promise<void> {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: req.user!._id.toString(),
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: PREMIUM_PRICE_USD_CENTS,
          product_data: {
            name: "Calorie Tracker Premium",
            description: "Unlimited history + CSV export, one-time unlock",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/premium?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/premium?canceled=true`,
  });

  res.json({ url: session.url });
}

export async function verifyCheckoutSession(req: Request, res: Response): Promise<void> {
  const userId = req.user!._id.toString();
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

  if (session.client_reference_id !== userId) {
    res.status(403).json({ error: "This payment belongs to a different account" });
    return;
  }

  const premium = session.payment_status === "paid";
  if (premium) await markPremium(userId);
  res.json({ premium });
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    res.status(400).send("Missing Stripe signature or webhook secret");
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    res.status(400).send(`Webhook signature verification failed: ${(err as Error).message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { client_reference_id?: string };
    if (session.client_reference_id) await markPremium(session.client_reference_id);
  }

  res.json({ received: true });
}

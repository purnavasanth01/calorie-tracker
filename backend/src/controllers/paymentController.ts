import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import { User } from "../models/User";

const PREMIUM_PRICE_USD_CENTS = 499;

export async function createCheckoutSession(req: Request, res: Response): Promise<void> {
  try {
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
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function verifyCheckoutSession(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid" && session.client_reference_id) {
      await User.findByIdAndUpdate(session.client_reference_id, { isPremium: true });
      res.json({ premium: true });
      return;
    }

    res.json({ premium: false });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
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
    if (session.client_reference_id) {
      await User.findByIdAndUpdate(session.client_reference_id, { isPremium: true });
    }
  }

  res.json({ received: true });
}

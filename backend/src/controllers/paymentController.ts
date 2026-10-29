import { Request, Response } from "express";
import { User } from "../models/User";

const CARD_NUMBER = /^\d{16}$/;
const EXPIRY = /^(0[1-9]|1[0-2])\/(\d{2})$/;
const CVC = /^\d{3,4}$/;

function isExpired(month: number, twoDigitYear: number): boolean {
  return new Date(2000 + twoDigitYear, month, 1) <= new Date();
}

function checkoutProblem(body: Record<string, unknown>): string | null {
  const { name, cardNumber, expiry, cvc } = body;
  if (typeof name !== "string" || !name.trim()) return "Please enter the name on the card";
  if (typeof cardNumber !== "string" || !CARD_NUMBER.test(cardNumber.replace(/\s/g, ""))) {
    return "Please enter a 16-digit card number";
  }
  const match = typeof expiry === "string" ? EXPIRY.exec(expiry) : null;
  if (!match || isExpired(Number(match[1]), Number(match[2]))) return "Please enter a valid expiry date (MM/YY)";
  if (typeof cvc !== "string" || !CVC.test(cvc)) return "Please enter a valid CVC";
  return null;
}

export async function checkout(req: Request, res: Response): Promise<void> {
  const problem = checkoutProblem(req.body ?? {});
  if (problem) {
    res.status(400).json({ error: problem });
    return;
  }

  const user = await User.findByIdAndUpdate(req.user!._id, { isPremium: true }, { new: true });
  res.json({ user });
}

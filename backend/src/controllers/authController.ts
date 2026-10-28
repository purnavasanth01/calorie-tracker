import { Request, Response, NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User";

const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function logIn(req: Request, res: Response, next: NextFunction, user: IUser, status = 200): void {
  req.login(user, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.status(status).json({ user });
  });
}

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { name, email, password } = req.body;

  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !EMAIL_PATTERN.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    res.status(400).json({
      error: `Name, a valid email and a password of at least ${MIN_PASSWORD_LENGTH} characters are required`,
    });
    return;
  }

  try {
    if (await User.exists({ email: email.trim().toLowerCase() })) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });
    logIn(req, res, next, user, 201);
  } catch (err) {
    next(err);
  }
}

export function login(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate("local", (err: unknown, user: IUser | false) => {
    if (err) {
      next(err);
      return;
    }
    // Same message for unknown email and wrong password, so emails can't be probed
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    logIn(req, res, next, user);
  })(req, res, next);
}

export function logout(req: Request, res: Response, next: NextFunction): void {
  req.logout((err) => {
    if (err) {
      next(err);
      return;
    }
    res.json({ success: true });
  });
}

export function me(req: Request, res: Response): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: req.user });
}

import { Request, Response, NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User";
import { createDemoUser } from "../services/demoService";
import { parseTzOffset } from "../utils/time";
import { signupProblem } from "../validation/account";

const BCRYPT_ROUNDS = 12;

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
  const { name, email, password } = req.body ?? {};

  const problem = signupProblem(name, email, password);
  if (problem) {
    res.status(400).json({ error: problem });
    return;
  }

  if (await User.exists({ email: email.trim().toLowerCase() })) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });
  logIn(req, res, next, user, 201);
}

export function login(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate("local", (err: unknown, user: IUser | false) => {
    if (err) {
      next(err);
      return;
    }
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    logIn(req, res, next, user);
  })(req, res, next);
}

export async function demo(req: Request, res: Response, next: NextFunction): Promise<void> {
  logIn(req, res, next, await createDemoUser(parseTzOffset(req.body?.tz)), 201);
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
  res.json({ user: req.isAuthenticated() ? req.user : null });
}

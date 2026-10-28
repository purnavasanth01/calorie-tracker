import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

import { connectDB } from "./config/db";
import { configurePassport } from "./config/passport";
import { webhookHandler } from "./routes/payment";

import authRoutes from "./routes/auth";
import predictRoutes from "./routes/predict";
import historyRoutes from "./routes/history";
import paymentRoutes from "./routes/payment";
import profileRoutes from "./routes/profile";

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

async function main() {
  await connectDB();
  configurePassport();

  const app = express();

  // On Render, requests arrive through a proxy that handles HTTPS. Trust it so
  // Express knows the original request was HTTPS (needed for secure cookies).
  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  );

  app.post("/api/payment/webhook", express.raw({ type: "application/json" }), webhookHandler);

  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api/auth", authRoutes);
  app.use("/api/predict", predictRoutes);
  app.use("/api/history", historyRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/profile", profileRoutes);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

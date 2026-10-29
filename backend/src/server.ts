import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

import { connectDB } from "./config/db";
import { configurePassport } from "./config/passport";
import { errorHandler } from "./middleware/errorHandler";
import { ensureAuth } from "./middleware/ensureAuth";
import { startPredictionWorker } from "./services/mlService";

import authRoutes from "./routes/auth";
import predictRoutes from "./routes/predict";
import historyRoutes from "./routes/history";
import paymentRoutes from "./routes/payment";
import profileRoutes from "./routes/profile";

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

async function main() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not set");
  }

  await connectDB();
  startPredictionWorker();
  configurePassport();

  const app = express();

  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  );

  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
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
  app.use("/api/predict", ensureAuth, predictRoutes);
  app.use("/api/history", ensureAuth, historyRoutes);
  app.use("/api/payment", ensureAuth, paymentRoutes);
  app.use("/api/profile", ensureAuth, profileRoutes);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

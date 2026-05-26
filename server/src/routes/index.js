import express from "express";
import authRoutes from "./auth.routes.js";

export const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);

// health check
apiRouter.get("/health", (req, res) => {
  res.json({ data: { ok: true } });
});
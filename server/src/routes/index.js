import express from "express";
import authRoutes from "./auth.routes.js";
import templateRoutes from "./templates.routes.js"

export const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/templates", templateRoutes);

// health check
apiRouter.get("/health", (req, res) => {
  res.json({ data: { ok: true } });
});
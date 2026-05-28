import express from "express";
import authRoutes from "./auth.routes.js";
import hireRouter from './hire.routes.js';

export const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use('/hire', hireRouter);

// health check
apiRouter.get("/health", (req, res) => {
  res.json({ data: { ok: true } });
});
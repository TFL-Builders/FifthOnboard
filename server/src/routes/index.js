import express from "express";
import authRoutes from "./auth.routes.js";
import hireRoutes from './hire.routes.js';
import templateRoutes from "./templates.routes.js"
import inviteRoutes from './invites.routes.js'

export const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use('/hire', hireRoutes);
apiRouter.use("/templates", templateRoutes);
apiRouter.use('/invites', inviteRoutes);

// health check
apiRouter.get("/health", (req, res) => {
  res.json({ data: { ok: true } });
});
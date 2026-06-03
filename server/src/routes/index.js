import express from "express";
import authRoutes from "./auth.routes.js";
import hireRoutes from './hire.routes.js';
import templateRoutes from "./templates.routes.js"
import inviteRoutes from './invites.routes.js'
import onboardingRoutes from "./onboardings.routes.js"
import taskRoutes from "./tasks.routes.js"
import userRoutes from "./users.routes.js"
import dashboardRoutes from "./dashboard.routes.js"

export const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use('/hire', hireRoutes);
apiRouter.use("/templates", templateRoutes);
apiRouter.use('/invites', inviteRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use("/onboardings", onboardingRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/dashboard", dashboardRoutes);


// health check
apiRouter.get("/health", (req, res) => {
  res.json({ data: { ok: true } });
});
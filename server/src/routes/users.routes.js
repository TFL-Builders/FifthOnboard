import express from 'express';
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { organizationGuard } from '../middleware/organizationGuard.js';

const router = express.Router();
const protect = [verifyAccessToken(), requireRole("hr", "admin"), organizationGuard];
const managerprotect = [verifyAccessToken(), requireRole("hr", "admin", "manager"), organizationGuard];

router.delete("/:id/delete", ...protect)

export default router;
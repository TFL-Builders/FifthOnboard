import express from 'express';
import { acceptInvite, sendInvite } from "../controllers/invites.controller.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { organizationGuard } from '../middleware/organizationGuard.js';

const router = express.Router();
const protect = [verifyAccessToken(), requireRole("hr", "admin", 'manager'), organizationGuard];

router.post('/', ...protect, sendInvite);
router.post('/accept/:token', acceptInvite);

export default router;
import express from 'express';
import { acceptInvite, sendInvite, getInvites, deleteInvite } from "../controllers/invites.controller.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { organizationGuard } from '../middleware/organizationGuard.js';

const router = express.Router();
const protect = [verifyAccessToken(), requireRole("hr", "admin"), organizationGuard];
const managerProtect = [verifyAccessToken(), requireRole("hr", "admin", "manager"), organizationGuard];

router.post('/', ...managerProtect, sendInvite);
router.post('/accept/:token', acceptInvite);
router.get("/", ...managerProtect, getInvites)
router.delete("/:id", ...protect, deleteInvite)

export default router;
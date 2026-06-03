import express from 'express';
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { organizationGuard } from '../middleware/organizationGuard.js';
import { getSettings, updateSettings } from '../controllers/dashboard.controller.js';

const router = express.Router();
const protect = [verifyAccessToken(), requireRole("hr", "admin"), organizationGuard];


router.get('/settings', ...protect, getSettings);
router.patch('/settings', ...protect, updateSettings);


export default router;
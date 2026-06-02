import express from 'express';
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { organizationGuard } from '../middleware/organizationGuard.js';
import { validate } from "../middleware/inputValidationMiddleware.js";
import { getUser, getUsers, getUserTasks } from '../controllers/users.controller.js';

const router = express.Router();
const protect = [verifyAccessToken(), requireRole("hr", "admin"), organizationGuard];
const managerProtect = [verifyAccessToken(), requireRole("hr", "admin", 'manager'), organizationGuard];

router.get('/', ...managerProtect, getUsers);
router.get('/:id', ...protect, getUser);
router.get('/:id/tasks', ...protect, getUserTasks);
// router.patch('/:id', ...protect, validate('updateUser'), updateUser)

export default router;
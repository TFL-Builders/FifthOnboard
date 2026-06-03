import express from 'express';
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { organizationGuard } from '../middleware/organizationGuard.js';
import { deleteUser, getUser, getUsers, getUserTasks } from '../controllers/users.controller.js';

const router = express.Router();
const protect = [verifyAccessToken(), requireRole("hr", "admin"), organizationGuard];
const managerProtect = [verifyAccessToken(), requireRole("hr", "admin", "manager"), organizationGuard];
const selfOrAdminProtect = [verifyAccessToken(), requireRole("hr", "admin", "manager", "task_owner", "employee"), organizationGuard];

router.get('/', ...managerProtect, getUsers);
router.get('/:id', ...protect, getUser);
router.get('/:id/tasks', ...selfOrAdminProtect, getUserTasks);
router.delete("/:id", ...protect, deleteUser)

export default router;
import express from "express"
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import {organizationGuard} from "../middleware/organizationGuard.js"
import { validate } from "../middleware/inputValidationMiddleware.js";
import { updateTask, addComment, getTaskComments } from "../controllers/tasks.controller.js";

const broadProtect = [verifyAccessToken(), requireRole("hr", "task_owner", "admin", "employee", "manager"), organizationGuard];
const router = express.Router();

router.patch("/:id", ...broadProtect, validate("updateTask"), updateTask);
router.get("/:id/comments", ...broadProtect, getTaskComments);
router.post("/:id/comments", ...broadProtect, validate("addComment"), addComment);

export default router;
import express from 'express';
import { validateHireToken } from '../middleware/hirePortalMiddleware.js';
import { getOnboarding, updateTask, signUpload, postComment, getComments, sendNewEmail } from '../controllers/hire.controller.js';
import { validate } from "../middleware/inputValidationMiddleware.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { organizationGuard } from '../middleware/organizationGuard.js';

const router = express.Router();
const protect = [verifyAccessToken(), requireRole("hr", "admin"), organizationGuard];

router.post('/:onboardingId/send-email', ...protect, sendNewEmail);
router.get('/:token', validateHireToken, getOnboarding);
router.patch('/:token/tasks/:taskId', validateHireToken, updateTask);
router.post('/:token/:taskId/uploads/sign', validateHireToken, signUpload);
router.post('/:token/tasks/:taskId/comments', validateHireToken, validate('postComment'), postComment);
router.get('/:token/tasks/:taskId/comments', validateHireToken, getComments);

export default router;
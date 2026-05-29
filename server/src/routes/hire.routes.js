import express from 'express';
import { validateHireToken } from '../middleware/hirePortalMiddleware.js';
import {getOnboarding, updateTask, signUpload, postComment, sendWelcomeEmail, } from '../controllers/hire.controller.js';

const router = express.Router();

router.get('/:token', validateHireToken, getOnboarding);
router.patch('/:token/tasks/:taskId', validateHireToken, updateTask);
router.post('/:token/uploads/sign', validateHireToken, signUpload);
router.post('/:token/tasks/:taskId/comments', validateHireToken, postComment);
router.post('/send-email', sendWelcomeEmail);

export default router;
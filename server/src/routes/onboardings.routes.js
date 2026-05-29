import express from "express"
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import {organizationGuard} from "../middleware/organizationGuard.js"
import { validate } from "../middleware/inputValidationMiddleware.js";
import {
    listOnboardings, 
    getOnboarding, 
    updateOnboarding, 
    getOnboardingComments, 
    getOnboardingTasks, 
    createOnboarding,
    cancelOnboarding
} from "../controllers/onboardings.controller.js"

const protect = [verifyAccessToken(), requireRole("hr", "admin"), organizationGuard];
const managerprotect = [verifyAccessToken(), requireRole("hr", "admin", "manager"), organizationGuard];
const router = express.Router();

router.get("/", ...managerprotect, listOnboardings);
router.get("/:id", ...managerprotect, getOnboarding);
router.get("/:id/tasks", ...managerprotect, getOnboardingTasks);
router.get("/:id/comments", ...managerprotect, getOnboardingComments);
router.post("/", ...protect, validate("createOnboarding"), createOnboarding);
router.patch("/:id", ...protect, validate("updateOnboarding"), updateOnboarding);
router.patch("/:id/cancel", ...protect, cancelOnboarding);




export default router
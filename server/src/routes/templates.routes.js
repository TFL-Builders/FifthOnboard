import express from "express";
import { 
    listTemplates,
    getTemplate,
    getTemplateDefault,
    createTemplate,
    updateTemplate,
    archiveTemplate,
    unarchiveTemplate,
    cloneTemplate,
    deleteTemplate
 } from "../controllers/templates.controller.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import {organizationGuard} from "../middleware/organizationGuard.js"
import { validate } from "../middleware/inputValidationMiddleware.js";

const router = express.Router();
const protect = [verifyAccessToken(), requireRole("hr", "admin"), organizationGuard];
const adminProtect = [verifyAccessToken(), requireRole("admin"), organizationGuard];

router.get("/", ...protect, listTemplates);
router.get("/seed", ...protect, getTemplateDefault);
router.get("/:id", ...protect, getTemplate);
router.post("/", ...protect, validate("createTemplate"), createTemplate);
router.post("/:id/clone", ...protect, cloneTemplate);
router.patch("/:id", ...protect, validate("updateTemplate"), updateTemplate);
router.patch("/:id/archive", ...protect, archiveTemplate);
router.patch("/:id/unarchive", ...protect, unarchiveTemplate);
router.delete ("/:id", ...adminProtect, deleteTemplate)


export default router;  
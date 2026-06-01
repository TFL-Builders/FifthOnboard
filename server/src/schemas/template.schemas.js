import { z } from "zod";
import { DEPARTMENTS, PHASES } from "../config/constants.js";

const templateTaskSchema = z.object({
    title: z.string().trim().min(2).max(120),
    assigneeDepartment: z.enum(DEPARTMENTS),
    phase: z.enum(PHASES),
    dueOffsetDays: z.number().int().default(0),
    order: z.number().int().min(0).default(0),
    requiresUpload: z.boolean().default(false),
    description: z.string().trim().max(500).optional(),
    assigneeUserId: z.string().optional().nullable(),
})

const createTemplateSchema = z.object({
    name: z.string().trim().min(2, {message: "Template name is required"}).max(120),
    description: z.string().trim().max(500).optional(),
    templateTasks: z.array(templateTaskSchema).default([]),
})

const updateTemplateSchema = z.object({
    name: z.string().trim().min(2, {message: "Template name is required"}).max(120),
    description: z.string().trim().max(500).optional(),
    templateTasks: z.array(templateTaskSchema)
})
export const schemas = {
    createTemplate: createTemplateSchema,
    updateTemplate: updateTemplateSchema
}
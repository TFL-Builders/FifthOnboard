import { z } from 'zod';
import { USER_ROLES, ASSIGNEE_DEPARTMENTS } from '../config/constants.js';

const updateUser = z.object({
    role: z.enum(USER_ROLES).optional(),
    department: z.enum(ASSIGNEE_DEPARTMENTS).optional(),
    name: z.string().trim().min(1, { message: "Name is required" }).max(80).optional(),
})

export const schemas = {
    updateUser: updateUser
}


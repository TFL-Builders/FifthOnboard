import { z } from "zod";
import { TASK_STATUSES } from "../config/constants.js";

const updateTask = z.object({
    status: z.enum(TASK_STATUSES).optional(),
    blockedReason: z.string().max(500).optional(),
}).refine(
    data => !(data.status === "blocked" && !data.blockedReason),
    { message: "Blocked reason is required when status is blocked" }
)

const addComment = z.object({
    body: z.string().trim().min(1).max(4000)
})

export const schemas = {
    updateTask: updateTask,
    addComment: addComment
}
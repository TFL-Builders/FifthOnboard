import { z } from "zod";

export const schemas = {
    postComment: z.object({
        body: z.string().min(1, { message: 'Comment content is required.' }).max(4000)
    })
};
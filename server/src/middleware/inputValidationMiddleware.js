import { z } from "zod";

const schemas = {
  signup: z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    name: z.string().min(1, { message: "Name is required" }).max(80)
  }),

  login: z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(1, { message: "Password is required" })
  }),

  forgotPassword: z.object({
    email: z.string().email({ message: "Invalid email" })
  }),

  resetPassword: z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
};

export function validate(schemaName) {
  return (req, res, next) => {
    const result = schemas[schemaName].safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ 
        errors: result.error.errors.map(e => ({
          field: e.path[0],
          message: e.message
        }))
      });
    }

    req.body = result.data; // replace body with clean validated data
    next();
  };
}
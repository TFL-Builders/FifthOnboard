import { z } from "zod";

export const schemas = {
  signup: z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    name: z.string().min(1, { message: "Name is required" }).max(80),
    organizationName: z.string().min(1, { message: "Organization name is required" }).max(100)
  }),

  login: z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(1, { message: "Password is required" })
  }),
  
  setup: z.object({
    organizationName: z.string().min(1, { message: "Organization name is required" }).max(100)
  }),

  forgotPassword: z.object({
    email: z.string().email({ message: "Invalid email" })
  }),

  resetPassword: z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
};
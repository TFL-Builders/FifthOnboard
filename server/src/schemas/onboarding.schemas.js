import mongoose from "mongoose";
import { z } from "zod";
import { DEPARTMENTS } from "../config/constants.js";

const objectId = z.string().refine(
  (v) => mongoose.Types.ObjectId.isValid(v),
  { message: "Invalid ID format" }
);

const departmentMapSchema = z.record(
  z.enum(DEPARTMENTS),
  objectId
);

const basedOnboardingSchema = z.object({
    templateId: objectId,
    newHireName: z.string().min(1, { message: "Name is required" }).max(80),
    newHireEmail: z.string().email({ message: "Invalid email" }),
    startDate: z.coerce.date(),
    departmentMap: departmentMapSchema.optional().default({}),
    managerId:    objectId.optional(),
})

export const schemas = {
    createOnboarding: basedOnboardingSchema.extend({
        startDate: z.coerce.date().refine(
          (d) => d > new Date(),
          { message: "Start date must be in the future" }
        ),
    }),

    updateOnboarding: basedOnboardingSchema

}

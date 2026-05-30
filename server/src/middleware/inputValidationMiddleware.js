import { z } from "zod";
import { schemas as authSchemas } from "../schemas/auth.schemas.js";
import { schemas as templateSchemas } from "../schemas/template.schemas.js";
import { schemas as hireSchemas } from '../schemas/hire.schemas.js';

const schemas = {
  ...authSchemas,
  ...templateSchemas,
  ...hireSchemas
}

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
import { BadRequestException } from "../exceptions/bad-request.exception.js";

export const ValidationMiddleware = (schema, target = "body") => {
  const ALLOWED_TARGETS = ["body", "query", "params"];

  if (!ALLOWED_TARGETS.includes(target)) {
    throw new Error("Validation Target invalid");
  }

  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[target]);

      if (error) {
        const errorMsg = error.details?.map((err) => err.message).join(" | ");
        throw new BadRequestException(errorMsg);
      }

      req[target] = value;
      next();
    } catch (err) {
      next(err); // Express error handler ga yuboradi
    }
  };
};
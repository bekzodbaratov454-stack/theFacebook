 import Joi from "joi";

export const LoginSchema = Joi.object({
  username: Joi.string()
    .min(5)
    .required()
    .messages({
      "string.base": "Username must be a string",
      "string.empty": "Username cannot be empty",
      "string.min": "Username must be at least 5 characters",
      "any.required": "Username is required",
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password cannot be empty",
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),
});
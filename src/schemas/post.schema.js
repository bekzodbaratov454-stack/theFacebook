import Joi from "joi";

export const PostSchema = Joi.object({
    
  title: Joi.string()
    .min(3)
    .required()
    .messages({
      "string.base": "Post must be a string",
      "string.empty": "Post cannot be empty",
      "string.min": "Post must be at least 3 characters",
      "any.required": "Post is required",
    }),




  content: Joi.string()
    .min(3)
    .required()
    .messages({
      "string.base": "Content must be a string",
      "string.empty": "Content cannot be empty",
      "string.min": "Content must be at least 3 characters",
      "any.required": "Content is required",
    }),
});
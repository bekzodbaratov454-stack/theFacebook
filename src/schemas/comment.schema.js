import Joi from "joi";

export const CommentSchema = Joi.object({
    text: Joi.string()
        .min(1)
        .required()
        .messages({
            "string.base": "Comment must be a string",
            "string.empty": "Comment cannot be empty",
            "string.min": "Comment must be at least 1 character",
            "any.required": "Comment is required",
        }),
});
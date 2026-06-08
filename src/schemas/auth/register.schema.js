import Joi from "joi";

export const RegisterSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.min" : "Name kamida 3 ta harf bulishi kerak"
  }),

  age: Joi.number().min(16).required().messages({
    "number.min": "Yosh 16 dan kichik bo'lmasligi kerak"
  }),

  username: Joi.string().min(5).required().messages({
    "string.min": "Username kamida 5 ta bo'lishi kerak"
  }),

    email: Joi.string().email().required(),

  
  password: Joi.string().min(6).required().messages({
    "string.min": "Parol kamida 6 ta bolishi kerak"
  }),

  isActive: Joi.boolean().optional()
}).required();
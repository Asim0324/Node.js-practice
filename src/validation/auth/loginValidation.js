const Joi = require("joi");
const { passwordSchema } = require("../../utils/utils");

const schema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "Email cannot be empty",
      "any.required": "Email is required.",
      "string.email": "Type a proper email address"
    }),
  password: passwordSchema.required().messages({
    'any.required': 'Password is required.',
    'string.empty': 'Password cannot be empty'
  }),
});

module.exports = schema;

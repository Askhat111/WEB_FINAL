const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const menuItemSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid('coffee', 'pastry', 'dessert'), 
  stockQuantity: Joi.number().min(0).default(0),
  isAvailable: Joi.boolean().default(true),
  description: Joi.string().allow('') 
});

const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      menuItem: Joi.string().required(),
      quantity: Joi.number().min(1).required()
    })
  ).min(1).required()
});

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  currentPassword: Joi.string(),
  newPassword: Joi.string().min(6)
}).with('newPassword', 'currentPassword'); 

exports.validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

exports.validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

exports.validateMenuItem = (req, res, next) => {
  const { error } = menuItemSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

exports.validateOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

exports.validateUpdateProfile = (req, res, next) => {
  const { error } = updateProfileSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
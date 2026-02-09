const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  
  const existingUser = await User.findOne({ 
    $or: [{ email: email.toLowerCase() }, { username }] 
  });
  
  if (existingUser) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error; 
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await User.create({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,  
    role: 'customer'
  });
  
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  //Send welcome email 
  emailService.sendWelcomeEmail(user.email, user.username);
  
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }
  
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }
  
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
};
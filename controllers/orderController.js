const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const emailService = require('../services/emailService');

exports.create = async (req, res) => {
  const { items } = req.body;
  let totalAmount = 0;
  const orderItems = [];
  
  for (let item of items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    if (!menuItem) {
      const error = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (menuItem.stockQuantity < item.quantity) {
      const error = new Error(
        `Not enough stock for ${menuItem.name}. Available: ${menuItem.stockQuantity}, Requested: ${item.quantity}`
      );
      error.statusCode = 400;
      throw error;
    }
    
    orderItems.push({
      menuItem: menuItem._id,
      quantity: item.quantity,
      price: menuItem.price
    });
    
    totalAmount += menuItem.price * item.quantity;
    
    menuItem.stockQuantity -= item.quantity;
    
    if (menuItem.stockQuantity <= 0) {
      menuItem.isAvailable = false;
    }
    
    await menuItem.save();
  }
  
  const order = new Order({
    items: orderItems,
    totalAmount,
    user: req.user._id
  });
  
  await order.save();
  
  const populatedOrder = await Order.findById(order._id)
    .populate('items.menuItem', 'name price');
  
  emailService.sendOrderConfirmation(req.user.email, order._id, totalAmount);
  
  res.status(201).json(populatedOrder);
};

exports.getAll = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.menuItem', 'name price')
    .sort({ createdAt: -1 });
  res.json(orders);
};

exports.update = async (req, res) => {
  if (req.user.role !== 'admin') {
    const error = new Error('Admin only');
    error.statusCode = 403;
    throw error;
  }
  
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  ).populate('items.menuItem', 'name price');
  
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  
  res.json(order);
};

exports.delete = async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = new Error('Not authorized');
    error.statusCode = 403;
    throw error;
  }
  
  for (let item of order.items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    if (menuItem) {
      menuItem.stockQuantity += item.quantity;
      if (menuItem.stockQuantity > 0) {
        menuItem.isAvailable = true;
      }
      await menuItem.save();
    }
  }
  
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order deleted' });
};
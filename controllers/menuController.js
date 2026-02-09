const MenuItem = require('../models/MenuItem');

exports.getAll = async (req, res) => {
  const { category, available } = req.query;
  let filter = {};
  
  if (category) filter.category = category;
  if (available === 'true') filter.isAvailable = true;
  
  const items = await MenuItem.find(filter).sort({ createdAt: -1 });
  res.json(items);
};

exports.create = async (req, res) => {
  const item = new MenuItem(req.body);
  await item.save();
  res.status(201).json(item);
};

exports.update = async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  
  if (!item) {
    const error = new Error('Menu item not found');
    error.statusCode = 404;
    throw error;
  }
  
  res.json(item);
};

exports.delete = async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  
  if (!item) {
    const error = new Error('Menu item not found');
    error.statusCode = 404;
    throw error;
  }
  
  res.json({ message: 'Menu item deleted successfully' });
};
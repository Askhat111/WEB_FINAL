const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

exports.getSalesReport = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const dailySales = await Order.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);
    res.json({
      totalSales: totalSales[0]?.total || 0,
      dailySales,
      ordersToday: await Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } })
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInventoryReport = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const lowStock = await MenuItem.find({
      stockQuantity: { $lt: 10 },
      isAvailable: true
    }).sort({ stockQuantity: 1 });
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

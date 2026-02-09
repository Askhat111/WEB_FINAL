const express = require('express');
const auth = require('../middleware/authHandler');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

//GET /api/reports/sales (only admins)
router.get('/sales', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    //Sum
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    //sells for days(last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailySales = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    //orders of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const ordersToday = await Order.countDocuments({ 
      createdAt: { $gte: today } 
    });
    
    res.json({
      totalSales: totalSales[0]?.total || 0,
      totalOrders: await Order.countDocuments(),
      dailySales,
      ordersToday,
      averageOrderValue: totalSales[0]?.total ? 
        (totalSales[0].total / await Order.countDocuments()).toFixed(2) : 0
    });
    
  } catch (err) {
    console.error('Sales report error:', err);
    res.status(500).json({ error: err.message });
  }
});

//GET /api/reports/inventory (low stock)
router.get('/inventory', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const lowStockItems = await MenuItem.find({
      stockQuantity: { $lt: 10 },
      isAvailable: true
    }).sort({ stockQuantity: 1 });
    
    res.json({
      lowStockCount: lowStockItems.length,
      items: lowStockItems
    });
    
  } catch (err) {
    console.error('Inventory report error:', err);
    res.status(500).json({ error: err.message });
  }
});

//GET /api/reports/popular 
router.get('/popular', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' }
    ]);
    
    res.json(popularItems);
    
  } catch (err) {
    console.error('Popular items report error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
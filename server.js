require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

const app = express();

app.use(express.json());
app.use(express.static('public'));

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');

async function createTestData() {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('Creating test users...');
      
      const bcrypt = require('bcryptjs');
      
      const adminHash = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@coffee.com',
        password: adminHash,
        role: 'admin'
      });
      
      const customerHash = await bcrypt.hash('customer123', 10);
      await User.create({
        username: 'customer',
        email: 'customer@email.com',
        password: customerHash,
        role: 'customer'
      });
      
      const menuCount = await MenuItem.countDocuments();
      if (menuCount === 0) {
        await MenuItem.create([
          { name: 'Espresso', price: 1500, category: 'coffee', stockQuantity: 100, isAvailable: true },
          { name: 'Cappuccino', price: 1800, category: 'coffee', stockQuantity: 80, isAvailable: true },
          { name: 'Latte', price: 2000, category: 'coffee', stockQuantity: 60, isAvailable: true },
          { name: 'Croissant', price: 800, category: 'pastry', stockQuantity: 50, isAvailable: true },
          { name: 'Chocolate Cake', price: 1600, category: 'dessert', stockQuantity: 30, isAvailable: true }
        ]);
        console.log('Menu created: 5 items');
      }
      
      console.log('Test users created');
      console.log('Admin: admin@coffee.com / admin123');
      console.log('Customer: customer@email.com / customer123');
    } else {
      console.log(`Already have ${userCount} users`);
    }
  } catch (error) {
    console.error('Test data error:', error.message);
  }
}

setTimeout(createTestData, 1000);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const pages = ['/', '/login', '/register', '/menu', '/orders', '/admin', '/profile'];
pages.forEach(page => {
  app.get(page, (req, res) => {
    const file = page === '/' ? 'index.html' : page.slice(1) + '.html';
    res.sendFile(path.join(__dirname, 'public/views', file));
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});
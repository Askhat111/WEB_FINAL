require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI);

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

async function seed() {
  try {
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    
    console.log('🗑️  Cleared old data');

    const hashedPass = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@coffee.com',
      password: hashedPass,
      role: 'admin'
    });

    const customer = await User.create({
      username: 'customer',
      email: 'customer@email.com',
      password: hashedPass,
      role: 'customer'
    });
   
    const items = await MenuItem.create([
      { name: 'Espresso', price: 1500, category: 'coffee', stockQuantity: 100, isAvailable: true },
      { name: 'Cappuccino', price: 1800, category: 'coffee', stockQuantity: 80, isAvailable: true },
      { name: 'Latte', price: 2000, category: 'coffee', stockQuantity: 60, isAvailable: true },
      { name: 'Croissant', price: 800, category: 'pastry', stockQuantity: 50, isAvailable: true },
      { name: 'Blueberry Muffin', price: 1000, category: 'pastry', stockQuantity: 40, isAvailable: true },
      { name: 'Chocolate Cake', price: 1600, category: 'dessert', stockQuantity: 30, isAvailable: true }
    ]);
 
    await Order.create([
      {
        items: [{ menuItem: items[0]._id, quantity: 2, price: 1500 }],
        totalAmount: 3000,
        status: 'completed',
        user: customer._id
      },
      {
        items: [{ menuItem: items[1]._id, quantity: 1, price: 1800 }],
        totalAmount: 1800,
        status: 'pending',
        user: customer._id
      }
    ]);
    
    console.log('Database seeded successfully!');
    console.log('Admin: admin@coffee.com / admin123');
    console.log('Customer: customer@email.com / admin123');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

seed();
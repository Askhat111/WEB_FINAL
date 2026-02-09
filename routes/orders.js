const express = require('express');
const router = express.Router();
const auth = require('../middleware/authHandler');
const orderController = require('../controllers/orderController');
const { validateOrder } = require('../middleware/validation'); 

router.post('/', auth, validateOrder, orderController.create); 
router.get('/', auth, orderController.getAll);
router.put('/:id', auth, orderController.update);
router.delete('/:id', auth, orderController.delete);

module.exports = router;
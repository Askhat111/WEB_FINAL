const express = require('express');
const router = express.Router();
const auth = require('../middleware/authHandler');
const menuController = require('../controllers/menuController');
const { validateMenuItem } = require('../middleware/validation'); 

router.get('/', menuController.getAll);
router.post('/', auth, validateMenuItem, menuController.create);   
router.put('/:id', auth, validateMenuItem, menuController.update); 
router.delete('/:id', auth, menuController.delete);

module.exports = router;
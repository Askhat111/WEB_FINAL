const express = require('express');
const router = express.Router();
const auth = require('../middleware/authHandler');
const userController = require('../controllers/userController');
const { validateUpdateProfile } = require('../middleware/validation'); 

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, validateUpdateProfile, userController.updateProfile); 

module.exports = router;
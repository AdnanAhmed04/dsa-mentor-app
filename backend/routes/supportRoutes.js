const express = require('express');
const supportController = require('../controllers/supportController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/', supportController.sendMessage);
router.get('/admin', authController.restrictTo('admin'), supportController.getAllMessages);
router.patch('/:id/read', authController.restrictTo('admin'), supportController.markAsRead);

module.exports = router;

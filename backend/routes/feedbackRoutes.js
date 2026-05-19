const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/', feedbackController.getMyFeedback);
router.post('/', feedbackController.submitFeedback);

module.exports = router;

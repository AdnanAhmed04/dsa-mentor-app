const express = require('express');
const submissionController = require('../controllers/submissionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/quiz', submissionController.submitQuiz);
router.get('/mock-test', submissionController.getMockTest);
router.post('/mock-test', submissionController.submitMockTest);
router.get('/progress', submissionController.getUserProgress);
router.get('/stats', submissionController.getUserStats);

module.exports = router;

const express = require('express');
const topicController = require('../controllers/topicController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/', topicController.getAllTopics);

// Admin-Specific GET routes (Must be before /:id to avoid shadowing)
router.get('/mock-test', authController.protect, authController.restrictTo('admin'), topicController.getAllMockTests);
router.get('/admin/stats', authController.protect, authController.restrictTo('admin'), topicController.getAdminStats);

// Parametric Public routes
router.get('/:id', topicController.getTopic);
router.get('/:topicId/quiz', topicController.getTopicQuiz);

// Protected Admin-only routes (Modification and Creation)
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.post('/mock-test', topicController.createMockTest);
router.patch('/mock-test/:id', topicController.updateMockTest);
router.delete('/mock-test/:id', topicController.deleteMockTest);

router.post('/', topicController.createTopic);
router.post('/quiz', topicController.createQuiz);
router.patch('/:id', topicController.updateTopic);
router.delete('/:id', topicController.deleteTopic);

module.exports = router;

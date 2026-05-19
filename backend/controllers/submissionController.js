const Submission = require('../models/Submission');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const MockTest = require('../models/MockTest');
const Topic = require('../models/Topic');

exports.submitQuiz = async (req, res) => {
  try {
    const { testId, answers, timeTaken } = req.body;
    const userId = req.user._id;

    // 1) Find the quiz and its questions
    const quiz = await Quiz.findById(testId);
    if (!quiz) {
      return res.status(404).json({ status: 'fail', message: 'Quiz not found' });
    }

    // 2) Calculate score
    let score = 0;
    const processedAnswers = answers.map(ans => {
      const question = quiz.questions[ans.questionIndex];
      const isCorrect = question.correctAnswer === ans.selectedOption;
      if (isCorrect) score += 2; // Each question 2 marks
      return { ...ans, isCorrect };
    });

    const totalMarks = quiz.questions.length * 2;

    // 3) Create submission
    const submission = await Submission.create({
      userId,
      testId,
      type: 'quiz',
      answers: processedAnswers,
      score,
      totalMarks,
      timeTaken
    });

    // 4) Update Progress
    const percentage = (score / totalMarks);
    const passed = percentage >= 0.7;
    const isWeak = percentage < 0.7;

    // Only set to Completed if passed. 
    // If already Completed, don't revert to Not Started/In Progress.
    const existingProgress = await Progress.findOne({ userId, topicId: quiz.topicId });
    const completionStatus = (existingProgress?.completionStatus === 'Completed' || passed) ? 'Completed' : 'In Progress';

    await Progress.findOneAndUpdate(
      { userId, topicId: quiz.topicId },
      {
        completionStatus,
        quizScore: score,
        isWeak,
        lastPracticed: Date.now()
      },
      { upsert: true, new: true }
    );

    // 5) Update User points
    await User.findByIdAndUpdate(userId, {
      $inc: { points: score },
      lastActive: Date.now()
    });

    res.status(201).json({
      status: 'success',
      data: { 
        submission: {
          ...submission.toJSON(),
          passed
        }
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getMockTest = async (req, res) => {
  try {
    // For MVP, we can just return a predefined mock test or generate one randomly
    // Let's assume we have some mock tests in DB
    const mockTests = await MockTest.find();
    if (mockTests.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'No mock tests available' });
    }
    
    // Pick a random one for now
    const mockTest = mockTests[Math.floor(Math.random() * mockTests.length)];

    res.status(200).json({
      status: 'success',
      data: { mockTest }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.submitMockTest = async (req, res) => {
  try {
    const { testId, answers, timeTaken } = req.body;
    const userId = req.user._id;

    const mockTest = await MockTest.findById(testId);
    if (!mockTest) {
      return res.status(404).json({ status: 'fail', message: 'Mock test not found' });
    }

    let score = 0;
    const topicResults = {}; // To track performance per topic

    const processedAnswers = answers.map(ans => {
      const question = mockTest.questions[ans.questionIndex];
      const isCorrect = question.correctAnswer === ans.selectedOption;
      
      if (isCorrect) score += 2;

      // Track topic performance
      if (question.topicId) {
        if (!topicResults[question.topicId]) {
          topicResults[question.topicId] = { correct: 0, total: 0 };
        }
        topicResults[question.topicId].total += 1;
        if (isCorrect) topicResults[question.topicId].correct += 1;
      }

      return { ...ans, isCorrect };
    });

    const topicBreakdown = Object.keys(topicResults).map(tid => ({
      topicId: tid,
      correct: topicResults[tid].correct,
      total: topicResults[tid].total
    }));

    const submission = await Submission.create({
      userId,
      testId,
      type: 'mock',
      answers: processedAnswers,
      score,
      totalMarks: mockTest.totalMarks,
      timeTaken,
      topicBreakdown
    });

    // Update weak areas in Progress based on topic breakdown
    for (const res of topicBreakdown) {
      const isWeak = (res.correct / res.total) < 0.6;
      if (isWeak) {
        await Progress.findOneAndUpdate(
          { userId, topicId: res.topicId },
          { isWeak: true },
          { upsert: true }
        );
      }
    }

    res.status(201).json({
      status: 'success',
      data: { submission }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id }).populate('topicId', 'title');
    res.status(200).json({
      status: 'success',
      data: { progress }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1) Total attempts and pass/fail from Submissions
    const submissions = await Submission.find({ userId });
    const totalAttempts = submissions.length;
    let passed = 0;
    let failed = 0;

    submissions.forEach(sub => {
      if (sub.totalMarks > 0) {
        if ((sub.score / sub.totalMarks) >= 0.7) passed++;
        else failed++;
      }
    });

    const passFailRatio = totalAttempts > 0 ? (passed / totalAttempts) * 100 : 0;

    // 2) Strong and weak topics from Progress
    const progressList = await Progress.find({ userId }).populate('topicId', 'title');
    
    const strongTopics = progressList
      .filter(p => p.completionStatus === 'Completed' && !p.isWeak)
      .map(p => p.topicId);
      
    const weakTopics = progressList
      .filter(p => p.isWeak)
      .map(p => p.topicId);

    res.status(200).json({
      status: 'success',
      data: {
        totalAttempts,
        passed,
        failed,
        passFailRatio,
        strongTopics,
        weakTopics
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

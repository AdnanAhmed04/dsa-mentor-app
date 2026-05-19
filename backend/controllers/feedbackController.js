const Feedback = require('../models/Feedback');

exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ userId: req.user._id });
    res.status(200).json({ status: 'success', data: { feedback } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, message } = req.body;
    const feedback = await Feedback.findOneAndUpdate(
      { userId: req.user._id },
      { rating, message },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(200).json({ status: 'success', data: { feedback } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

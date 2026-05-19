const SupportMessage = require('../models/SupportMessage');

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Message is required' });
    }
    const msg = await SupportMessage.create({ userId: req.user._id, message });
    res.status(201).json({ status: 'success', data: { message: msg } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Admin only
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find()
      .populate('userId', 'name email')
      .sort('-createdAt');
    res.status(200).json({ status: 'success', data: { messages } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await SupportMessage.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

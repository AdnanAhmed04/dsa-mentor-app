const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const supportRoutes = require('./routes/supportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/support', supportRoutes);

app.get('/', (req, res) => {
  res.send('DSA Mentor API is running...');
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa-path';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

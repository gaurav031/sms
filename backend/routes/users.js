const express = require('express');
const { auth } = require('../middleware/auth');
const Notice = require('../models/Notice');

const router = express.Router();

// Get notices for user
router.get('/notices', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      isActive: true,
      $or: [
        { 'targetAudience.roles': req.user.role },
        { 'targetAudience.roles': 'all' }
      ]
    };

    if (type) query.type = type;

    const notices = await Notice.find(query)
      .populate('publishedBy', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notice.countDocuments(query);

    res.json({
      notices,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notice as read
router.post('/notices/:id/read', auth, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check if already read
    const alreadyRead = notice.readBy.some(read => read.user.toString() === req.user.id);
    
    if (!alreadyRead) {
      notice.readBy.push({
        user: req.user.id,
        readAt: new Date()
      });
      await notice.save();
    }

    res.json({ message: 'Notice marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
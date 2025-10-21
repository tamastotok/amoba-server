const express = require('express');
const router = express.Router();
const Population = require('../models/ai/Population');

// GET /api/ai/progress
router.get('/progress', async (req, res) => {
  try {
    // Fetch all generations sorted by generation number
    const populations = await Population.find({})
      .sort({ generation: 1 })
      .lean();

    res.json(populations);
  } catch (err) {
    console.error('Error fetching AI progress:', err);
    res.status(500).json({ error: 'Failed to fetch AI progress' });
  }
});

module.exports = router;

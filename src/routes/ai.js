const express = require('express');
const router = express.Router();
const getAIProgress = require('../controllers/ai_progress');

// GET /api/ai/progress
router.get('/progress', getAIProgress);

module.exports = router;

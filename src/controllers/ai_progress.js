const { StrategyModel } = require('../models/ai/Strategy');
const log = require('../utils/logger');

module.exports = async function getAIProgress(req, res) {
  try {
    const populations = await StrategyModel.find()
      .sort({ generation: 1 })
      .lean();
    res.json(populations);
  } catch (err) {
    log.error('Failed to load AI progress:', err);
    res.status(500).json({ error: 'Failed to load AI progress' });
  }
};

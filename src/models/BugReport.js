const mongoose = require('mongoose');

const BugReportSchema = mongoose.Schema({
  playerName: { type: String, default: '' },
  category: {
    type: String,
    enum: ['gameplay', 'ui', 'other'],
    default: 'other',
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BugReport', BugReportSchema);

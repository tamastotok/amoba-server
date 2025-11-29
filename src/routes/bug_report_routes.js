const express = require('express');
const router = express.Router();

const {
  createBugReport,
  getBugReports,
  deleteBugReport,
} = require('../controllers/bug_report_controller');

router.post('/create', createBugReport);
router.get('/get', getBugReports);
router.delete('/delete/:id', deleteBugReport);

module.exports = router;

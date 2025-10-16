const express = require('express');
const router = express.Router();
require('dotenv').config();

router.post('/auth', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing password.' });
  }

  if (password === adminPassword) {
    return res.status(200).json({ success: true, message: 'Access granted.' });
  }

  return res.status(401).json({ success: false, message: 'Invalid password.' });
});

module.exports = router;

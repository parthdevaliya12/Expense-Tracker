const express = require('express');
const router = express.Router();
const { parseText, getInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/parse', protect, parseText);
router.get('/insights', protect, getInsights);

module.exports = router;

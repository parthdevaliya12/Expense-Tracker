const aiService = require('../services/aiService');
const Transaction = require('../models/Transaction');

// @desc    Parse text into transaction
// @route   POST /api/ai/parse
// @access  Private
const parseText = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400);
      throw new Error('Please provide text to parse');
    }
    const parsedData = await aiService.parseTransaction(text);
    res.status(200).json(parsedData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI insights for user
// @route   GET /api/ai/insights
// @access  Private
const getInsights = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(30)
      .select('amount category type date description -_id');
      
    if (!transactions || transactions.length === 0) {
      return res.status(200).json({ insights: "Not enough data yet. Add some transactions to get AI insights!" });
    }

    const insights = await aiService.generateInsights(transactions);
    res.status(200).json({ insights });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  parseText,
  getInsights
};

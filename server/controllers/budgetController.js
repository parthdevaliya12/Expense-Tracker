const Budget = require('../models/Budget');

// @desc    Get budgets for a user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    let query = { userId: req.user.id };
    
    if (month && year) {
      query.month = month;
      query.year = year;
    }

    const budgets = await Budget.find(query);
    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
};

// @desc    Set a budget
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    // Check if budget already exists for this category, month, and year
    let budget = await Budget.findOne({
      userId: req.user.id,
      category: category || 'all',
      month,
      year,
    });

    if (budget) {
      // Update existing budget
      budget.amount = amount;
      await budget.save();
    } else {
      // Create new budget
      budget = await Budget.create({
        userId: req.user.id,
        category: category || 'all',
        amount,
        month,
        year,
      });
    }

    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (budget.userId.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await budget.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget,
};

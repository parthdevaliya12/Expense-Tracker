const Transaction = require('../models/Transaction');

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, date, description, paymentMethod } = req.body;

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount,
      category,
      date,
      description,
      paymentMethod,
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Check for user
    if (transaction.userId.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await transaction.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    if (transaction.userId.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
};

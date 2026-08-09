const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getTransactions).post(protect, addTransaction);
router.route('/:id').delete(protect, deleteTransaction).put(protect, updateTransaction);

module.exports = router;

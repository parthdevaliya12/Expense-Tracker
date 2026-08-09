const express = require('express');
const router = express.Router();
const {
  getBudgets,
  setBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getBudgets).post(protect, setBudget);
router.route('/:id').delete(protect, deleteBudget);

module.exports = router;

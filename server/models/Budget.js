const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      default: 'all', // 'all' means overall budget, specific string means category budget
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
    },
    month: {
      type: Number,
      required: [true, 'Please add a month (1-12)'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please add a year'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Budget', budgetSchema);

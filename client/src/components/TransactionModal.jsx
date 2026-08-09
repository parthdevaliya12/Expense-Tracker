import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import dayjs from 'dayjs';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

const TransactionModal = ({ isOpen, onClose, transaction, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Food', 'Shopping', 'Transport', 'Bills', 
    'Entertainment', 'Health', 'Education', 'Salary', 'Freelance', 'Other'
  ];

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      category: '',
      date: dayjs().format('YYYY-MM-DD'),
      description: '',
      paymentMethod: 'Cash',
    }
  });

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        date: dayjs(transaction.date).format('YYYY-MM-DD'),
        description: transaction.description,
        paymentMethod: transaction.paymentMethod,
      });
    } else {
      reset({
        type: 'expense',
        amount: '',
        category: '',
        date: dayjs().format('YYYY-MM-DD'),
        description: '',
        paymentMethod: 'Cash',
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (transaction) {
        await api.put(`/transactions/${transaction._id}`, data);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', data);
        toast.success('Transaction added');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="flex gap-4 mb-4">
            <label className="flex-1 cursor-pointer">
              <input type="radio" value="expense" {...register('type')} className="peer sr-only" />
              <div className="text-center py-2 rounded-lg border border-border peer-checked:bg-danger/10 peer-checked:border-danger peer-checked:text-danger text-muted-foreground font-medium transition-all">
                Expense
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" value="income" {...register('type')} className="peer sr-only" />
              <div className="text-center py-2 rounded-lg border border-border peer-checked:bg-success/10 peer-checked:border-success peer-checked:text-success text-muted-foreground font-medium transition-all">
                Income
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              {...register('amount')}
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all ${errors.amount ? 'border-danger' : 'border-border'}`}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <input
              type="text"
              {...register('description')}
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all ${errors.description ? 'border-danger' : 'border-border'}`}
              placeholder="E.g. Dinner, Salary"
            />
            {errors.description && <p className="text-danger text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input
                type="date"
                {...register('date')}
                className={`w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all ${errors.date ? 'border-danger' : 'border-border'}`}
              />
              {errors.date && <p className="text-danger text-xs mt-1">{errors.date.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Payment Method</label>
              <select
                {...register('paymentMethod')}
                className={`w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all ${errors.paymentMethod ? 'border-danger' : 'border-border'}`}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Category</label>
            <select
              {...register('category')}
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all ${errors.category ? 'border-danger' : 'border-border'}`}
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-danger text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors flex justify-center items-center"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default TransactionModal;

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'sonner';
import { WalletCards, Trash2, Loader2, Plus, X } from 'lucide-react';
import dayjs from 'dayjs';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Food', 'Shopping', 'Transport', 'Bills', 
    'Entertainment', 'Health', 'Education', 'Other'
  ];

  const currentMonth = dayjs().month() + 1; // 1-12
  const currentYear = dayjs().year();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      category: 'all',
      amount: '',
      month: currentMonth,
      year: currentYear
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetRes, txRes] = await Promise.all([
        api.get(`/budgets?month=${currentMonth}&year=${currentYear}`),
        api.get('/transactions') // Ideal to filter by month/year in backend, but doing frontend for now
      ]);
      setBudgets(budgetRes.data);
      
      // Filter transactions for current month
      const currentMonthTx = txRes.data.filter(tx => 
        tx.type === 'expense' && 
        dayjs(tx.date).month() + 1 === currentMonth &&
        dayjs(tx.date).year() === currentYear
      );
      setTransactions(currentMonthTx);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await api.post('/budgets', data);
      toast.success('Budget saved successfully');
      fetchData();
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Budget deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const calculateSpent = (category) => {
    if (category === 'all') {
      return transactions.reduce((sum, tx) => sum + tx.amount, 0);
    }
    return transactions
      .filter(tx => tx.category === category)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
            <p className="text-muted-foreground">Manage your spending limits for {dayjs().format('MMMM YYYY')}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>New Budget</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-3xl border border-border shadow-sm">
            <WalletCards size={48} className="mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No Budgets Set</h3>
            <p className="text-muted-foreground mb-4">Set a budget to track your spending limits.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-primary hover:underline font-medium">Create your first budget</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map(budget => {
              const spent = calculateSpent(budget.category);
              const percentage = Math.min((spent / budget.amount) * 100, 100);
              
              let progressColor = 'bg-primary';
              if (percentage > 90) progressColor = 'bg-danger';
              else if (percentage > 75) progressColor = 'bg-warning';

              return (
                <div key={budget._id} className="glass-panel p-6 rounded-3xl shadow-sm border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground capitalize">
                        {budget.category === 'all' ? 'Overall Budget' : budget.category}
                      </h3>
                      <p className="text-sm text-muted-foreground">{dayjs().month(budget.month - 1).format('MMMM')} {budget.year}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(budget._id)}
                      className="text-muted-foreground hover:text-danger transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm">
                      <span className="text-foreground font-semibold">₹{spent.toLocaleString()}</span>
                      <span className="text-muted-foreground"> / ₹{budget.amount.toLocaleString()}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      percentage > 90 ? 'bg-danger/10 text-danger' : 
                      percentage > 75 ? 'bg-warning/10 text-warning' : 
                      'bg-primary/10 text-primary'
                    }`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${progressColor} transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  {percentage >= 100 && (
                    <p className="text-xs text-danger mt-3 font-medium">You have exceeded your budget!</p>
                  )}
                  {percentage > 90 && percentage < 100 && (
                    <p className="text-xs text-warning mt-3 font-medium">Warning: Approaching budget limit.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Add Budget Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Set Budget</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="all">Overall (All Categories)</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Budget Amount (₹)</label>
                <input
                  type="number"
                  step="1"
                  required
                  {...register('amount', { required: true, min: 1 })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. 5000"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors flex justify-center items-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Budget'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Budgets;

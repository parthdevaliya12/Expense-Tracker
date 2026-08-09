import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, Sparkles, Filter } from 'lucide-react';
import dayjs from 'dayjs';
import TransactionModal from '../components/TransactionModal';
import AiEntryModal from '../components/AiEntryModal';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
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
            <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground">Manage your income and expenses</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Sparkles size={18} />
              <span className="hidden sm:inline">AI Add</span>
            </button>
            <button 
              onClick={openNewModal}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-4 pr-10 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
              />
            </div>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Filter size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-muted-foreground">Loading transactions...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-muted-foreground">No transactions found. Add one to get started!</td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{dayjs(tx.date).format('MMM D, YYYY')}</td>
                      <td className="px-6 py-4 text-sm font-medium">{tx.description}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(tx)} className="text-primary hover:text-primary-hover mr-3 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(tx._id)} className="text-danger hover:text-red-700 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <TransactionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            transaction={selectedTransaction}
            onSuccess={fetchTransactions}
          />
        )}
        {isAiModalOpen && (
          <AiEntryModal 
            isOpen={isAiModalOpen} 
            onClose={() => setIsAiModalOpen(false)} 
            onSuccess={fetchTransactions}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Transactions;

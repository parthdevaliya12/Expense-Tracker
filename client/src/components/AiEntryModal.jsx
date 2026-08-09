import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, Send, Check } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const AiEntryModal = ({ isOpen, onClose, onSuccess }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) return;
    
    try {
      setIsLoading(true);
      const { data } = await api.post('/ai/parse', { text });
      // Clean up the data if needed, verify fields
      setParsedData(data);
    } catch (error) {
      toast.error('AI failed to parse the text. Try being more specific.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;
    
    try {
      setIsSaving(true);
      // Ensure missing fields have defaults before saving
      const transactionToSave = {
        ...parsedData,
        paymentMethod: parsedData.paymentMethod || 'Cash'
      };
      
      await api.post('/transactions', transactionToSave);
      toast.success('Transaction added via AI');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save transaction');
    } finally {
      setIsSaving(false);
    }
  };

  const resetState = () => {
    setParsedData(null);
    setText('');
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-4 border-b border-border bg-indigo-500/10">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={24} />
            AI Smart Entry
          </h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!parsedData ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Just type what you spent. Our AI will figure out the amount, category, date, and description for you.
              </p>
              
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g., Spent ₹500 on dinner at McDonald's yesterday..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-32 text-foreground"
                />
              </div>

              <button
                onClick={handleParse}
                disabled={isLoading || !text.trim()}
                className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={18} /> Analyze Text</>}
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-muted p-4 rounded-xl border border-border">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Detected Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Type</span>
                    <p className={`font-medium capitalize ${parsedData.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {parsedData.type || 'expense'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Amount</span>
                    <p className="font-semibold text-foreground">₹{parsedData.amount}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Category</span>
                    <p className="font-medium text-foreground">{parsedData.category}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Date</span>
                    <p className="font-medium text-foreground">{parsedData.date}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground">Description</span>
                    <p className="font-medium text-foreground">{parsedData.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={resetState}
                  className="flex-1 py-2.5 border border-border rounded-xl font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Edit / Retry
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary-hover transition-colors flex justify-center items-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Check size={18} /> Confirm & Save</>}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default AiEntryModal;

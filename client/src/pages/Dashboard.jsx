import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { IndianRupee, TrendingUp, TrendingDown, PiggyBank, Sparkles, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [txRes, insightsRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/ai/insights').catch(() => ({ data: { insights: 'Unable to load AI insights.' } }))
        ]);
        
        setData(txRes.data);
        setInsights(insightsRes.data.insights);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
        setInsightsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const transactions = data || [];
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;
  const totalSavings = totalBalance > 0 ? totalBalance : 0;

  const expensesByCategoryMap = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expensesByCategoryMap[t.category] = (expensesByCategoryMap[t.category] || 0) + t.amount;
  });
  const expensesByCategory = Object.keys(expensesByCategoryMap).map(name => ({
    name, value: expensesByCategoryMap[name]
  })).sort((a, b) => b.value - a.value);

  const monthlyDataMap = {};
  for(let i=5; i>=0; i--) {
     const d = new Date();
     d.setMonth(d.getMonth() - i);
     const monthStr = d.toLocaleString('default', { month: 'short' });
     monthlyDataMap[monthStr] = { month: monthStr, income: 0, expense: 0 };
  }
  
  transactions.forEach(t => {
     const date = new Date(t.date);
     const monthStr = date.toLocaleString('default', { month: 'short' });
     if(monthlyDataMap[monthStr]) {
         if(t.type === 'income') monthlyDataMap[monthStr].income += t.amount;
         if(t.type === 'expense') monthlyDataMap[monthStr].expense += t.amount;
     }
  });
  const monthlyData = Object.values(monthlyDataMap);
  const recentTransactions = transactions.slice(0, 5);

  const statCards = [
    { title: 'Total Balance', amount: totalBalance, icon: IndianRupee, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'Total Income', amount: totalIncome, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Total Expense', amount: totalExpense, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { title: 'Total Savings', amount: totalSavings, icon: PiggyBank, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground font-inter mt-1">Here's your financial summary.</p>
        </div>
      </div>

      {/* AI Insights Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 relative overflow-hidden group min-w-0"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-primary rounded-2xl shadow-lg shrink-0">
            <Sparkles className="text-primary-foreground" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              AI Financial Insights
            </h3>
            {insightsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" size={16} />
                <span>Analyzing your spending patterns...</span>
              </div>
            ) : (
              <div className="text-muted-foreground font-inter leading-relaxed whitespace-pre-wrap">
                {insights}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel rounded-3xl p-6 flex items-center gap-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 min-w-0 overflow-hidden"
          >
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={stat.color} size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">₹{stat.amount?.toLocaleString()}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses by Category */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-3xl p-6 flex flex-col min-w-0 lg:col-span-1 overflow-hidden"
        >
          <h3 className="text-xl font-bold text-foreground mb-6">Category Split</h3>
          {expensesByCategory?.length > 0 ? (
            <div className="flex flex-col flex-1 min-h-[300px]">
              <div className="h-[250px] w-full relative overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#18181b', fontWeight: 'bold' }}
                      formatter={(value) => `₹${value.toLocaleString()}`} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {expensesByCategory.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-muted-foreground truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              No expenses yet
            </div>
          )}
        </motion.div>

        {/* Monthly Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-3xl p-6 min-w-0 lg:col-span-2 overflow-hidden"
        >
          <h3 className="text-xl font-bold text-foreground mb-6">6-Month Overview</h3>
          <div className="h-[300px] w-full relative overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 min-w-0 overflow-hidden"
      >
        <h3 className="text-xl font-bold text-foreground mb-6">Recent Transactions</h3>
        {recentTransactions?.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === 'expense' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {tx.type === 'expense' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {tx.type === 'expense' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                  </p>
                  <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-lg text-muted-foreground mt-1 inline-block">
                    {tx.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No recent transactions found.</p>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;

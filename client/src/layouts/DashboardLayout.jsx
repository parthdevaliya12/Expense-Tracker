import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, ReceiptText, Wallet, Settings, LogOut, Sun, Moon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ReceiptText },
  { name: 'Budgets', href: '/budgets', icon: Wallet },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const DashboardLayout = () => {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      
      {/* Desktop Floating Dock */}
      <aside className="hidden md:flex flex-col w-[260px] h-[calc(100vh-2rem)] my-4 ml-4 glass-panel rounded-3xl p-4 shrink-0 z-20 sticky top-4">
        <div className="flex items-center gap-3 mb-10 px-2 mt-4">
          <div className="w-10 h-10 shrink-0">
            <img src="/spendiq.png" alt="SpendIQ" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-bold font-sans tracking-tight gradient-text">SpendIQ</span>
        </div>

        <nav className="flex-1 space-y-2 flex flex-col">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div layoutId="active-pill" className="absolute inset-0 bg-primary z-0" />
                )}
                <item.icon size={20} className="relative z-10" />
                <span className="font-medium relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all duration-300"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-danger hover:bg-danger/10 transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
          
          <div className="px-4 py-3 mt-4 border-t border-border/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
               {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
               <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
               <p className="text-xs text-muted-foreground truncate font-inter">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto pb-28 md:pb-0 relative z-10">
        
        {/* Mobile Header */}
        <header className="md:hidden glass-panel rounded-b-3xl px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 shrink-0">
              <img src="/spendiq.png" alt="SpendIQ" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold font-sans tracking-tight gradient-text">SpendIQ</span>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={toggleTheme} className="p-2 rounded-xl text-muted-foreground bg-secondary/50">
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <button onClick={logout} className="p-2 rounded-xl text-danger bg-danger/10">
               <LogOut size={18} />
             </button>
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-1 p-4 md:p-8 md:pt-6 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Floating Bottom Nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 glass-panel rounded-3xl p-2 flex justify-around items-center z-40 shadow-2xl">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300 relative ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {isActive && (
                <motion.div layoutId="mobile-active-pill" className="absolute inset-0 bg-primary/10 rounded-2xl z-0" />
              )}
              <item.icon size={22} className="relative z-10" />
              <span className="text-[10px] font-medium relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
    </div>
  );
};

export default DashboardLayout;

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left Side - Brand & Graphics (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 flex-col items-center justify-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#071732]/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/30 blur-[100px]" />
        
        <div className="relative z-10 p-12 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="w-24 h-24 mb-8 shrink-0"
          >
            <img src="/spendiq.png" alt="SpendIQ" className="w-full h-full object-contain drop-shadow-2xl" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 font-sans tracking-tight"
          >
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">SpendIQ</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-zinc-400 text-lg max-w-md font-inter"
          >
            The most intelligent way to track your expenses, manage your budgets, and achieve financial freedom with AI insights.
          </motion.p>
        </div>

        {/* Decorative glass elements */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10"
        />
        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10"
        />
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md flex-1 flex flex-col justify-center">
          <div className="lg:hidden flex justify-center mb-8">
             <div className="w-16 h-16 shrink-0">
                <img src="/spendiq.png" alt="SpendIQ" className="w-full h-full object-contain" />
              </div>
          </div>
          <div className="text-center lg:text-left mb-10">
             <h2 className="text-3xl font-bold text-foreground mb-2">Get Started</h2>
             <p className="text-muted-foreground font-inter">Enter your details to continue</p>
          </div>
          
          {/* Outlet renders Login or Register */}
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;

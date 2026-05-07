import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Menu, X, CreditCard, User, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold gradient-text">LeadFlow AI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link to="/pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                <Link to="/search" className="text-slate-300 hover:text-white transition-colors">Search Leads</Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full">
                  <CreditCard className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">{user.credits} credits</span>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-amber-400 hover:text-amber-300">
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-slate-300 hover:text-white">
                    <User className="w-5 h-5" />
                    <span className="text-sm">{user.name}</span>
                  </button>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary px-4 py-2 rounded-lg text-white text-sm font-medium">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button 
            className="md:hidden text-slate-300"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" className="block py-2 text-slate-300" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/pricing" className="block py-2 text-slate-300" onClick={() => setMobileOpen(false)}>Pricing</Link>
            {user && (
              <>
                <Link to="/dashboard" className="block py-2 text-slate-300" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link to="/search" className="block py-2 text-slate-300" onClick={() => setMobileOpen(false)}>Search Leads</Link>
              </>
            )}
            {user ? (
              <button onClick={handleLogout} className="block py-2 text-red-400 w-full text-left">Logout</button>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-slate-300" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/register" className="block py-2 text-blue-400" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
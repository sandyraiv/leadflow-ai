import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  CreditCard, Download, Search, 
  MapPin, Building2, Phone, Mail, Star, ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalLeads: 0, downloads: 0, searches: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, leadsRes] = await Promise.all([
        axios.get(`${API_URL}/leads/stats`),
        axios.get(`${API_URL}/leads/recent?limit=5`)
      ]);
      setStats(statsRes.data);
      setRecentLeads(leadsRes.data.leads);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (leads) => {
    const headers = ['Business Name', 'Category', 'City', 'Area', 'Phone', 'Email', 'Website', 'Rating', 'Address'];
    const rows = leads.map(l => [
      l.name, l.category, l.city, l.area, l.phone || '', l.email || '', l.website || '', l.rating || '', l.address || ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV downloaded successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="loading-spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm text-slate-500">Total</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalLeads}</p>
          <p className="text-sm text-slate-400 mt-1">Leads Available</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-sm text-slate-500">This Month</span>
          </div>
          <p className="text-3xl font-bold">{stats.downloads}</p>
          <p className="text-sm text-slate-400 mt-1">Downloads</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm text-slate-500">Balance</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{user?.credits || 0}</p>
          <p className="text-sm text-slate-400 mt-1">Credits Remaining</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/search" className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search New Leads</span>
          </Link>
          <Link to="/pricing" className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:border-slate-400 hover:text-white transition-colors flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Buy Credits</span>
          </Link>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recently Added Leads</h2>
          <Link to="/search" className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No leads found yet. Start searching!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Business</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Location</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Score</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{lead.name}</p>
                        <p className="text-sm text-slate-500">{lead.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{lead.city}, {lead.area}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {lead.phone && (
                          <div className="flex items-center space-x-1 text-slate-400">
                            <Phone className="w-3 h-3" />
                            <span className="text-sm">{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center space-x-1 text-slate-400">
                            <Mail className="w-3 h-3" />
                            <span className="text-sm">{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium">{lead.score || lead.rating || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => downloadCSV([lead])}
                        className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, CreditCard, TrendingUp, Download, Search, 
  Shield, AlertTriangle, CheckCircle, XCircle, BarChart3 
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, leadsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`),
        axios.get(`${API_URL}/admin/users`),
        axios.get(`${API_URL}/admin/leads?limit=50`)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setLeads(leadsRes.data.leads);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const addCredits = async (userId, credits) => {
    try {
      await axios.post(`${API_URL}/admin/add-credits`, { userId, credits });
      toast.success(`Added ${credits} credits`);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to add credits');
    }
  };

  const verifyLead = async (leadId, verified) => {
    try {
      await axios.patch(`${API_URL}/admin/leads/${leadId}`, { verified });
      toast.success(verified ? 'Lead verified' : 'Lead unverified');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update lead');
    }
  };

  const deleteLead = async (leadId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/admin/leads/${leadId}`);
      toast.success('Lead deleted');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete lead');
    }
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
      <div className="flex items-center space-x-3 mb-8">
        <Shield className="w-8 h-8 text-amber-400" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-slate-400">Manage users, leads, and platform settings</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-slate-500">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
          <p className="text-sm text-slate-400">Registered Users</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Search className="w-6 h-6 text-green-400" />
            <span className="text-xs text-slate-500">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalLeads || 0}</p>
          <p className="text-sm text-slate-400">Leads in Database</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Download className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-slate-500">This Month</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalDownloads || 0}</p>
          <p className="text-sm text-slate-400">Lead Downloads</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <span className="text-xs text-slate-500">Revenue</span>
          </div>
          <p className="text-2xl font-bold">₹{stats.totalRevenue || 0}</p>
          <p className="text-sm text-slate-400">Total Sales</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 rounded-xl p-1 mb-6 w-fit">
        {['overview', 'users', 'leads'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab 
                ? 'bg-slate-700 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">User</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Credits</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Downloads</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Joined</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm">
                          {u.name[0]}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="text-green-400 font-medium">{u.credits}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{u.downloads || 0}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => addCredits(u._id, 100)}
                          className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs hover:bg-green-500/20"
                        >
                          +100
                        </button>
                        <button
                          onClick={() => addCredits(u._id, 500)}
                          className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20"
                        >
                          +500
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Business</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Location</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Score</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-slate-500">{lead.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{lead.category}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{lead.city}, {lead.area}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${lead.score >= 70 ? 'text-green-400' : 'text-amber-400'}`}>
                        {lead.score || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.verified ? (
                        <span className="flex items-center space-x-1 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-amber-400 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => verifyLead(lead._id, !lead.verified)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          title={lead.verified ? 'Unverify' : 'Verify'}
                        >
                          {lead.verified ? <XCircle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
                        </button>
                        <button
                          onClick={() => deleteLead(lead._id)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-4">
              {stats.recentActivity?.map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.user}</p>
                  </div>
                  <span className="text-xs text-slate-500">{activity.time}</span>
                </div>
              )) || <p className="text-slate-500 text-sm">No recent activity</p>}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span>Lead Distribution</span>
            </h3>
            <div className="space-y-3">
              {stats.categoryDistribution?.map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-300">{cat.name}</span>
                    <span className="text-slate-400">{cat.count} leads</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              )) || <p className="text-slate-500 text-sm">No data available</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
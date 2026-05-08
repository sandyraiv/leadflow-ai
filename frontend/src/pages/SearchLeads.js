import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Search, MapPin, Filter, Download, Star, 
  Phone, Mail, Globe, ChevronDown, X, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CATEGORIES = [
  'All', 'Restaurant', 'Hotel', 'Hospital', 'School', 'Real Estate', 
  'IT Services', 'Retail', 'Manufacturing', 'Consulting', 'Automotive',
  'Healthcare', 'Education', 'Finance', 'Construction', 'Logistics'
];

const CITIES = [
  'All', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat'
];

const SearchLeads = () => {
  const { user, updateCredits } = useAuth() || {};
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedArea, setSelectedArea] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState(new Set());

  const fetchLeads = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', 20);
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedCity !== 'All') params.append('city', selectedCity);
      if (selectedArea) params.append('area', selectedArea);
      if (minRating > 0) params.append('minRating', minRating);

      const res = await axios.get(`${API_URL}/leads?${params.toString()}`);
      setLeads(res.data.leads || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || 1);
    } catch (err) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchLeads(1);
  }, [selectedCategory, selectedCity, selectedArea, minRating]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const toggleLeadSelection = (leadId) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const downloadSelected = async () => {
    if (selectedLeads.size === 0) {
      toast.error('Select at least one lead to download');
      return;
    }
    if (!user) {
      toast.error('Please login to download leads');
      return;
    }
    if ((user?.credits || 0) < selectedLeads.size) {
      toast.error(`You need ${selectedLeads.size} credits. You have ${user?.credits || 0}.`);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/leads/download`, {
        leadIds: Array.from(selectedLeads)
      });

      // Generate and download CSV
      const headers = ['Business Name', 'Category', 'City', 'Area', 'Phone', 'Email', 'Website', 'Rating', 'Address', 'Score'];
      const rows = res.data.leads.map(l => [
        l.name, l.category, l.city, l.area, l.phone || '', l.email || '', 
        l.website || '', l.rating || '', l.address || '', l.score || ''
      ]);

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      updateCredits?.(res.data.remainingCredits);
      setSelectedLeads(new Set());
      toast.success(`Downloaded ${res.data.leads.length} leads!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-slate-400';
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Leads</h1>
        <p className="text-slate-400">Find and export verified business leads</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by business name..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-colors flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="submit"
            className="btn-primary px-8 py-3 rounded-xl text-white font-medium"
          >
            Search
          </button>
        </form>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Area</label>
              <input
                type="text"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                placeholder="e.g. Koramangala"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Min Rating: {minRating}</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400">
          {leads.length > 0 ? `Showing ${leads.length} leads` : 'No leads found'}
        </p>

        {selectedLeads.size > 0 && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">{selectedLeads.size} selected</span>
            <button
              onClick={downloadSelected}
              className="btn-primary px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export ({selectedLeads.size} credits)</span>
            </button>
            <button
              onClick={() => setSelectedLeads(new Set())}
              className="p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <div 
              key={lead._id || lead.id}
              onClick={() => toggleLeadSelection(lead._id)}
              className={`glass-card rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                selectedLeads.has(lead._id) 
                  ? 'border-blue-500 bg-blue-500/5' 
                  : 'border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedLeads.has(lead._id) 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-slate-600'
                  }`}>
                    {selectedLeads.has(lead._id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{lead.name}</h3>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{lead.category}</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 ${getScoreColor(lead.score)}`}>
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm">{lead.score || lead.rating || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-slate-400">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{lead.address || `${lead.area}, ${lead.city}`}</span>
                </div>

                {lead.phone && (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{lead.phone}</span>
                  </div>
                )}

                {lead.email && (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}

                {lead.website && (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="truncate text-blue-400">{lead.website}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">1 credit to unlock</span>
                <span className="text-xs text-slate-500">
                  {lead.verified ? '✓ Verified' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => fetchLeads(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-slate-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => fetchLeads(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchLeads;
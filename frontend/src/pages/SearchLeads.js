import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const CATEGORIES = [
  "All",
  "Restaurant",
  "Hotel",
  "Hospital",
  "School",
  "Real Estate",
  "IT Services",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Automotive",
  "Healthcare",
  "Education",
  "Finance",
  "Construction",
  "Logistics"
];

const CITIES = [
  "All",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Surat"
];

const SearchLeads = () => {
  const { user, updateCredits } = useAuth() || {};

  const [leads, setLeads] = useState([]);
  const [, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedCity, setSelectedCity] =
    useState("All");

  const [selectedArea, setSelectedArea] =
    useState("");

  const [minRating, setMinRating] = useState(0);

  const [showFilters, setShowFilters] =
    useState(false);

  const [, setPage] = useState(1);

  const [, setTotalPages] = useState(1);

  const [selectedLeads, setSelectedLeads] =
    useState(new Set());

  const fetchLeads = useCallback(
    async (pageNum = 1) => {
      setLoading(true);

      try {
        const params = new URLSearchParams();

        params.append("page", pageNum);

        params.append("limit", 20);

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        if (selectedCategory !== "All") {
          params.append(
            "category",
            selectedCategory
          );
        }

        if (selectedCity !== "All") {
          params.append("city", selectedCity);
        }

        if (selectedArea) {
          params.append("area", selectedArea);
        }

        if (minRating > 0) {
          params.append(
            "minRating",
            minRating
          );
        }

        const res = await axios.get(
          `${API_URL}/leads?${params.toString()}`
        );

        setLeads(res.data.leads || []);

        setTotalPages(
          res.data.totalPages || 1
        );

        setPage(
          res.data.currentPage || 1
        );

      } catch (err) {
        toast.error(
          "Failed to fetch leads"
        );
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      selectedCategory,
      selectedCity,
      selectedArea,
      minRating
    ]
  );

  useEffect(() => {
    fetchLeads(1);
  }, [fetchLeads]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const downloadSelected = async () => {
    if (selectedLeads.size === 0) {
      toast.error(
        "Select at least one lead to download"
      );

      return;
    }

    if (!user) {
      toast.error(
        "Please login to download leads"
      );

      return;
    }

    if (
      (user?.credits || 0) <
      selectedLeads.size
    ) {
      toast.error(
        `You need ${selectedLeads.size} credits. You have ${
          user?.credits || 0
        }.`
      );

      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/leads/download`,
        {
          leadIds: Array.from(
            selectedLeads
          )
        }
      );

      const headers = [
        "Business Name",
        "Category",
        "City",
        "Area",
        "Phone",
        "Email",
        "Website",
        "Rating",
        "Address",
        "Score"
      ];

      const rows = res.data.leads.map(
        (l) => [
          l.name,
          l.category,
          l.city,
          l.area,
          l.phone || "",
          l.email || "",
          l.website || "",
          l.rating || "",
          l.address || "",
          l.score || ""
        ]
      );

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${cell}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv"
      });

      const url =
        window.URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = url;

      a.download = `leads-export-${
        new Date()
          .toISOString()
          .split("T")[0]
      }.csv`;

      a.click();

      window.URL.revokeObjectURL(url);

      updateCredits?.(
        res.data.remainingCredits
      );

      setSelectedLeads(new Set());

      toast.success(
        `Downloaded ${res.data.leads.length} leads!`
      );

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Download failed"
      );
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Search Leads
        </h1>

        <p className="text-slate-400">
          Find and export verified business leads
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 mb-6">

        <form
          onSubmit={handleSearch}
          className="flex flex-col lg:flex-row gap-4"
        >

          <div className="flex-1 relative">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search by business name..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters(!showFilters)
            }
            className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-colors flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />

            <span>Filters</span>

            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
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
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Category
              </label>

              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option
                    key={c}
                    value={c}
                  >
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                City
              </label>

              <select
                value={selectedCity}
                onChange={(e) =>
                  setSelectedCity(e.target.value)
                }
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500"
              >
                {CITIES.map((c) => (
                  <option
                    key={c}
                    value={c}
                  >
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Area
              </label>

              <input
                type="text"
                value={selectedArea}
                onChange={(e) =>
                  setSelectedArea(e.target.value)
                }
                placeholder="e.g. Koramangala"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Min Rating: {minRating}
              </label>

              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) =>
                  setMinRating(parseFloat(e.target.value))
                }
                className="w-full accent-blue-500"
              />
            </div>

          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">

        <p className="text-slate-400">
          {leads.length > 0
            ? `Showing ${leads.length} leads`
            : 'No leads found'}
        </p>

        {selectedLeads.size > 0 && (

          <div className="flex items-center space-x-4">

            <span className="text-sm text-slate-400">
              {selectedLeads.size} selected
            </span>

            <button
              onClick={downloadSelected}
              className="btn-primary px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />

              <span>
                Export ({selectedLeads.size} credits)
              </span>
            </button>

            <button
              onClick={() =>
                setSelectedLeads(new Set())
              }
              className="p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

          </div>
        )}
      </div>

    </div>
  );
};

export default SearchLeads;
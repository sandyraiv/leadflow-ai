import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Search, Download, Shield, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Search className="w-6 h-6 text-blue-400" />,
      title: "Smart Search",
      desc: "Find leads by city, area, and business category with precision filtering."
    },
    {
      icon: <Shield className="w-6 h-6 text-green-400" />,
      title: "Verified Data",
      desc: "Every lead is scored and verified for accuracy before delivery."
    },
    {
      icon: <Download className="w-6 h-6 text-purple-400" />,
      title: "Instant Export",
      desc: "Download leads in CSV or Excel format with one click."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-amber-400" />,
      title: "AI Scoring",
      desc: "Our algorithm ranks leads by quality, contact completeness, and relevance."
    }
  ];

  const steps = [
    "Choose your target city and business category",
    "Set filters for area, rating, and contact info",
    "Purchase credits and unlock premium leads",
    "Export and start closing deals"
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">AI-Powered Lead Generation</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Find Your Next <br />
            <span className="gradient-text">High-Value Customer With Sandy's LeadFlow</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Stop wasting time on cold outreach. Access verified business leads 
            with complete contact details, filtered by location and industry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center space-x-2">
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/pricing" className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-semibold text-lg hover:border-slate-400 hover:text-white transition-colors">
              View Pricing
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center space-x-8 text-slate-500">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">10,000+ Leads Delivered</span>
            </div>
            <div className="w-1 h-1 bg-slate-600 rounded-full" />
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">95% Data Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-slate-400 max-w-xl mx-auto">A complete toolkit for modern sales teams and agencies.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 hover:bg-slate-800/50 transition-all duration-300 group">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400">From search to sale in four simple steps.</p>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center space-x-6 glass-card rounded-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {i + 1}
                </div>
                <p className="text-lg text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Scale Your Outreach?</h2>
          <p className="text-slate-400 mb-8 text-lg">Join hundreds of agencies using LeadFlow AI to find their ideal customers.</p>
          <Link to="/register" className="btn-primary inline-flex items-center space-x-2 px-8 py-4 rounded-xl text-white font-semibold text-lg">
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

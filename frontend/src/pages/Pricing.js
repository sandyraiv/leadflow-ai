import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Check, Zap, Crown, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Starter',
    credits: 100,
    price: 499,
    icon: <Zap className="w-6 h-6 text-blue-400" />,
    features: [
      '100 Lead Credits',
      'Basic Filters',
      'CSV Export',
      'Email Support',
      '7-day data history'
    ],
    popular: false
  },
  {
    name: 'Professional',
    credits: 500,
    price: 1999,
    icon: <Crown className="w-6 h-6 text-purple-400" />,
    features: [
      '500 Lead Credits',
      'Advanced Filters',
      'CSV + Excel Export',
      'Priority Support',
      '30-day data history',
      'AI Lead Scoring'
    ],
    popular: true
  },
  {
    name: 'Agency',
    credits: 1000,
    price: 3499,
    icon: <Building className="w-6 h-6 text-amber-400" />,
    features: [
      '1000 Lead Credits',
      'All Filters',
      'Bulk Export',
      '24/7 Support',
      '90-day data history',
      'AI Lead Scoring',
      'API Access',
      'White-label Reports'
    ],
    popular: false
  }
];

const Pricing = () => {
  const { user } = useAuth() || {};

  const handlePurchase = (plan) => {
    if (!user) {
      toast.error('Please login to purchase credits');
      return;
    }
    toast.success(`Selected ${plan.name} plan. Redirecting to payment...`);
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Purchase credits and unlock verified business leads. No subscriptions, no hidden fees.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative glass-card rounded-2xl p-8 ${
              plan.popular ? 'border-blue-500/50 ring-1 ring-blue-500/20' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                {plan.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.credits} Credits</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">₹{plan.price}</span>
              <span className="text-slate-500">/one-time</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center space-x-3 text-slate-300 text-sm">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {user ? (
              <button
                onClick={() => handlePurchase(plan)}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.popular 
                    ? 'btn-primary text-white' 
                    : 'border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white'
                }`}
              >
                Purchase Now
              </button>
            ) : (
              <Link
                to="/register"
                className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                  plan.popular 
                    ? 'btn-primary text-white' 
                    : 'border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white'
                }`}
              >
                Get Started
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 glass-card rounded-2xl p-8 max-w-3xl mx-auto text-center">
        <h3 className="text-xl font-bold mb-2">Need a Custom Plan?</h3>
        <p className="text-slate-400 mb-6">
          Looking for bulk credits or white-label solutions? Contact us for custom pricing.
        </p>
        <a 
          href="mailto:sales@leadflowai.com" 
          className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium"
        >
          <span>Contact Sales Team</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default Pricing;
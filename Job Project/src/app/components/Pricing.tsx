import { motion } from "motion/react";
import { CheckCircle2, X } from "lucide-react";

export function Pricing() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-slate-600">Start matching instantly. No hidden fees or complex contracts.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Student Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">Student Hub</h3>
            <p className="text-sm text-slate-500 mt-2">Perfect for fresh graduates looking to land their first role.</p>
          </div>
          <div className="mb-6">
            <span className="text-5xl font-black text-slate-900">$0</span>
            <span className="text-slate-500">/ forever</span>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> <span className="text-slate-600">Unlimited Resume Uploads</span></li>
            <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> <span className="text-slate-600">AI Match Insights</span></li>
            <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> <span className="text-slate-600">Apply to Unlimited Jobs</span></li>
          </ul>
          <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors">Get Started Free</button>
        </motion.div>

        {/* Employer Pro Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-indigo-600 rounded-3xl p-8 border border-indigo-500 shadow-xl shadow-indigo-200 text-white relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 bg-indigo-400/30 text-indigo-100 text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
          <div className="mb-6 relative z-10">
            <h3 className="text-xl font-bold text-white">Startup Employer</h3>
            <p className="text-sm text-indigo-200 mt-2">For growing teams looking for the best fresh talent.</p>
          </div>
          <div className="mb-6 relative z-10">
            <span className="text-5xl font-black text-white">$99</span>
            <span className="text-indigo-200">/ month</span>
          </div>
          <ul className="space-y-4 mb-8 relative z-10">
            <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20} /> <span>Post up to 5 Jobs</span></li>
            <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20} /> <span>Advanced NLP Matching</span></li>
            <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20} /> <span>Candidate Filtering & Analytics</span></li>
          </ul>
          <button className="w-full py-3 bg-white hover:bg-indigo-50 text-indigo-600 font-bold rounded-xl transition-colors relative z-10">Start 14-Day Trial</button>
        </motion.div>

        {/* Enterprise Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">Enterprise Suite</h3>
            <p className="text-sm text-slate-500 mt-2">For large organizations with heavy campus recruitment.</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900">Custom</span>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> <span className="text-slate-600">Unlimited Active Jobs</span></li>
            <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> <span className="text-slate-600">Dedicated Account Manager</span></li>
            <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> <span className="text-slate-600">Custom ATS Integrations</span></li>
          </ul>
          <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors mt-auto">Contact Sales</button>
        </motion.div>
      </div>
    </div>
  );
}

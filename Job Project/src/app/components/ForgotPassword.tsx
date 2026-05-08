import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { toast } from "sonner";
import api from "../lib/api";
import { Mail, Lock, ArrowRight, CheckCircle, ChevronLeft } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/v1/auth/forgot-password", { email }, false);
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl p-10 border border-slate-200 shadow-xl text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Check your inbox</h2>
          <p className="text-slate-500 font-medium mb-2">
            If <span className="font-bold text-slate-700">{email}</span> is registered,
            you'll receive a reset link shortly.
          </p>
          <p className="text-sm text-slate-400 mb-8">
            The link expires in 1 hour. Check your spam folder if you don't see it.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-sm">
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Forgot Password</h1>
          <p className="text-slate-500">Enter your email and we'll send you a reset link.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors mt-2 shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Sending…" : <><ArrowRight size={18} /> Send Reset Link</>}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500 font-medium">
            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center justify-center gap-1">
              <ChevronLeft size={16} /> Back to Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

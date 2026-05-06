import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { toast } from "sonner";
import {
  Send, Mail, MessageCircle, ShieldCheck, Clock,
  CheckCircle, ChevronLeft, AlertCircle, User
} from "lucide-react";

const SUBJECTS = [
  "Account Verification",
  "Identity Not Verified After 24h",
  "Job Posting Issue",
  "Application Status Query",
  "Technical Problem",
  "Password / Login Help",
  "Other",
];

export function ContactAdmin() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      toast.error("Please write a more detailed message");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/v1/contact", { name, email, subject, message }, !!user);
      setSubmitted(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Message Sent!</h2>
          <p className="text-slate-500 font-medium mb-2">
            Your request has been submitted to the admin team.
          </p>
          <p className="text-sm text-slate-400 mb-8">
            We typically respond within 24 hours. Check the email you provided for a reply.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/help-center"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm">
              Browse Help Center
            </Link>
            <button onClick={() => { setSubmitted(false); setMessage(""); }}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
              Send Another Message
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/help-center" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <ChevronLeft size={22} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Contact Admin</h1>
          <p className="text-slate-500 mt-1">Submit a request and the admin team will respond.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Sidebar info */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 text-sm uppercase tracking-wider">What happens next?</h3>
            <div className="space-y-4">
              {[
                { icon: <Send size={16} />, label: "Your request is submitted", desc: "Instantly logged in the admin queue." },
                { icon: <ShieldCheck size={16} />, label: "Admin reviews your case", desc: "Typically within 24 hours on weekdays." },
                { icon: <Mail size={16} />, label: "You receive a response", desc: "Reply sent to the email you provide." },
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{step.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-indigo-500" />
              <p className="text-sm font-bold text-indigo-700">Response Time</p>
            </div>
            <p className="text-xs text-indigo-600 font-medium leading-relaxed">
              Admin team is available Monday–Friday. Verification requests are usually resolved within the same business day.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-amber-600" />
              <p className="text-sm font-bold text-amber-700">Before you write</p>
            </div>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Check the{" "}
              <Link to="/help-center" className="underline font-bold">Help Center</Link>{" "}
              first — most common questions are answered there.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
        >
          <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <MessageCircle size={22} className="text-indigo-500" /> Send a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                    placeholder="Full name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700"
              >
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Message <span className="text-slate-400 normal-case font-medium">(be specific so we can help faster)</span>
              </label>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium text-sm"
                placeholder={`e.g. "I signed up 2 days ago as a student but my account still shows Pending Verification. My university is FAST-NU and I have uploaded my resume."`}
              />
              <p className="text-xs text-slate-400 font-medium text-right">{message.length} chars</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              <Send size={18} /> {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import api from "../lib/api";
import {
  Search, HelpCircle, ChevronDown, ChevronUp,
  GraduationCap, Building, Bot, FileText, User, MessageCircle
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Getting Started": <GraduationCap size={18} />,
  "Resume & Profile": <FileText size={18} />,
  "AI Matching": <Bot size={18} />,
  "For Employers": <Building size={18} />,
  "Account": <User size={18} />,
  "General": <HelpCircle size={18} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Getting Started": "bg-blue-50 text-blue-600 border-blue-100",
  "Resume & Profile": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "AI Matching": "bg-indigo-50 text-indigo-600 border-indigo-100",
  "For Employers": "bg-purple-50 text-purple-600 border-purple-100",
  "Account": "bg-amber-50 text-amber-600 border-amber-100",
  "General": "bg-slate-50 text-slate-600 border-slate-200",
};

export function HelpCenter() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ items: FAQ[] }>("/api/v1/faqs", false)
      .then((r) => setFaqs(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filtered = faqs.filter((f) => {
    const matchesSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || f.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const grouped = filtered.reduce<Record<string, FAQ[]>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 mb-6">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Help Center</h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Everything you need to get the most out of GradMatch AI.
        </p>

        <div className="relative max-w-lg mx-auto mt-8 shadow-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveCategory("All"); }}
            placeholder="Search questions…"
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-base font-medium"
          />
        </div>
      </div>

      {/* Quick-start guide cards */}
      {!search && activeCategory === "All" && (
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: <GraduationCap size={24} />,
              title: "Students: Quick Start",
              steps: ["Sign up and wait for identity verification (≤24h)", "Upload your resume — skills are extracted automatically", "Browse AI-matched jobs and apply with one click", "Track your applications under My Applications"],
              color: "bg-blue-600",
              shadow: "shadow-blue-200",
            },
            {
              icon: <Building size={24} />,
              title: "Employers: Quick Start",
              steps: ["Sign up and wait for company verification (≤24h)", "Go to Employer Suite → Post New Role", "Job goes to admin review; once approved it goes live", "Review AI-ranked candidates in Pending Review tab"],
              color: "bg-indigo-600",
              shadow: "shadow-indigo-200",
            },
            {
              icon: <Bot size={24} />,
              title: "Getting Better Matches",
              steps: ["Fill in all profile fields (university, degree, GPA)", "Upload a skills-rich PDF resume for best parsing", "Required skills shown in green = strong match", "Recompute matches after updating your resume"],
              color: "bg-emerald-600",
              shadow: "shadow-emerald-200",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className={`${card.color} p-5 text-white shadow-lg ${card.shadow}`}>
                <div className="flex items-center gap-3">
                  {card.icon}
                  <h3 className="font-extrabold text-sm">{card.title}</h3>
                </div>
              </div>
              <ol className="p-5 space-y-2.5">
                {card.steps.map((step, j) => (
                  <li key={j} className="flex gap-3 text-sm text-slate-600 font-medium">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-black flex items-center justify-center mt-0.5">
                      {j + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </motion.div>
          ))}
        </div>
      )}

      {/* Category filter pills */}
      {!search && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                activeCategory === cat
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : `border ${CATEGORY_COLORS[cat] ?? "bg-white border-slate-200 text-slate-600"} hover:opacity-80`
              }`}
            >
              {cat !== "All" && CATEGORY_ICONS[cat]}
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* FAQ accordion */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-16 border border-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <HelpCircle size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No results for "{search}"</p>
          <button onClick={() => setSearch("")} className="mt-3 text-sm text-indigo-600 font-bold hover:underline">
            Clear search
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-700 mb-3">
              <span className={`p-1.5 rounded-lg border ${CATEGORY_COLORS[category] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                {CATEGORY_ICONS[category] ?? <HelpCircle size={16} />}
              </span>
              {category}
            </h2>
            <div className="space-y-2">
              {items.map((faq) => {
                const isOpen = expandedId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`bg-white rounded-2xl border transition-all ${isOpen ? "border-indigo-200 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <button
                      className="w-full flex items-center justify-between p-5 text-left gap-4"
                      onClick={() => setExpandedId(isOpen ? null : faq.id)}
                    >
                      <span className="font-bold text-slate-900 text-sm leading-snug">{faq.question}</span>
                      {isOpen
                        ? <ChevronUp size={18} className="text-indigo-500 flex-shrink-0" />
                        : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                      }
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-slate-600 text-sm leading-relaxed font-medium border-t border-slate-100 pt-4">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Contact CTA */}
      <div className="mt-12 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-8 text-white text-center shadow-xl shadow-indigo-200">
        <MessageCircle size={32} className="mx-auto mb-4 text-indigo-200" />
        <h3 className="text-xl font-extrabold mb-2">Still have a question?</h3>
        <p className="text-indigo-200 font-medium mb-6 max-w-sm mx-auto">
          Can't find the answer? Reach out directly and our admin team will respond.
        </p>
        <Link
          to="/contact-admin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-md"
        >
          <MessageCircle size={18} /> Contact Admin
        </Link>
      </div>
    </div>
  );
}

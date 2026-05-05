import { Search, HelpCircle, Book, MessageCircle, FileText } from "lucide-react";

export function HelpCenter() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">How can we help?</h1>
        <div className="relative max-w-xl mx-auto shadow-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for articles, guides, and FAQs..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-lg"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { icon: Book, title: "Getting Started", desc: "Guides for new students and employers." },
          { icon: Bot, title: "AI Matching Logic", desc: "Understand how our NLP engine works." },
          { icon: FileText, title: "Resume Tips", desc: "Optimize your resume for the parser." },
          { icon: MessageCircle, title: "Account & Billing", desc: "Manage your subscription and profile." }
        ].map((category, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group">
            <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <category.icon size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{category.title}</h3>
            <p className="text-sm text-slate-500">{category.desc}</p>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <HelpCircle className="text-indigo-500" /> Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            { q: "How long does account verification take?", a: "Our Admin team typically reviews and verifies new student and employer accounts within 24 hours of submission." },
            { q: "What format should my resume be in?", a: "For the best AI parsing results, we strongly recommend uploading your resume as a standard PDF or DOCX file." },
            { q: "How is the Match Score calculated?", a: "The score is generated using Cosine Similarity, comparing the vectors of your extracted skills against the employer's job description keywords." },
            { q: "Is the platform really free for students?", a: "Yes! GradMatch AI is 100% free for students forever. We charge employers for advanced hiring tools." }
          ].map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">{faq.q}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Bot icon import was missing above, defining a fallback icon for the array
import { Bot } from "lucide-react";

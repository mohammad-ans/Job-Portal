import { Mail, Phone, MapPin, Send } from "lucide-react";

export function ContactAdmin() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Contact Admin</h1>
        <p className="text-lg text-slate-600">Need help with verification, enterprise plans, or technical support? Reach out to our team.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Get in Touch</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Email</p>
                  <p className="text-slate-500">support@gradmatch.ai</p>
                  <p className="text-slate-500">enterprise@gradmatch.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Phone</p>
                  <p className="text-slate-500">+1 (555) 123-4567</p>
                  <p className="text-xs text-slate-400 mt-1">Mon-Fri, 9am - 5pm EST</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Office</p>
                  <p className="text-slate-500">123 Tech Boulevard, Suite 400</p>
                  <p className="text-slate-500">San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700">
                <option>Account Verification</option>
                <option>Technical Support</option>
                <option>Enterprise Sales</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
              <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="How can we help you?"></textarea>
            </div>
            <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

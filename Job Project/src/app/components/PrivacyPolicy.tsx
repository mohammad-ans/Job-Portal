export function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 prose prose-slate">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>
      <p className="text-sm text-slate-500 uppercase tracking-wider mb-12">Last Updated: April 2026</p>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          When you use GradMatch AI, we collect information that you provide directly to us. For students, this includes your name, contact information, educational background, and resume data. For employers, this includes company details, job descriptions, and recruiter contact information.
        </p>
        <p className="text-slate-600 leading-relaxed">
          Our AI parser extracts specific data points from uploaded resumes to facilitate the matching process. We do not use this data for any purpose other than matching you with relevant opportunities.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
        <p className="text-slate-600 leading-relaxed mb-4">We use the information we collect to:</p>
        <ul className="list-disc pl-6 text-slate-600 space-y-2">
          <li>Operate, maintain, and improve the GradMatch AI platform.</li>
          <li>Power our Bidirectional Matching Engine using NLP algorithms.</li>
          <li>Communicate with you regarding your account, matches, and system updates.</li>
          <li>Ensure platform security and prevent fraudulent accounts via the Admin Console.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Data Security & Sharing</h2>
        <p className="text-slate-600 leading-relaxed">
          We take the security of your data seriously. Resumes are processed in an encrypted environment. We only share student profiles with verified employers when a high-confidence match is established or when a student explicitly applies for a role.
        </p>
      </section>
    </div>
  );
}

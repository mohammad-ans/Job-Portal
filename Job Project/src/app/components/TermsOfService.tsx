export function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 prose prose-slate">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Terms of Service</h1>
      <p className="text-sm text-slate-500 uppercase tracking-wider mb-12">Last Updated: April 2026</p>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
        <p className="text-slate-600 leading-relaxed">
          By accessing or using the GradMatch AI platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. User Accounts & Verification</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          All accounts, both student and employer, are subject to verification by our Admin team. We reserve the right to suspend or terminate accounts that provide false information, violate our usage policies, or attempt to game the matching algorithms.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Platform Usage</h2>
        <p className="text-slate-600 leading-relaxed">
          The Bidirectional Matching Engine is provided "as is". While we strive for 98%+ accuracy, we do not guarantee employment for students or successful hires for employers. Users must not scrape data, reverse-engineer the NLP algorithms, or use the platform for unauthorized commercial purposes.
        </p>
      </section>
    </div>
  );
}

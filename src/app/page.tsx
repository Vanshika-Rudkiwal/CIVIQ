import Link from 'next/link';

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#fffde7]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2d52c8] rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="font-black text-[#2d52c8] text-xl tracking-tight">CIVIQ</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-[#2d52c8] font-semibold hover:bg-blue-50 rounded-lg transition-colors">
            Log in
          </Link>
          <Link href="/register" className="px-4 py-2 bg-[#2d52c8] text-white font-semibold rounded-lg hover:bg-[#1a3399] transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-[#ee8620] text-white text-sm font-bold px-4 py-1.5 rounded-full mb-6">
          HackArena 2.0 — Team AETHERA, IGDTUW
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-[#1a1a3a] leading-tight mb-6">
          Stop Missing.<br />
          <span className="text-[#2d52c8]">Start Claiming.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          16,000+ government schemes exist. Most students never claim them. CIVIQ tells you exactly what you qualify for — and what to do next.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/register"
            className="px-8 py-4 bg-[#2d52c8] text-white font-bold text-lg rounded-xl hover:bg-[#1a3399] transition-colors shadow-lg"
          >
            Find my schemes →
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-[#2d52c8] font-bold text-lg rounded-xl border-2 border-[#2d52c8] hover:bg-blue-50 transition-colors"
          >
            Log in
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { num: '30+', label: 'Verified Schemes' },
            { num: '~8 min', label: 'vs. 45 min search' },
            { num: '4 Cr+', label: 'Students underserved' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-black text-[#2d52c8]">{stat.num}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-[#1a1a3a] mb-12">
            6 stages. One conversation. One action plan.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { stage: '1', title: 'Intake', desc: 'Tell CIVIQ about yourself in plain language' },
              { stage: '2', title: 'Clarify', desc: 'We ask only for what\'s missing' },
              { stage: '3', title: 'Match', desc: 'Top schemes with plain-language reasoning' },
              { stage: '4', title: 'Conflict check', desc: 'Flags schemes you can\'t claim together' },
              { stage: '5', title: 'Effort score', desc: '🟢 Easy to 🔴 Hard — you decide what to apply for' },
              { stage: '6', title: 'Action plan', desc: 'Download your personalised PDF guide' },
            ].map(s => (
              <div key={s.stage} className="bg-[#fffde7] rounded-xl p-4 border border-yellow-200">
                <div className="w-8 h-8 bg-[#2d52c8] text-white rounded-lg flex items-center justify-center font-black text-sm mb-3">
                  {s.stage}
                </div>
                <div className="font-bold text-[#1a1a3a] mb-1">{s.title}</div>
                <div className="text-sm text-gray-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PwD callout */}
      <section className="bg-[#2d52c8] py-12">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <div className="text-3xl mb-4">♿</div>
          <h2 className="text-2xl font-black mb-3">Voice-first. Zero navigation burden.</h2>
          <p className="text-blue-100">
            CIVIQ is built for PwD students. Speak your profile. Hear your results. Download your action plan. No complex portals to navigate.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a3a] text-gray-400 py-8 text-center text-sm">
        <p className="font-bold text-white mb-1">CIVIQ</p>
        <p>Team AETHERA — Vanshika, Saumya, Radha Yadav, Safa Fatima — IGDTUW</p>
        <p className="mt-2">Advisory only. Verify at official government portals before applying.</p>
      </footer>
    </main>
  );
}

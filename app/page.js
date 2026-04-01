'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FEATURES = [
  { icon: '🌡️', title: 'HVAC', desc: 'Filter changes, tune-ups, ductwork inspections, CO detector tests, and more.' },
  { icon: '🔥', title: 'Water Heater', desc: 'T&P valve tests, sediment flushes, anode rod checks — extend its life.' },
  { icon: '🏊', title: 'Pool', desc: 'Water chemistry, filter cleaning, shock schedules, and seasonal openings.' },
  { icon: '🔧', title: 'Plumbing', desc: 'Shut-off valve exercise, leak checks, flappers, hoses, sump pump tests.' },
  { icon: '⚡', title: 'Electrical', desc: 'GFCI tests, smoke detectors, breaker panel checks, surge protectors.' },
  { icon: '🪣', title: 'Septic System', desc: 'Tank pumping schedules, drain field monitoring, baffle inspections.' },
  { icon: '🏠', title: 'Roof & Gutters', desc: 'Gutter cleaning, shingle inspections, flashing checks, moss treatment.' },
  { icon: '🧺', title: 'Appliances', desc: 'Dryer vent cleaning, fridge coils, dishwasher filters, washer maintenance.' },
  { icon: '🛡️', title: 'Exterior', desc: 'Foundation cracks, grading, siding, deck care, caulking, drainage.' },
  { icon: '🚗', title: 'Garage Door', desc: 'Lubrication, safety sensor tests, spring inspections, balance checks.' },
  { icon: '💧', title: 'Irrigation', desc: 'Sprinkler startup/winterization, head checks, controller scheduling, leak detection.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '', password: '' });
  const [mode, setMode] = useState('signup'); // signup | login
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        router.push('/dashboard');
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="bg-fw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-fw-red rounded-lg flex items-center justify-center text-white font-bold text-lg">
              FW
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Four Winds</h1>
              <p className="text-xs text-blue-200 -mt-0.5">Home CMMS</p>
            </div>
          </div>
          <a
            href="https://fourwindscmms.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-200 hover:text-white transition"
          >
            fourwindscmms.com →
          </a>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="bg-gradient-to-b from-fw-navy to-fw-navy-dark text-white py-16 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Your Home Deserves<br />a Maintenance Plan
              </h2>
              <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                Stop guessing when your HVAC filter was last changed or when the pool needs its next shock treatment.
                Four Winds Home CMMS keeps every system in your home on a clear, automated maintenance schedule.
              </p>
              <div className="flex gap-3 text-sm">
                <span className="bg-white/10 px-3 py-1.5 rounded-full">Free forever</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full">No credit card</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full">Pre-loaded schedules</span>
              </div>
            </div>

            {/* Signup form */}
            <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-8">
              <h3 className="text-xl font-bold mb-1">
                {mode === 'signup' ? 'Get Started Free' : 'Welcome Back'}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {mode === 'signup'
                  ? 'Create your account and start tracking maintenance in 30 seconds.'
                  : 'Enter your email to sign back in.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                          placeholder="Robert"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                          placeholder="Donnell"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                        placeholder="Optional"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                    placeholder={mode === 'signup' ? '6 characters minimum' : 'Enter your password'}
                  />
                </div>

                {mode === 'login' && (
                  <div className="text-right -mt-2">
                    <a href="/forgot-password" className="text-sm text-fw-navy hover:underline">
                      Forgot password?
                    </a>
                  </div>
                )}

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-fw-navy text-white py-3 rounded-lg font-semibold hover:bg-fw-navy-dark transition disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : mode === 'signup' ? 'Create My Account' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                {mode === 'signup' ? (
                  <>Already have an account?{' '}
                    <button onClick={() => setMode('login')} className="text-fw-navy font-medium hover:underline">
                      Sign in
                    </button>
                  </>
                ) : (
                  <>Need an account?{' '}
                    <button onClick={() => setMode('signup')} className="text-fw-navy font-medium hover:underline">
                      Sign up free
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">11 Systems. One Dashboard.</h3>
            <p className="text-gray-500 text-center mb-10">Pre-loaded with expert maintenance schedules for every major home system. Add your own anytime.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="border border-gray-100 rounded-xl p-5 hover:shadow-lg transition text-center">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">{f.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 px-6 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              See what a real CMMS can do for your business
            </h3>
            <p className="text-gray-600 mb-6">
              This free home version is just a taste. Four Winds CMMS offers enterprise-grade maintenance management
              for facilities, fleets, manufacturing, and more.
            </p>
            <a
              href="https://fourwindscmms.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-fw-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-fw-red-dark transition"
            >
              Explore Four Winds CMMS →
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-fw-navy text-blue-200 py-6 px-6 text-center text-sm">
        <p>© {new Date().getFullYear()} Four Winds CMMS · Home Edition · A free tool by{' '}
          <a href="https://p5marketing.com" className="text-white hover:underline" target="_blank" rel="noopener noreferrer">
            P5 Marketing
          </a>
        </p>
      </footer>
    </div>
  );
}

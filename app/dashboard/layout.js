'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const ALL_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'HVAC', href: '/dashboard/hvac', icon: '🌡️', slug: 'hvac', categoryId: 1 },
  { label: 'Water Heater', href: '/dashboard/water-heater', icon: '🔥', slug: 'water-heater', categoryId: 2 },
  { label: 'Pool', href: '/dashboard/pool', icon: '🏊', slug: 'pool', categoryId: 3 },
  { label: 'Plumbing', href: '/dashboard/plumbing', icon: '🔧', slug: 'plumbing', categoryId: 4 },
  { label: 'Electrical', href: '/dashboard/electrical', icon: '⚡', slug: 'electrical', categoryId: 5 },
  { label: 'Septic System', href: '/dashboard/septic', icon: '🪣', slug: 'septic', categoryId: 6 },
  { label: 'Roof & Gutters', href: '/dashboard/roof-gutters', icon: '🏠', slug: 'roof-gutters', categoryId: 7 },
  { label: 'Appliances', href: '/dashboard/appliances', icon: '🧺', slug: 'appliances', categoryId: 8 },
  { label: 'Exterior', href: '/dashboard/exterior', icon: '🛡️', slug: 'exterior', categoryId: 9 },
  { label: 'Garage Door', href: '/dashboard/garage-door', icon: '🚗', slug: 'garage-door', categoryId: 10 },
  { label: 'Irrigation', href: '/dashboard/irrigation', icon: '💧', slug: 'irrigation', categoryId: 11 },
  { label: 'Honey-Do List', href: '/dashboard/honey-do', icon: '🍯' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navItems, setNavItems] = useState(ALL_NAV_ITEMS);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) router.push('/');
        else setUser(data.user);
      });
  }, [router]);

  useEffect(() => {
    fetch('/api/settings/categories')
      .then((r) => r.json())
      .then((data) => {
        const categories = data.categories || [];
        const enabledSlugs = new Set(
          categories.filter((c) => c.enabled).map((c) => c.slug)
        );
        const filtered = ALL_NAV_ITEMS.filter((item) => {
          if (!item.slug) return true; // Dashboard, Settings always show
          return enabledSlugs.has(item.slug);
        });
        setNavItems(filtered);
      })
      .catch(() => {}); // fail silently, show all items
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-fw-navy text-white transform transition-transform duration-200 lg:translate-x-0 lg:static lg:flex lg:flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-fw-red rounded-lg flex items-center justify-center text-white font-bold text-sm">
              FW
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">Four Winds</div>
              <div className="text-xs text-blue-200">Home CMMS</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-sm text-blue-200 mb-2">Hi, {user.firstName}!</div>
          <button
            onClick={handleLogout}
            className="text-xs text-blue-300 hover:text-white transition"
          >
            Sign out
          </button>
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-blue-200 mb-1">Want more?</p>
            <a
              href="https://fourwindscmms.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-fw-red hover:text-red-300 font-medium"
            >
              See the full CMMS →
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

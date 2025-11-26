"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Voice Navigation' },
    { href: '/locations', label: 'Locations' },
    { href: '/phrases', label: 'Magic Phrases' },
  ];

  return (
    <div className="min-h-screen">
      <nav className="glass-panel border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold text-emerald-300">
                VESNS
              </Link>
            </div>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}


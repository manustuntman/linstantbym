'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Accueil', href: '/', icon: '✨' },
    { name: 'Rendez-vous', href: '/appointments', icon: '📅' },
    { name: 'Profil', href: '/profile', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-around w-full max-w-sm px-6 py-3.5 bg-white/90 backdrop-blur-md border border-amber-500/20 rounded-full shadow-[0_10px_30px_rgba(217,119,6,0.1)] transition-all">
        {navItems.Item ? null : navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                isActive
                  ? 'text-amber-600 scale-105 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

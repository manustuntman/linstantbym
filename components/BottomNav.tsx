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
      <nav className="pointer-events-auto flex items-center justify-around w-full max-w-sm px-6 py-3 bg-white border border-amber-200 rounded-full shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-all ${
                isActive
                  ? 'text-amber-600 font-semibold scale-105'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
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

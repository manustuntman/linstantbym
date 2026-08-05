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
      {/* Ajout de classes pour forcer le flou et une meilleure transparence */}
      <nav className="pointer-events-auto flex items-center justify-around w-full max-w-sm px-6 py-3 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-[12px] border border-white/20 dark:border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 scale-105'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] font-medium tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

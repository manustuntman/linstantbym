'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  // Ton arborescence sur-mesure
  const navItems = [
    {
      name: 'Accueil',
      href: '/',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Réserver',
      href: '/book',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Profil',
      href: '/profile',
      isCenter: true, // Ceci indique que c'est le bouton central spécial
    },
    {
      name: 'Mes RDV',
      href: '/appointments',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-t border-[#D4AF37]/20 pb-6 pt-2 px-2 shadow-[0_-10px_40px_rgba(212,175,55,0.08)]">
      <nav className="flex items-end justify-between max-w-md mx-auto relative px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          // Rendu spécifique pour le bouton central (Profil)
          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative -top-5 flex flex-col items-center justify-center group z-50"
              >
                {/* L'ombre et l'anneau externe */}
                <div className="w-16 h-16 bg-[#FDFBF7] rounded-full p-1.5 shadow-[0_8px_25px_rgba(212,175,55,0.25)]">
                  {/* Le cercle intérieur prêt pour l'image */}
                  <div className={`w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-[#D4AF37]' : 'border-[#D4AF37]/40 group-hover:border-[#D4AF37]'}`}>
                    
                    {/* Icône par défaut en attendant la photo de profil */}
                    <svg className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-gray-300 group-hover:text-[#D4AF37]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    
                  </div>
                </div>
                <span className={`text-[10px] uppercase font-semibold tracking-wider mt-1.5 transition-colors duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                  {item.name}
                </span>
              </Link>
            );
          }

          // Rendu pour les autres boutons
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-[18%] transition-all duration-300 ${
                isActive
                  ? 'text-[#D4AF37]'
                  : 'text-gray-400 hover:text-[#D4AF37]/70'
              }`}
            >
              <div className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {item.icon}
              </div>
              <span className={`text-[8.5px] uppercase tracking-wider font-medium text-center ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

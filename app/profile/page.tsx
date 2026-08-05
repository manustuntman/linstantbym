'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfileAndData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);

      // 1. Récupérer les infos du profil (nom, téléphone)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) setProfile(profileData);

      // 2. Récupérer le PROCHAIN rendez-vous à venir (date supérieure à aujourd'hui)
      const now = new Date().toISOString();
      const { data: apptData } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          services (title, price, duration_minutes)
        `)
        .eq('user_id', session.user.id)
        .gte('appointment_date', now)
        .order('appointment_date', { ascending: true })
        .limit(1)
        .single(); // On ne prend que le tout premier à venir

      if (apptData) setNextAppointment(apptData);
      
      setLoading(false);
    }

    fetchProfileAndData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center pt-32">
        <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Formatage de la date du prochain rdv
  let formattedDate = '';
  let formattedTime = '';
  if (nextAppointment) {
    const d = new Date(nextAppointment.appointment_date);
    formattedDate = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    formattedTime = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  // Création des initiales pour l'avatar
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) 
    : '?';

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-gray-900 px-4 pt-10 pb-32 flex flex-col items-center relative overflow-hidden">
      
      {/* Effet de lumière douce (Glow) */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[150%] max-w-[600px] h-[400px] bg-[#D4AF37]/10 blur-[90px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* En-tête / Bouton déconnexion discret */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
          >
            Déconnexion
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Section Profil Principal */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-[#D4AF37]/10 flex flex-col items-center text-center relative overflow-hidden mb-8">
          
          {/* Avatar avec anneau doré */}
          <div className="relative mb-4 group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-[#FDF8ED] border-2 border-[#D4AF37]/30 flex items-center justify-center shadow-inner overflow-hidden relative">
              {/* Le jour où on ajoute la photo, c'est ici qu'elle ira */}
              <span className="text-2xl font-light text-[#D4AF37] tracking-widest">
                {initials}
              </span>
            </div>
            {/* Petit badge pour modifier la photo plus tard */}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full border border-gray-100 shadow-md flex items-center justify-center text-gray-400 hover:text-[#D4AF37] transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-medium text-gray-900 mb-1">{profile?.full_name || 'Non renseigné'}</h2>
          
          <div className="flex flex-col gap-1.5 mt-4 w-full">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-[#D4AF37]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {profile?.phone || 'Numéro non renseigné'}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-[#D4AF37]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Section Prochain Rendez-vous */}
        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4 pl-2">
          Mon prochain rendez-vous
        </h3>

        {nextAppointment ? (
          <div className="bg-gradient-to-br from-[#c29e31] to-[#D4AF37] p-1 rounded-3xl shadow-[0_8px_25px_rgba(212,175,55,0.25)]">
            <div className="bg-[#FDFBF7] rounded-[22px] p-5 h-full relative overflow-hidden">
              {/* Filigrane discret en fond */}
              <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-[#D4AF37]/5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest mb-1">
                      Confirmé
                    </span>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {formattedDate}
                    </p>
                    <p className="text-2xl font-light text-gray-900 mt-0.5">
                      {formattedTime}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#FDF8ED] rounded-2xl flex items-center justify-center text-[#D4AF37]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="font-medium text-gray-800">{nextAppointment.services?.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {nextAppointment.services?.duration_minutes} min
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {nextAppointment.services?.price} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-[#D4AF37]/30 rounded-3xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-[#FDF8ED] rounded-full flex items-center justify-center mx-auto mb-3 text-[#D4AF37]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-4">Aucun rendez-vous à venir.</p>
            <Link
              href="/book"
              className="inline-block px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#D4AF37] hover:bg-[#c29e31] rounded-xl transition-colors shadow-md"
            >
              Réserver une pose
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      // Vérifier si l'utilisateur est admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        // Si pas admin, on redirige vers l'accueil
        router.push('/');
        return;
      }

      // Récupérer tous les rendez-vous à venir avec les infos de la cliente
      const now = new Date().toISOString();
      const { data: appts, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          services (title, price, duration_minutes),
          profiles (full_name, phone)
        `)
        .gte('appointment_date', now)
        .order('appointment_date', { ascending: true });

      if (fetchError) {
        setError("Impossible de charger le planning.");
        console.error(fetchError);
      } else if (appts) {
        setAppointments(appts);
      }
      setLoading(false);
    }

    checkAdminAndFetch();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center pt-32">
        <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-gray-900 px-4 pt-10 pb-32 flex flex-col items-center relative overflow-hidden">
      
      {/* Effet de lumière douce */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[150%] max-w-[600px] h-[400px] bg-[#D4AF37]/10 blur-[90px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.15em] uppercase text-gray-900 mb-2">
            Espace Pro
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-6 bg-[#D4AF37]/40"></div>
            <p className="text-[10px] text-gray-500 tracking-[0.15em] uppercase">
              Planning des réservations
            </p>
            <div className="h-[1px] w-6 bg-[#D4AF37]/40"></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-white border border-dashed border-[#D4AF37]/30 rounded-3xl p-10 text-center shadow-sm">
              <p className="text-sm text-gray-500">Aucun rendez-vous à venir pour le moment.</p>
            </div>
          ) : (
            appointments.map((appt) => {
              const d = new Date(appt.appointment_date);
              const formattedDate = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
              const formattedTime = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={appt.id} className="bg-white p-5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-[#D4AF37]/20 flex flex-col md:flex-row justify-between gap-4">
                  
                  {/* Info Date & Prestation */}
                  <div className="flex items-start gap-4">
                    <div className="bg-[#FDF8ED] border border-[#D4AF37]/30 rounded-xl p-3 text-center min-w-[70px]">
                      <span className="block text-[10px] uppercase text-[#D4AF37] font-bold tracking-wider mb-0.5">
                        {formattedDate.split(' ')[0]}
                      </span>
                      <span className="block text-xl font-light text-gray-900 leading-none mb-1">
                        {formattedDate.split(' ')[1]}
                      </span>
                      <span className="block text-xs font-semibold text-gray-700">
                        {formattedTime}
                      </span>
                    </div>

                    <div className="pt-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{appt.services?.title}</h3>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                        {appt.services?.duration_minutes} min • {appt.services?.price} €
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-green-100">
                        {appt.status}
                      </span>
                    </div>
                  </div>

                  {/* Info Cliente */}
                  <div className="pt-1 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 md:text-right flex flex-col md:items-end justify-center">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {appt.profiles?.full_name || 'Inconnu'}
                    </p>
                    <a href={`tel:${appt.profiles?.phone}`} className="text-xs text-gray-500 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {appt.profiles?.phone || 'Non renseigné'}
                    </a>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

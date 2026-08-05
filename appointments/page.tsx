'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAppointments() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }

      // Récupère les rendez-vous de l'utilisatrice avec les détails de la prestation liée
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          services (
            title,
            price,
            duration_minutes
          )
        `)
        .eq('user_id', session.user.id)
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error(error);
      } else if (data) {
        setAppointments(data);
      }
      setLoading(false);
    }

    fetchAppointments();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[70vh] text-zinc-400 text-sm">Chargement de vos rendez-vous...</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Mes Rendez-vous</h1>
        <Link
          href="/book"
          className="px-4 py-2 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm"
        >
          + Réserver
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white border border-zinc-100 rounded-3xl p-8">
          <p className="text-sm text-zinc-500 mb-4">Tu n'as aucun rendez-vous pour le moment.</p>
          <Link
            href="/book"
            className="inline-block px-6 py-3 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all"
          >
            Prendre un rendez-vous
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const dateObj = new Date(appt.appointment_date);
            const formattedDate = dateObj.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const formattedTime = dateObj.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={appt.id}
                className="bg-white border border-amber-100 rounded-3xl p-5 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 rounded-full mb-1">
                      {appt.status}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900">
                      {appt.services?.title}
                    </h3>
                  </div>
                  <span className="text-base font-bold text-amber-600">
                    {appt.services?.price} €
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-50 flex justify-between items-center text-xs text-zinc-500">
                  <span>📅 {formattedDate} à {formattedTime}</span>
                  <span>⏱️ {appt.services?.duration_minutes} min</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

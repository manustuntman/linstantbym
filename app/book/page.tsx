'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function BookPage() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndFetchServices() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      const { data, error } = await supabase.from('services').select('*');
      if (error) console.error(error);
      else if (data) setServices(data);
    }

    checkAuthAndFetchServices();
  }, [router]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !date || !time) {
      setError('Veuillez sélectionner une prestation, une date et une heure.');
      return;
    }

    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth');
      return;
    }

    const appointmentDateTime = `${date}T${time}:00Z`;

    const { error: insertError } = await supabase.from('appointments').insert({
      user_id: session.user.id,
      service_id: selectedService.id,
      appointment_date: appointmentDateTime,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      alert('Rendez-vous confirmé avec succès !');
      router.push('/appointments');
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Réserver une pose</h1>
      <p className="text-xs text-zinc-500 mb-6">Choisis ta prestation et ton créneau idéal.</p>

      {error && (
        <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleBooking} className="space-y-6">
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-2">1. Choisis ta prestation</label>
          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedService?.id === service.id
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-semibold text-zinc-900">{service.title}</h3>
                  <span className="text-sm font-bold text-amber-600">{service.price} €</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{service.description}</p>
                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium bg-zinc-100 text-zinc-600 rounded-md">
                  {service.duration_minutes} min
                </span>
              </div>
            ))}
          </div>
        </div>

        {selectedService && (
          <div className="space-y-4 pt-4 border-t border-zinc-100 animate-fadeIn">
            <label className="block text-xs font-medium text-zinc-700">2. Choisis la date et l'heure</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Heure</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-md shadow-amber-500/20"
            >
              {loading ? 'Validation en cours...' : 'Confirmer le rendez-vous'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

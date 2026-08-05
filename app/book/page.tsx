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
    <main className="min-h-screen bg-[#FDFBF7] text-black px-4 py-8 pb-28 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-light tracking-widest uppercase mb-1">Réserver</h1>
        <p className="text-xs text-gray-500 mb-6 tracking-wide">Choisis ta prestation et ton créneau idéal.</p>

        {error && (
          <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">1. Ta prestation</label>
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-5 rounded-2xl shadow-sm border transition-all cursor-pointer ${
                    selectedService?.id === service.id
                      ? 'border-[#D4AF37] bg-[#FDF8ED]'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-800">{service.title}</h4>
                    <span className="text-lg font-semibold text-gray-900">{service.price} €</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                  <span className="inline-block mt-2 text-xs font-medium text-[#D4AF37] bg-[#FDF8ED] px-2.5 py-1 rounded-full">
                    {service.duration_minutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>

          {selectedService && (
            <div className="space-y-4 pt-6 mt-6 border-t border-gray-200 animate-fadeIn">
              <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">2. Date et heure</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Heure</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D4AF37] text-white font-medium py-4 px-6 mt-4 rounded-2xl shadow-md hover:bg-[#c29e31] transition duration-200 text-center tracking-wide"
              >
                {loading ? 'Validation en cours...' : 'CONFIRMER LE RENDEZ-VOUS'}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

type Service = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  duration_minutes: number;
};

export default function BookPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'Pose complète' | 'Remplissage'>('Pose complète');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
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
      if (error) {
        console.error(error);
      } else if (data) {
        setServices(data);
      }
      setLoadingServices(false);
    }

    checkAuthAndFetchServices();
  }, [router]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !date || !time) {
      setError('Veuillez sélectionner une prestation, une date et une heure.');
      return;
    }

    setLoadingSubmit(true);
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
      setLoadingSubmit(false);
    } else {
      router.push('/appointments');
      router.refresh();
    }
  };

  // Filtrer les services en fonction de l'onglet actif
  const filteredServices = services.filter((s) => s.category === activeTab);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-gray-900 px-4 pt-10 pb-32 flex flex-col items-center relative overflow-hidden">
      
      {/* Effet de lumière douce (Glow) */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[150%] max-w-[600px] h-[400px] bg-[#D4AF37]/15 blur-[90px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase text-gray-900 mb-2">
          Réservation
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-[1px] w-6 bg-[#D4AF37]/40"></div>
          <p className="text-xs text-gray-500 tracking-[0.15em] uppercase">
            Ton moment à toi
          </p>
          <div className="h-[1px] w-6 bg-[#D4AF37]/40"></div>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {error && (
          <div className="mb-6 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Système d'onglets (Toggle) */}
        <div className="flex bg-white/70 backdrop-blur-md p-1.5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-[#D4AF37]/20 mb-8 relative">
          <button
            onClick={() => {
              setActiveTab('Pose complète');
              setSelectedService(null); // On réinitialise le choix si on change d'onglet
            }}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-300 ${
              activeTab === 'Pose complète'
                ? 'bg-[#D4AF37] text-white shadow-md'
                : 'text-gray-400 hover:text-[#D4AF37]'
            }`}
          >
            Première Pose
          </button>
          <button
            onClick={() => {
              setActiveTab('Remplissage');
              setSelectedService(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-300 ${
              activeTab === 'Remplissage'
                ? 'bg-[#D4AF37] text-white shadow-md'
                : 'text-gray-400 hover:text-[#D4AF37]'
            }`}
          >
            Remplissage
          </button>
        </div>

        <form onSubmit={handleBooking} className="space-y-8">
          
          {/* Liste des prestations filtrées */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4 pl-1">
              1. Choisis ta prestation
            </h3>
            
            {loadingServices ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`group relative bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-0.5 border ${
                      selectedService?.id === service.id
                        ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30 bg-[#FDF8ED]/50'
                        : 'border-gray-100 hover:border-[#D4AF37]/30 hover:shadow-[0_10px_30px_rgba(212,175,55,0.08)]'
                    }`}
                  >
                    {/* Liseré doré de sélection */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${
                      selectedService?.id === service.id ? 'bg-[#D4AF37] opacity-100' : 'bg-[#D4AF37] opacity-0 group-hover:opacity-50'
                    }`}></div>

                    <div className="flex justify-between items-start pl-2">
                      <div className="pr-3">
                        <h4 className={`text-sm font-semibold transition-colors duration-300 ${
                          selectedService?.id === service.id ? 'text-[#D4AF37]' : 'text-gray-900 group-hover:text-[#D4AF37]'
                        }`}>
                          {service.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-light text-gray-900">{service.price} €</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center pl-2">
                      <svg className="w-3.5 h-3.5 text-[#D4AF37] mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-[10px] font-medium text-gray-400 tracking-wide">
                        {service.duration_minutes} MIN
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Date et Heure (apparaît de façon fluide quand une prestation est cliquée) */}
          {selectedService && (
            <div className="pt-6 border-t border-[#D4AF37]/20 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4 pl-1">
                2. Ton Créneau Idéal
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm font-medium text-gray-700 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all cursor-pointer"
                  />
                </div>
                <div className="relative group">
                  <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Heure</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm font-medium text-gray-700 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Bouton de confirmation Premium */}
              <button
                type="submit"
                disabled={loadingSubmit}
                className="group relative flex items-center justify-center w-full bg-gradient-to-r from-[#c29e31] via-[#D4AF37] to-[#c29e31] text-white font-medium py-4.5 px-6 mt-8 rounded-2xl shadow-[0_8px_25px_rgba(212,175,55,0.3)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="tracking-[0.1em] text-xs uppercase relative z-10 py-1">
                  {loadingSubmit ? 'Validation en cours...' : 'Confirmer ma réservation'}
                </span>
                {!loadingSubmit && (
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

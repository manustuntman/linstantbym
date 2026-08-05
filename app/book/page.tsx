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
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Pose complète');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const TABS = ['Pose complète', 'Remplissage', 'Dépose'];

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      // Récupérer les services
      const { data: srvs } = await supabase.from('services').select('*');
      if (srvs) setServices(srvs);

      // Récupérer UNIQUEMENT les rendez-vous futurs pour calculer les disponibilités
      const now = new Date().toISOString();
      const { data: appts } = await supabase
        .from('appointments')
        .select('appointment_date, services(duration_minutes)')
        .gte('appointment_date', now)
        .neq('status', 'annulé'); // On ignore les annulés

      if (appts) setAllAppointments(appts);
      
      setLoadingServices(false);
    }

    fetchData();
  }, [router]);

  // Générer la liste des créneaux (de 09:00 à 18:00 toutes les 15 mins)
  const timeSlots = [];
  for (let h = 9; h <= 18; h++) {
    ['00', '15', '30', '45'].forEach(m => {
      if (h === 18 && m !== '00') return; // On s'arrête à 18h pile
      timeSlots.push(`${h.toString().padStart(2, '0')}:${m}`);
    });
  }

  // Transformer les rendez-vous existants en "blocs de temps indisponibles"
  const bookedBlocks = allAppointments.map(appt => {
    const start = new Date(appt.appointment_date);
    // Si c'est un créneau bloqué manuellement sans service, on bloque par défaut 30min
    const duration = appt.services?.duration_minutes || 30; 
    const end = new Date(start.getTime() + duration * 60000);
    return { start, end };
  });

  // Fonction pour vérifier si un créneau de temps est disponible
  const isSlotAvailable = (timeStr: string) => {
    if (!date || !selectedService) return false;
    
    const [year, month, day] = date.split('-').map(Number);
    const [h, m] = timeStr.split(':').map(Number);
    
    // Date de début du créneau potentiel (en heure locale)
    const slotStart = new Date(year, month - 1, day, h, m, 0, 0);
    // Date de fin du créneau potentiel
    const slotEnd = new Date(slotStart.getTime() + selectedService.duration_minutes * 60000);

    // Ne pas autoriser la réservation dans le passé si c'est aujourd'hui
    if (slotStart <= new Date()) return false;

    // Vérifier s'il y a un conflit avec un bloc existant
    const hasConflict = bookedBlocks.some(block => {
      // Il y a conflit si le créneau commence avant la fin d'un rdv ET finit après le début de ce rdv
      return (slotStart < block.end && slotEnd > block.start);
    });

    return !hasConflict;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !date || !time) {
      setError('Veuillez sélectionner un créneau disponible.');
      return;
    }

    setLoadingSubmit(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [year, month, day] = date.split('-').map(Number);
    const [h, m] = time.split(':').map(Number);
    
    // Conversion propre au format ISO (UTC) pour la base de données
    const appointmentDateTime = new Date(year, month - 1, day, h, m, 0, 0).toISOString();

    const { error: insertError } = await supabase.from('appointments').insert({
      user_id: session.user.id,
      service_id: selectedService.id,
      appointment_date: appointmentDateTime,
      status: 'confirmé'
    });

    if (insertError) {
      setError(insertError.message);
      setLoadingSubmit(false);
    } else {
      router.push('/appointments');
      router.refresh();
    }
  };

  const filteredServices = services.filter((s) => s.category === activeTab);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-gray-900 px-4 pt-10 pb-32 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[150%] max-w-[600px] h-[400px] bg-[#D4AF37]/15 blur-[90px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 text-center mb-8">
        <h1 className="text-3xl font-light tracking-[0.15em] uppercase text-gray-900 mb-2">
          Réservation
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-[1px] w-6 bg-[#D4AF37]/40"></div>
          <p className="text-[10px] text-gray-500 tracking-[0.15em] uppercase">Ton moment à toi</p>
          <div className="h-[1px] w-6 bg-[#D4AF37]/40"></div>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {error && (
          <div className="mb-6 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Système d'onglets */}
        <div className="flex gap-2 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-[#D4AF37]/20 mb-8 overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedService(null);
                setTime('');
              }}
              className={`flex-1 py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#D4AF37] text-white shadow-md'
                  : 'text-gray-400 hover:text-[#D4AF37]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleBooking} className="space-y-8">
          
          {/* Liste des prestations */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4 pl-1">
              1. Prestation
            </h3>
            
            {loadingServices ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`group relative bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 cursor-pointer overflow-hidden border ${
                      selectedService?.id === service.id
                        ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30 bg-[#FDF8ED]/50'
                        : 'border-gray-100 hover:border-[#D4AF37]/30'
                    }`}
                  >
                    <div className="flex justify-between items-start pl-1">
                      <div>
                        <h4 className={`text-sm font-semibold transition-colors duration-300 ${
                          selectedService?.id === service.id ? 'text-[#D4AF37]' : 'text-gray-900 group-hover:text-[#D4AF37]'
                        }`}>
                          {service.title}
                        </h4>
                        <span className="text-[10px] font-medium text-gray-400 mt-1 flex items-center">
                          ⏱ {service.duration_minutes} MIN
                        </span>
                      </div>
                      <span className="text-base font-light text-gray-900">{service.price} €</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grille Date et Heure Dynamique */}
          {selectedService && (
            <div className="pt-6 border-t border-[#D4AF37]/20 animate-in fade-in duration-500">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4 pl-1">
                2. Ton Créneau
              </h3>
              
              <div className="mb-4">
                <input
                  type="date"
                  required
                  value={date}
                  min={new Date().toISOString().split('T')[0]} // Interdit le passé
                  onChange={(e) => { setDate(e.target.value); setTime(''); }}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all cursor-pointer"
                />
              </div>

              {/* Affichage des créneaux si une date est choisie */}
              {date && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {timeSlots.map(timeStr => {
                    const available = isSlotAvailable(timeStr);
                    const isSelected = time === timeStr;

                    return (
                      <button
                        key={timeStr}
                        type="button"
                        disabled={!available}
                        onClick={() => setTime(timeStr)}
                        className={`py-2 text-[11px] font-semibold rounded-xl transition-all border ${
                          isSelected 
                            ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-md transform scale-105' 
                            : available 
                              ? 'bg-white text-gray-700 border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]' 
                              : 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed opacity-60'
                        }`}
                      >
                        {timeStr}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingSubmit || !time}
                className="group relative flex items-center justify-center w-full bg-gradient-to-r from-[#c29e31] via-[#D4AF37] to-[#c29e31] text-white font-medium py-4 px-6 mt-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="tracking-[0.1em] text-xs uppercase relative z-10 py-1">
                  {loadingSubmit ? 'Validation...' : 'Confirmer le rendez-vous'}
                </span>
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

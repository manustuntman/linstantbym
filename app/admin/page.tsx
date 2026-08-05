'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AdminDashboard() {
  const router = useRouter();
  
  // États des données
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États du calendrier
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // États des actions (Modales)
  const [showModal, setShowModal] = useState<'none' | 'add' | 'block'>('none');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Formulaire d'ajout
  const [formTime, setFormTime] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formServiceId, setFormServiceId] = useState('');
  const [formReason, setFormReason] = useState('Pause / Indisponible');

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  async function fetchData() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/auth');

    // Vérif Admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
    if (!profile?.is_admin) return router.push('/');

    // Récupérer les services pour le formulaire
    const { data: srvs } = await supabase.from('services').select('*');
    if (srvs) setServices(srvs);

    // Définir le début et la fin du mois affiché pour filtrer les RDVs
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data: appts } = await supabase
      .from('appointments')
      .select('*, services(title, price, duration_minutes), profiles(full_name, phone)')
      .gte('appointment_date', startOfMonth)
      .lte('appointment_date', endOfMonth)
      .order('appointment_date', { ascending: true });

    if (appts) setAppointments(appts);
    setLoading(false);
  }

  // --- ACTIONS BASE DE DONNÉES ---

  const handleCancel = async (id: string) => {
    if (!confirm('Es-tu sûre de vouloir annuler ce rendez-vous ?')) return;
    await supabase.from('appointments').update({ status: 'annulé' }).eq('id', id);
    fetchData();
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    
    // Formatage de la date sélectionnée + heure
    const dateString = selectedDate.toISOString().split('T')[0];
    const appointmentDateTime = `${dateString}T${formTime}:00Z`;

    await supabase.from('appointments').insert({
      client_name: formName,
      client_phone: formPhone,
      service_id: formServiceId,
      appointment_date: appointmentDateTime,
      status: 'confirmé'
    });

    closeModal();
    fetchData();
  };

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    
    const dateString = selectedDate.toISOString().split('T')[0];
    const appointmentDateTime = `${dateString}T${formTime}:00Z`;

    await supabase.from('appointments').insert({
      is_blocked: true,
      block_reason: formReason,
      appointment_date: appointmentDateTime,
      status: 'bloqué'
    });

    closeModal();
    fetchData();
  };

  const closeModal = () => {
    setShowModal('none');
    setActionLoading(false);
    setFormTime(''); setFormName(''); setFormPhone(''); setFormServiceId('');
  };

  // --- LOGIQUE DU CALENDRIER ---

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Ajustement car getDay() commence à dimanche (0). On veut lundi (1) en premier
  const emptyDaysStart = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // Filtrer les RDV pour le jour sélectionné
  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const dayAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.appointment_date).toISOString().split('T')[0];
    return apptDate === selectedDateString;
  });

  if (loading && appointments.length === 0) {
    return <div className="min-h-screen bg-[#FDFBF7] flex justify-center pt-32"><div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-gray-900 px-4 pt-8 pb-32 relative overflow-hidden">
      <div className="max-w-xl mx-auto relative z-10">
        
        {/* EN TÊTE */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-light tracking-widest uppercase text-gray-900">Espace Pro</h1>
            <p className="text-[11px] text-[#D4AF37] tracking-widest uppercase mt-1">Gestion du planning</p>
          </div>
        </div>

        {/* CALENDRIER */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#D4AF37]/10 mb-8">
          <div className="flex justify-between items-center mb-6 px-2">
            <button onClick={() => changeMonth(-1)} className="p-2 text-gray-400 hover:text-[#D4AF37] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-base font-semibold uppercase tracking-widest">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 text-gray-400 hover:text-[#D4AF37] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Jours vides au début du mois */}
            {Array.from({ length: emptyDaysStart }).map((_, i) => <div key={`empty-${i}`} />)}
            
            {/* Les jours du mois */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateOfCell = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dateString = dateOfCell.toISOString().split('T')[0];
              const isSelected = selectedDateString === dateString;
              const isToday = new Date().toISOString().split('T')[0] === dateString;
              
              // Y a-t-il des rdv ce jour là ?
              const dayAppts = appointments.filter(a => new Date(a.appointment_date).toISOString().split('T')[0] === dateString && a.status !== 'annulé');
              const hasAppt = dayAppts.some(a => !a.is_blocked);
              const hasBlock = dayAppts.some(a => a.is_blocked);

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDate(dateOfCell)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all duration-200 relative ${
                    isSelected ? 'bg-[#D4AF37] text-white shadow-md' : 
                    isToday ? 'border border-[#D4AF37]/50 text-[#D4AF37] font-bold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-sm">{day}</span>
                  <div className="flex gap-0.5 absolute bottom-1.5">
                    {hasAppt && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#D4AF37]'}`}></div>}
                    {hasBlock && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-gray-400'}`}></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DÉTAIL DE LA JOURNÉE CHOISIE */}
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-900">
            {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => setShowModal('block')} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] uppercase font-semibold hover:bg-gray-200 transition-colors">
              + Bloquer
            </button>
            <button onClick={() => setShowModal('add')} className="px-3 py-1.5 bg-[#D4AF37] text-white rounded-lg text-[10px] uppercase font-semibold shadow-sm hover:bg-[#c29e31] transition-colors">
              + RDV Manuel
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8 bg-white border border-dashed border-[#D4AF37]/30 rounded-2xl">
              <p className="text-xs text-gray-500">Aucun rendez-vous ce jour-là.</p>
            </div>
          ) : (
            dayAppointments.map((appt) => {
              const time = new Date(appt.appointment_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
              const isCanceled = appt.status === 'annulé';

              // RENDU D'UN CRÉNEAU BLOQUÉ
              if (appt.is_blocked) {
                return (
                  <div key={appt.id} className="flex bg-gray-50 rounded-2xl border border-gray-100 p-3 overflow-hidden">
                    <div className="w-16 flex-shrink-0 text-center border-r border-gray-200 pr-3 mr-3 py-1">
                      <span className="block text-sm font-bold text-gray-400">{time}</span>
                    </div>
                    <div className="flex-1 flex justify-between items-center py-1">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Indisponible</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">{appt.block_reason}</p>
                      </div>
                      <button onClick={() => handleCancel(appt.id)} className="text-[10px] text-red-400 hover:text-red-600 font-medium px-2 py-1">
                        Libérer
                      </button>
                    </div>
                  </div>
                );
              }

              // RENDU D'UN RENDEZ-VOUS NORMAL
              return (
                <div key={appt.id} className={`flex bg-white rounded-2xl border ${isCanceled ? 'border-red-100 opacity-60' : 'border-[#D4AF37]/20'} p-3 shadow-sm`}>
                  <div className="w-16 flex-shrink-0 text-center border-r border-gray-100 pr-3 mr-3 py-1 flex flex-col justify-center">
                    <span className={`block text-sm font-bold ${isCanceled ? 'text-red-400' : 'text-[#D4AF37]'}`}>{time}</span>
                    <span className="block text-[9px] text-gray-400 uppercase mt-0.5">{appt.services?.duration_minutes} min</span>
                  </div>
                  
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-semibold ${isCanceled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {appt.client_name || appt.profiles?.full_name || 'Inconnu'}
                      </h4>
                      {!isCanceled && (
                        <button onClick={() => handleCancel(appt.id)} className="text-[10px] text-red-500 hover:underline">Annuler</button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">{appt.services?.title}</p>
                    
                    {/* Numéro de tel cliquable pour appeler direct */}
                    <a href={`tel:${appt.client_phone || appt.profiles?.phone}`} className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-[#D4AF37] bg-[#FDF8ED] px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {appt.client_phone || appt.profiles?.phone || 'Pas de numéro'}
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* MODALES D'AJOUT ET DE BLOCAGE */}
      {showModal !== 'none' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <h2 className="text-lg font-light uppercase tracking-widest text-center mb-6">
              {showModal === 'add' ? 'Nouveau Rendez-vous' : 'Bloquer un créneau'}
            </h2>
            <p className="text-center text-xs text-[#D4AF37] uppercase tracking-wider mb-4 font-semibold">
              Pour le {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </p>

            {showModal === 'add' ? (
              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase text-gray-500 mb-1 pl-1">Heure</label>
                  <input type="time" required value={formTime} onChange={e => setFormTime(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-gray-500 mb-1 pl-1">Nom de la cliente</label>
                  <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: Julie (Instagram)" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-gray-500 mb-1 pl-1">Téléphone</label>
                  <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="06..." className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-gray-500 mb-1 pl-1">Prestation</label>
                  <select required value={formServiceId} onChange={e => setFormServiceId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none bg-white">
                    <option value="" disabled>Choisir une prestation</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={actionLoading} className="w-full py-3 bg-[#D4AF37] text-white rounded-xl text-sm font-semibold uppercase tracking-wider mt-2">
                  {actionLoading ? 'Validation...' : 'Ajouter au planning'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleBlockSlot} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase text-gray-500 mb-1 pl-1">Heure de début</label>
                  <input type="time" required value={formTime} onChange={e => setFormTime(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-gray-500 mb-1 pl-1">Motif (Optionnel)</label>
                  <input type="text" value={formReason} onChange={e => setFormReason(e.target.value)} placeholder="Ex: Pause déjeuner, RDV perso..." className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                </div>
                <button type="submit" disabled={actionLoading} className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-semibold uppercase tracking-wider mt-2">
                  {actionLoading ? 'Validation...' : 'Bloquer ce créneau'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </main>
  );
}

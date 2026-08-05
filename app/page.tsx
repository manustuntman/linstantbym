'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Service = {
  id: string
  title: string
  description: string
  price: number
  duration_minutes: number
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase.from('services').select('*')
      if (error) {
        console.error('Erreur lors du chargement des services:', error)
      } else {
        setServices(data || [])
      }
      setLoading(false)
    }

    fetchServices()
  }, [])

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-gray-900 flex flex-col items-center pb-32 relative overflow-hidden">
      
      {/* Effet de lumière douce en arrière-plan (Glow) */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[150%] max-w-[600px] h-[400px] bg-[#D4AF37]/10 blur-[80px] rounded-full pointer-events-none"></div>

      {/* En-tête / Logo */}
      <div className="w-full max-w-md text-center mt-12 mb-10 relative z-10 px-4">
        <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] uppercase text-gray-900 mb-2">
          L'instant
        </h1>
        <h2 className="text-3xl md:text-4xl font-serif italic text-[#D4AF37] mb-4">
          by M.
        </h2>
        <div className="flex items-center justify-center gap-3">
          <div className="h-[1px] w-8 bg-[#D4AF37]/40"></div>
          <p className="text-xs text-gray-500 tracking-[0.15em] uppercase">
            Extensions de cils
          </p>
          <div className="h-[1px] w-8 bg-[#D4AF37]/40"></div>
        </div>
      </div>

      {/* Bouton Call to Action Premium */}
      <div className="w-full max-w-md px-4 mb-12 relative z-10">
        <Link 
          href="/book" 
          className="group relative flex items-center justify-center w-full bg-gradient-to-r from-[#c29e31] via-[#D4AF37] to-[#c29e31] text-white font-medium py-4 px-6 rounded-2xl shadow-[0_8px_25px_rgba(212,175,55,0.3)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
        >
          {/* Effet de brillance animé au survol */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <span className="tracking-[0.1em] text-sm uppercase relative z-10">Prendre Rendez-vous</span>
          
          <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </Link>
      </div>

      {/* Section Prestations */}
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">
            La Carte
          </h3>
          <span className="text-[10px] font-medium text-[#D4AF37] tracking-widest uppercase bg-[#D4AF37]/10 px-3 py-1 rounded-full">
            Sur-mesure
          </span>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="group bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(212,175,55,0.08)] border border-gray-100 hover:border-[#D4AF37]/30 transition-all duration-300 flex flex-col justify-between relative overflow-hidden transform hover:-translate-y-0.5"
              >
                {/* Petit liseré doré sur le côté de la carte au survol */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-start w-full">
                  <div className="pr-4">
                    <h4 className="text-base font-medium text-gray-900 group-hover:text-[#D4AF37] transition-colors">
                      {service.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-light text-gray-900">{service.price} €</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center">
                  <svg className="w-3.5 h-3.5 text-[#D4AF37] mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-[11px] font-medium text-gray-400 tracking-wide">
                    {service.duration_minutes} MIN
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

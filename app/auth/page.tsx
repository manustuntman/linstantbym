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
    <main className="min-h-screen bg-[#FDFBF7] text-black p-6 flex flex-col items-center pb-28">
      <div className="w-full max-w-md text-center my-6">
        <h1 className="text-3xl font-light tracking-widest uppercase mb-1">L'instant</h1>
        <h2 className="text-xl font-normal italic text-[#D4AF37]">by M.</h2>
        <p className="text-xs text-gray-500 mt-2 tracking-wide">Parenthèse beauté & extensions de cils</p>
      </div>

      <div className="w-full max-w-md my-6">
        <Link 
          href="/book" 
          className="block w-full bg-[#D4AF37] text-white font-medium py-4 px-6 rounded-2xl shadow-md hover:bg-[#c29e31] transition duration-200 text-center tracking-wide"
        >
          PRENDRE RENDEZ-VOUS
        </Link>
      </div>

      <div className="w-full max-w-md mt-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Nos Prestations</h3>
        
        {loading ? (
          <p className="text-center text-gray-400 py-6">Chargement des prestations...</p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-medium text-gray-800">{service.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                  <span className="inline-block mt-2 text-xs font-medium text-[#D4AF37] bg-[#FDF8ED] px-2.5 py-1 rounded-full">
                    {service.duration_minutes} min
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900">{service.price} €</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User, Mail, Globe, Hash, Calendar, Settings } from 'lucide-react';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileData) {
        setProfile(profileData);
      }
      setLoading(false);
    };

    loadProfile();
  }, [supabase, router]);

  if (loading) {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">Cargando perfil...</div>;
  }

  if (!profile) return null;

  const dataCards = [
    { label: 'Nombre Completo', value: profile.full_name, icon: User },
    { label: 'Correo Electrónico', value: profile.email, icon: Mail },
    { label: 'Nacionalidad', value: profile.nationality, icon: Globe },
    { label: 'DNI / RUT', value: profile.document_id, icon: Hash },
    { label: 'Edad', value: `${profile.age} años`, icon: Calendar },
    { label: 'Género', value: profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1), icon: Settings },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <div className="w-20 h-20 bg-orange-300 rounded-full flex items-center justify-center shadow-md">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{profile.full_name}</h1>
            <p className="text-gray-500 text-lg">Miembro desde {new Date(profile.created_at).getFullYear()}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Información Personal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataCards.map((card, idx) => (
              <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <card.icon className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500 mb-1">{card.label}</span>
                  <span className="block text-gray-900 font-semibold">{card.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              Pronto podrás modificar estos datos y ver estadísticas avanzadas aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

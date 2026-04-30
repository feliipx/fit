'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Play, Flame } from 'lucide-react';
import { ContributionGraph } from '@/components/dashboard/ContributionGraph';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dashboard States
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [logDates, setLogDates] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  // Forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nationality, setNationality] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('hombre');

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSessionUser(session.user);
        
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) setProfile(profileData);

        // Fetch Logs
        const { data: logsData } = await supabase
          .from('workout_logs')
          .select('completed_at')
          .eq('user_id', session.user.id)
          .order('completed_at', { ascending: false });

        if (logsData) {
          const dates = logsData.map(log => log.completed_at);
          setLogDates(dates);
          calculateStreak(dates);
        }
      }
      setLoading(false);
    };
    
    loadDashboard();
  }, [supabase]);

  const calculateStreak = (dates: string[]) => {
    if (dates.length === 0) {
      setStreak(0);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const uniqueDates = new Set(
      dates.map((dateStr) => {
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );

    let currentStreak = 0;
    let checkDate = new Date(today);

    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    if (!uniqueDates.has(todayKey)) {
      checkDate.setDate(today.getDate() - 1);
      const yesterdayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (!uniqueDates.has(yesterdayKey)) {
        setStreak(0);
        return;
      }
    }

    while (true) {
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (uniqueDates.has(key)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.reload(); 
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              nationality,
              document_id: documentId,
              age: parseInt(age),
              gender,
            },
          },
        });
        if (error) throw error;
        alert('Registro exitoso. Revisa tu correo o inicia sesión.');
        setIsLogin(true);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Ocurrió un error');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center">Cargando...</div>;
  }

  if (sessionUser) {
    // Render Dashboard with symmetric layout
    return (
      <div className="min-h-[calc(100vh-64px)] bg-white">
        <main className="max-w-5xl mx-auto px-6 py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* ROW 1 */}
            <div className="md:col-span-2 flex flex-col justify-center">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
                Hola, {profile?.full_name?.split(' ')[0] || 'Usuario'} 👋
              </h1>
              <p className="text-lg text-gray-500">¿Listo para cuidar tu columna hoy?</p>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-orange-50 rounded-3xl p-6 flex items-center gap-6 h-full">
                <div className="w-14 h-14 bg-orange-300 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <Flame className="w-7 h-7 text-white fill-current" />
                </div>
                <div>
                  <span className="text-gray-600 font-medium block uppercase tracking-wider text-xs mb-1">Racha Actual</span>
                  <span className="text-3xl font-bold text-orange-400 tracking-tighter">{streak} días</span>
                </div>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="md:col-span-2 flex flex-col">
              <div className="h-full flex-1">
                <ContributionGraph logDates={logDates} createdAt={profile?.created_at} />
              </div>
            </div>

            <div className="md:col-span-1 flex flex-col">
              <div className="bg-gray-900 rounded-3xl p-8 flex flex-col items-start justify-center relative overflow-hidden shadow-xl h-full min-h-[300px]">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Tu Rutina</h3>
                <p className="text-gray-400 mb-8 relative z-10">Comienza tu sesión diaria de 15 minutos para contrarrestar el sedentarismo.</p>
                
                <button
                  onClick={() => router.push('/workout')}
                  className="w-full bg-orange-300 hover:bg-orange-400 text-white font-semibold text-lg px-8 py-4 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center gap-3 relative z-10"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Comenzar
                </button>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    );
  }

  // Render Auth
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
          Bienvenido
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tu salud de columna, en tus manos.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-50 py-8 px-4 shadow sm:rounded-3xl sm:px-10 border border-gray-100">
          
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                isLogin ? 'border-orange-300 text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Iniciar Sesión
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                !isLogin ? 'border-orange-300 text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Registrarse
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <div className="mt-1">
                    <input
                      required
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-300 focus:border-orange-300 sm:text-sm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nacionalidad</label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-300 focus:border-orange-300 sm:text-sm"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DNI / RUT</label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-300 focus:border-orange-300 sm:text-sm"
                        value={documentId}
                        onChange={(e) => setDocumentId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Edad</label>
                    <div className="mt-1">
                      <input
                        required
                        type="number"
                        min="1"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-300 focus:border-orange-300 sm:text-sm"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Género</label>
                    <div className="mt-1">
                      <select
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-orange-300 focus:border-orange-300 sm:text-sm"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="hombre">Hombre</option>
                        <option value="mujer">Mujer</option>
                        <option value="no binario">No Binario</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <div className="mt-1">
                <input
                  required
                  type="email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-300 focus:border-orange-300 sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="mt-1">
                <input
                  required
                  type="password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-300 focus:border-orange-300 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-500 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-300 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300 disabled:opacity-50 transition-colors"
              >
                {authLoading ? 'Cargando...' : isLogin ? 'Ingresar' : 'Crear cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

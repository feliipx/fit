'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Play, Flame } from 'lucide-react';
import { ContributionGraph } from '@/components/dashboard/ContributionGraph';

import { RoutineExplorer } from '@/components/dashboard/RoutineExplorer';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  type AuthMode = 'login' | 'register' | 'forgot_password';
  const [authMode, setAuthMode] = useState<AuthMode>('login');
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
    let isMounted = true;
    const loadDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          if (isMounted) setSessionUser(session.user);
          
          // Fetch Profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData && isMounted) setProfile(profileData);

          // Fetch Logs
          const { data: logsData } = await supabase
            .from('workout_logs')
            .select('completed_at')
            .eq('user_id', session.user.id)
            .order('completed_at', { ascending: false });

          if (logsData && isMounted) {
            const dates = logsData.map(log => log.completed_at);
            setLogDates(dates);
            calculateStreak(dates);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadDashboard();
    return () => { isMounted = false; };
  }, []); // Empty dependency array to prevent any re-render loops

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
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.reload(); 
      } else if (authMode === 'register') {
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
        setAuthMode('login');
      } else if (authMode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        alert('Se ha enviado un enlace a tu correo para restablecer tu contraseña.');
        setAuthMode('login');
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
    // Render Dashboard with vertical symmetric layout
    return (
      <div className="min-h-[calc(100vh-64px)] bg-white">
        <main className="max-w-5xl mx-auto px-6 py-12">
          
          <div className="flex flex-col gap-10">
            {/* ROW 1: Greeting + Racha */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
                  Hola, {profile?.full_name?.split(' ')[0] || 'Usuario'} 👋
                </h1>
                <p className="text-lg text-gray-500">¿Listo para cuidar tu columna hoy?</p>
              </div>
              
              <div className="bg-orange-50 border border-orange-100/50 rounded-[2rem] p-6 flex items-center gap-6 min-w-[280px]">
                <div className="w-14 h-14 bg-orange-400 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <Flame className="w-7 h-7 text-white fill-current" />
                </div>
                <div>
                  <span className="text-gray-500 font-bold block uppercase tracking-[0.1em] text-[10px] mb-1">RACHA ACTUAL</span>
                  <span className="text-3xl font-black text-orange-500 tracking-tighter">{streak} días</span>
                </div>
              </div>
            </div>

            {/* ROW 2: Routine Explorer (Dark Box) */}
            <RoutineExplorer />

            {/* ROW 3: Activity Graph */}
            <div className="h-full">
              <ContributionGraph logDates={logDates} createdAt={profile?.created_at} />
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
          
          <div className="flex border-b border-gray-200 mb-6 relative">
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                authMode === 'login' ? 'border-orange-300 text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setAuthMode('login')}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                authMode === 'register' ? 'border-orange-300 text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setAuthMode('register')}
            >
              Registrarse
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            {authMode === 'forgot_password' && (
              <div className="mb-6 text-sm text-gray-500 text-center">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </div>
            )}
            
            {authMode === 'register' && (
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

            {authMode !== 'forgot_password' && (
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
            )}

            {authMode === 'login' && (
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot_password')}
                    className="font-medium text-orange-400 hover:text-orange-500 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            )}
            
            {authMode === 'forgot_password' && (
              <div className="flex items-center justify-center">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Volver a iniciar sesión
                  </button>
                </div>
              </div>
            )}

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
                {authLoading ? 'Cargando...' : authMode === 'login' ? 'Ingresar' : authMode === 'register' ? 'Crear cuenta' : 'Restablecer contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

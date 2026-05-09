'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, Flame, User } from 'lucide-react';

export function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [sessionUser, setSessionUser] = useState<any>(null);
  const [streak, setStreak] = useState(0);

  // We listen to pathname changes to re-fetch session if needed, 
  // but usually it's handled on load.
  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isMounted) {
        setSessionUser(session.user);

        // Fetch logs for streak
        const { data: logsData } = await supabase
          .from('workout_logs')
          .select('completed_at')
          .eq('user_id', session.user.id)
          .order('completed_at', { ascending: false });

        if (logsData) {
          const dates = logsData.map(log => log.completed_at);
          calculateStreak(dates);
        }
      } else if (isMounted) {
        setSessionUser(null);
      }
    };

    loadSession();

    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && isMounted) {
        setSessionUser(session.user);
      } else if (isMounted) {
        setSessionUser(null);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [pathname, supabase]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    // Hard refresh to clear any cached state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight transition-transform hover:scale-105 active:scale-95">
          Club de los Sin Chances
        </Link>

        {sessionUser && (
          <div className="flex items-center gap-6">
            {!isHomePage && (
              <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                <Flame className="w-4 h-4 text-orange-400 fill-current" />
                <span className="text-sm font-bold text-orange-500">{streak} días</span>
              </div>
            )}

            <Link
              href="/profile"
              className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors text-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Mi Perfil</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 font-medium flex items-center gap-2 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

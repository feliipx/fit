'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, PauseCircle } from 'lucide-react';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { CircularTimer } from '../ui/CircularTimer';
import { TipsSidebar } from './TipsSidebar';

function getEmbedUrl(url?: string) {
  if (!url) return '';
  try {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    }
  } catch (e) {
    // Ignore parsing errors and return original
  }
  return url;
}

export function WorkoutEngine() {
  const router = useRouter();
  const supabase = createClient();
  const [hasLoggedWorkout, setHasLoggedWorkout] = useState(false);
  const {
    currentState,
    timeRemaining,
    routine,
    startWorkout,
    startCountdown,
    finishExercise,
    previousExercise,
    tickTimer,
    getCurrentExercise,
    getCurrentBlockName,
  } = useWorkoutStore();

  const exercise = getCurrentExercise();
  const blockName = getCurrentBlockName();

  // Handle the interval timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (['COUNTDOWN', 'ACTIVE', 'REST_SET', 'REST_BLOCK'].includes(currentState)) {
      // For 'reps' type exercise, we don't automatically tick down an active timer
      // wait, actually we do if we want a timeout, but standard is no timer for reps
      if (currentState === 'ACTIVE' && exercise?.type === 'reps') {
        // do nothing
      } else {
        interval = setInterval(() => {
          tickTimer();
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [currentState, exercise, tickTimer]);

  // Log workout when finished
  useEffect(() => {
    if (currentState === 'FINISHED' && !hasLoggedWorkout) {
      setHasLoggedWorkout(true);
      const logWorkout = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from('workout_logs').insert({ user_id: session.user.id });
        }
      };
      logWorkout();
    }
  }, [currentState, hasLoggedWorkout, supabase]);

  // Derived progress for timers
  const timerProgress = useMemo(() => {
    if (currentState === 'REST_SET') return (routine.restBetweenSets - timeRemaining) / routine.restBetweenSets;
    if (currentState === 'REST_BLOCK') return (routine.restBetweenBlocks - timeRemaining) / routine.restBetweenBlocks;
    if (currentState === 'ACTIVE' && exercise) return (exercise.duration - timeRemaining) / exercise.duration;
    return 0;
  }, [currentState, timeRemaining, routine, exercise]);

  // Derived milestones for the checklist
  const milestones = useMemo(() => {
    if (!exercise) return [];
    // We break the goal into parts if it has commas or periods, or just provide standard cues alongside it
    return [
      exercise.goal,
      'Espalda neutra',
      'Respiración fluida',
      'Hombros relajados'
    ];
  }, [exercise]);

  // Main UI render switch based on state
  const renderState = () => {
    switch (currentState) {
      case 'IDLE':
      case 'PREPARING':
        return (
          <motion.div
            key="preparing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-full max-w-2xl bg-gray-100 rounded-3xl aspect-video mb-8 flex items-center justify-center overflow-hidden relative shadow-sm">
              {routine.blocks[0]?.exercises[0]?.videoUrl ? (
                <iframe
                  src={getEmbedUrl(routine.blocks[0].exercises[0].videoUrl)}
                  title="Resumen"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <span className="text-gray-400 font-medium tracking-wide">Video Resumen</span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
              {routine.name}
            </h1>
            <p className="text-lg text-gray-500 mb-12 max-w-lg mx-auto">
              Diseñado para contrarrestar el sedentarismo y recuperar la movilidad natural de tu columna.
            </p>
            <button
              onClick={startCountdown}
              className="bg-orange-300 hover:bg-orange-400 text-white font-semibold text-lg px-10 py-4 rounded-full transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              Comenzar Entrenamiento
            </button>
          </motion.div>
        );

      case 'COUNTDOWN':
        return (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="flex flex-col items-center justify-center py-32"
          >
            <motion.div
              key={timeRemaining}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-9xl font-black text-orange-300 tracking-tighter"
            >
              {timeRemaining}
            </motion.div>
            <h2 className="text-2xl font-medium text-gray-400 mt-8 tracking-tight">Prepárate</h2>
          </motion.div>
        );

      case 'ACTIVE':
        if (!exercise) return null;
        return (
          <motion.div
            key="active"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col lg:flex-row gap-8 py-8 w-full"
          >
            <div className="flex-1 flex flex-col">
              <span className="text-orange-300 font-semibold uppercase tracking-widest text-sm mb-2">
                {blockName}
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                {exercise.name}
              </h2>
              
              <div className="w-full bg-gray-100 rounded-3xl aspect-video mb-8 flex items-center justify-center overflow-hidden relative shadow-sm">
                {exercise.videoUrl ? (
                  <iframe
                    src={getEmbedUrl(exercise.videoUrl)}
                    title={exercise.name}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <span className="text-gray-400 font-medium">Video Demostración</span>
                )}
              </div>

              <div className="flex items-center justify-between bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm uppercase tracking-wider mb-1 font-medium">
                    Objetivo
                  </span>
                  <span className="text-2xl font-semibold text-gray-900 tracking-tight">
                    {exercise.goal}
                  </span>
                </div>
                
                {exercise.type === 'timer' ? (
                  <div className="flex items-center gap-6">
                    <button
                      onClick={previousExercise}
                      className="text-gray-400 hover:text-gray-600 font-medium transition-colors"
                    >
                      Volver
                    </button>
                    <div className="text-right">
                      <span className="text-gray-500 text-sm uppercase tracking-wider mb-1 font-medium block">Tiempo</span>
                      <span className="text-4xl font-bold tracking-tighter text-orange-300">{timeRemaining}s</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={previousExercise}
                      className="text-gray-400 hover:text-gray-600 font-medium transition-colors"
                    >
                      Volver
                    </button>
                    <button
                      onClick={finishExercise}
                      className="bg-orange-300 hover:bg-orange-400 text-white font-semibold px-8 py-4 rounded-full transition-all active:scale-95 shadow-md flex items-center gap-2"
                    >
                      Siguiente
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <TipsSidebar tips={milestones} />
          </motion.div>
        );

      case 'REST_SET':
      case 'REST_BLOCK':
        return (
          <motion.div
            key="rest"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <PauseCircle className="w-16 h-16 text-gray-300 mb-6" strokeWidth={1.5} />
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {currentState === 'REST_BLOCK' ? 'Descanso Largo' : 'Descanso'}
            </h2>
            <p className="text-gray-500 mb-12">
              Recupera el aliento y relaja los músculos.
            </p>
            
            <CircularTimer
              progress={timerProgress}
              timeRemaining={timeRemaining}
              label="Descanso"
            />
            
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-12">
              <button
                onClick={previousExercise}
                className="text-gray-400 hover:text-gray-600 font-medium transition-colors"
              >
                Volver
              </button>
              <button
                onClick={startCountdown}
                className="text-gray-400 hover:text-gray-600 font-medium underline transition-colors"
              >
                Omitir descanso
              </button>
            </div>
          </motion.div>
        );

      case 'FINISHED':
        return (
          <motion.div
            key="finished"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-8">
              <span className="text-5xl">🎉</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">¡Entrenamiento Completado!</h1>
            <p className="text-xl text-gray-500 max-w-md mb-8">
              Tu columna te lo agradece. Has dado un gran paso hacia un cuerpo más sano y sin dolor.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-900 hover:bg-black text-white font-semibold px-8 py-4 rounded-full transition-all active:scale-95 shadow-md"
            >
              Volver al Inicio
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 min-h-screen flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {renderState()}
        </AnimatePresence>
      </main>
    </div>
  );
}

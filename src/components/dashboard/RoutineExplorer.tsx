'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Eye, Timer } from 'lucide-react';
import { ROUTINES } from '@/constants/routine';
import { Routine, Exercise } from '@/types/routine';
import { useWorkoutStore } from '@/store/useWorkoutStore';

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

export function RoutineExplorer() {
  const router = useRouter();
  const setRoutine = useWorkoutStore((s) => s.setRoutine);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const [view, setView] = useState<'LIST' | 'EXERCISES' | 'EXERCISE_DETAIL'>('LIST');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  if (view === 'LIST') {
    return (
      <div className="bg-[#0f172a] rounded-[2rem] p-6 md:p-10 shadow-2xl w-full min-h-[600px] flex flex-col">
        <h2 className="text-xl md:text-2xl font-black text-white mb-10 text-center tracking-wide">RUTINAS</h2>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-center flex-wrap flex-1">
          {ROUTINES.map((r) => (
            <div
              key={r.id}
              className="bg-orange-400 rounded-3xl p-5 w-full max-w-sm md:w-[320px] aspect-[4/3] flex flex-col justify-between relative overflow-hidden group shadow-lg transition-transform hover:-translate-y-1"
            >
              {r.imageUrl && (
                <img
                  src={r.imageUrl}
                  alt={r.name}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-600/90 to-transparent"></div>

              <div className="relative z-10 text-center text-white font-black text-2xl mb-4 drop-shadow-md px-2 mt-auto">
                {r.name.toUpperCase()}
              </div>

              <div className="relative z-10 flex gap-3 mt-6">
                <button
                  onClick={() => { setRoutine(r); startWorkout(); router.push('/workout'); }}
                  className="flex-1 bg-white hover:bg-gray-100 text-orange-500 font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                >
                  Comenzar
                </button>
                <button
                  onClick={() => { setSelectedRoutine(r); setView('EXERCISES'); }}
                  className="flex-1 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm border border-white/10"
                >
                  Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'EXERCISES' && selectedRoutine) {
    const exercises = selectedRoutine.blocks.flatMap(b => b.exercises);

    return (
      <div className="bg-[#0f172a] rounded-[2rem] p-6 md:p-10 shadow-2xl w-full flex flex-col min-h-[600px] transition-all">
        <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <button 
              onClick={() => setView('LIST')} 
              className="text-gray-400 hover:text-white transition-colors p-2 -ml-2 flex items-center gap-2 font-medium self-start"
            >
              <ArrowLeft className="w-5 h-5" /> Volver a Rutinas
            </button>
            <div className="text-left sm:text-right">
              <h3 className="text-xs font-bold text-orange-400 tracking-[0.2em] uppercase mb-1">RUTINA</h3>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">{selectedRoutine.name}</h2>
            </div>
          </div>

          <div className="relative flex-1">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-white/10 hidden md:block"></div>
            
            <div className="flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar relative z-10 pb-10">
              {exercises.map((ex, i) => (
                <div key={ex.id} className="flex gap-6 relative">
                  <div className="hidden md:flex flex-col items-center mt-4">
                    <div className="w-16 h-16 rounded-full bg-[#0f172a] border-2 border-orange-400 flex items-center justify-center font-black text-white text-xl z-10 shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                      {i + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full">
                    <button 
                      onClick={() => { setSelectedExercise(ex); setView('EXERCISE_DETAIL'); }}
                      className="w-full text-left bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 hover:border-orange-400/50 transition-all duration-300 rounded-[1.5rem] p-6 group relative overflow-hidden shadow-xl backdrop-blur-sm"
                    >
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 bg-orange-500 p-3 rounded-full shadow-lg">
                          <Play className="w-5 h-5 text-white fill-current translate-x-0.5" />
                       </div>
                       
                       <div className="md:hidden font-bold text-orange-400 text-xs tracking-[0.2em] mb-2 uppercase">
                          Ejercicio {i + 1}
                       </div>
                       
                       <h4 className="font-black text-white text-xl sm:text-2xl mb-2 pr-16 leading-tight">
                          {ex.name}
                       </h4>
                       
                       {ex.description && (
                         <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-medium pr-10 line-clamp-2">
                           {ex.description}
                         </p>
                       )}
                    </button>
                    
                    {i < exercises.length - 1 && (
                      <div className="flex items-center gap-4 my-6 opacity-60 pl-4 md:pl-0">
                        <div className="h-px bg-white/10 flex-1 md:hidden"></div>
                        <span className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                          <Timer className="w-4 h-4 text-orange-400" />
                          Descanso {selectedRoutine.restBetweenSets}s
                        </span>
                        <div className="h-px bg-white/10 flex-1"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'EXERCISE_DETAIL' && selectedRoutine && selectedExercise) {
    const exIndex = selectedRoutine.blocks.flatMap(b => b.exercises).findIndex(e => e.id === selectedExercise.id);

    return (
      <div className="bg-[#0f172a] rounded-[2rem] p-6 md:p-10 shadow-2xl w-full flex flex-col min-h-[600px]">
        <div className="max-w-5xl mx-auto w-full flex flex-col flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <button 
              onClick={() => setView('EXERCISES')} 
              className="text-gray-400 hover:text-white transition-colors p-2 -ml-2 flex items-center gap-2 font-medium self-start"
            >
              <ArrowLeft className="w-5 h-5" /> Volver a la Rutina
            </button>
            <div className="text-left sm:text-right">
              <h3 className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase mb-1">EJERCICIO {exIndex + 1}</h3>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">{selectedRoutine.name}</h2>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-[2rem] p-6 md:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12 shadow-xl backdrop-blur-sm flex-1">
             
             <div className="flex-1 flex flex-col justify-center">
               <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
                  {selectedExercise.name}
               </h3>
               
               {selectedExercise.description && (
                 <p className="text-gray-300 text-lg leading-relaxed">
                   {selectedExercise.description}
                 </p>
               )}
               
               <div className="mt-8 bg-black/30 p-6 rounded-2xl border border-white/5">
                  <span className="text-orange-400 font-bold uppercase tracking-widest text-xs mb-2 block">
                    Objetivo
                  </span>
                  <span className="text-white font-medium text-lg leading-snug">
                    {selectedExercise.goal}
                  </span>
               </div>
             </div>
             
             <div className="w-full lg:w-[450px] shrink-0 bg-black/60 rounded-3xl aspect-video flex items-center justify-center relative overflow-hidden border border-white/10 shadow-2xl self-center">
                {selectedExercise.videoUrl ? (
                  <iframe
                    src={getEmbedUrl(selectedExercise.videoUrl)}
                    title={selectedExercise.name}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-white/40">
                    <Play className="w-12 h-12" />
                    <span className="font-bold tracking-[0.2em] text-xs uppercase">Sin Video</span>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

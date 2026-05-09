import { Routine } from '../types/routine';

export const SPINE_FIT_ROUTINE: Routine = {
  id: 'spine-fit-1',
  name: 'Club de los Sin Chances',
  imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
  restBetweenSets: 90,
  restBetweenBlocks: 60,
  blocks: [
    {
      id: 'block-1',
      name: 'Triset 1: Mobility & Core Activation',
      exercises: [
        {
          id: 'ex-1-1',
          name: 'Cat-Cow',
          description: 'Ejercicio de movilidad espinal que ayuda a aliviar tensiones en la espalda y mejora la postura.',
          type: 'reps',
          goal: '10 repeticiones lentas',
          duration: 60,
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1',
        },
        {
          id: 'ex-1-2',
          name: 'Bird-Dog',
          description: 'Fortalece el core y la estabilidad lumbar levantando brazo y pierna opuesta.',
          type: 'reps',
          goal: '8 repeticiones por lado',
          duration: 60,
          videoUrl: 'https://www.youtube.com/watch?v=vzU5xrs1gMQ',
        },
        {
          id: 'ex-1-3',
          name: 'Dead-Bug',
          description: 'Ejercicio que fortalece tu abdomen (se hace acostado boca arriba).',
          type: 'timer',
          goal: 'Mantener control pélvico',
          duration: 45,
          videoUrl: 'https://www.youtube.com/embed/6VQZ2JokRtc?autoplay=1&mute=1&loop=1&playlist=6VQZ2JokRtc',
        },
      ],
    },
    {
      id: 'block-2',
      name: 'Triset 2: Glute & Posterior Chain',
      exercises: [
        {
          id: 'ex-2-1',
          name: 'Glute Bridge',
          description: 'Eleva la cadera activando fuertemente los glúteos para estabilizar la pelvis.',
          type: 'reps',
          goal: '15 repeticiones (pausa arriba 2s)',
          duration: 60,
          videoUrl: '',
        },
        {
          id: 'ex-2-2',
          name: 'Plancha Frontal',
          description: 'Plancha isométrica manteniendo el abdomen firme y evitando curvar la espalda baja.',
          type: 'timer',
          goal: 'Evitar que caiga la cadera',
          duration: 30,
          videoUrl: '',
        },
        {
          id: 'ex-2-3',
          name: 'Side Plank',
          description: 'Plancha lateral para activar oblicuos y mejorar la estabilidad lateral del torso.',
          type: 'timer',
          goal: 'Alineación de columna',
          duration: 30,
          videoUrl: '',
        },
      ],
    },
    {
      id: 'block-3',
      name: 'Triset 3: Posture Correction',
      exercises: [
        {
          id: 'ex-3-1',
          name: 'Wall Angels',
          description: 'Desliza los brazos por la pared intentando mantener la espalda pegada a ella.',
          type: 'reps',
          goal: '12 repeticiones',
          duration: 60,
          videoUrl: '',
        },
        {
          id: 'ex-3-2',
          name: 'Thoracic Rotations',
          description: 'Rotación del tronco superior para abrir el pecho y mejorar movilidad torácica.',
          type: 'reps',
          goal: '8 repeticiones por lado',
          duration: 60,
          videoUrl: '',
        },
        {
          id: 'ex-3-3',
          name: 'Cobra Stretch',
          description: 'Estiramiento suave de extensión de columna apoyando antebrazos en el suelo.',
          type: 'timer',
          goal: 'Respiración diafragmática',
          duration: 45,
          videoUrl: '',
        },
      ],
    },
  ],
};

export const NEW_ROUTINE: Routine = {
  id: 'spine-fit-2',
  name: 'Fuerza Core Avanzado',
  imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop', // A different gym image
  restBetweenSets: 60,
  restBetweenBlocks: 90,
  blocks: [
    {
      id: 'block-1',
      name: 'Bloque Único: Core de Hierro',
      exercises: [
        {
          id: 'ex-new-1',
          name: 'Hollow Body Hold',
          description: 'Mantén la posición cóncava activando todo el core anterior, sin arquear la espalda.',
          type: 'timer',
          goal: 'Resistir sin perder la postura',
          duration: 40,
          videoUrl: 'https://www.youtube.com/watch?v=vzU5xrs1gMQ',
        },
        {
          id: 'ex-new-2',
          name: 'Russian Twists',
          description: 'Rotaciones de torso para atacar los oblicuos de manera dinámica.',
          type: 'reps',
          goal: '20 repeticiones totales',
          duration: 60,
          videoUrl: '',
        }
      ]
    }
  ]
};

export const ROUTINES = [SPINE_FIT_ROUTINE, NEW_ROUTINE];

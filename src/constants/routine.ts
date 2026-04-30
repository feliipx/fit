import { Routine } from '../types/routine';

export const SPINE_FIT_ROUTINE: Routine = {
  id: 'spine-fit-1',
  name: 'Club de los Sin Chances',
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
          type: 'reps',
          goal: '10 repeticiones lentas',
          duration: 60, // Estimated 60s
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1',
        },
        {
          id: 'ex-1-2',
          name: 'Bird-Dog',
          type: 'reps',
          goal: '8 repeticiones por lado',
          duration: 60,
          videoUrl: 'https://www.youtube.com/watch?v=vzU5xrs1gMQ',
        },
        {
          id: 'ex-1-3',
          name: 'Dead-Bug',
          type: 'timer',
          goal: 'Mantener control pélvico',
          duration: 45, // 45 seconds timer
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
          type: 'reps',
          goal: '15 repeticiones (pausa arriba 2s)',
          duration: 60,
          videoUrl: '',
        },
        {
          id: 'ex-2-2',
          name: 'Plancha Frontal',
          type: 'timer',
          goal: 'Evitar que caiga la cadera',
          duration: 30, // 30 seconds timer
          videoUrl: '',
        },
        {
          id: 'ex-2-3',
          name: 'Side Plank',
          type: 'timer',
          goal: 'Alineación de columna',
          duration: 30, // 30s per side, let's say 60s total
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
          type: 'reps',
          goal: '12 repeticiones',
          duration: 60,
          videoUrl: '',
        },
        {
          id: 'ex-3-2',
          name: 'Thoracic Rotations',
          type: 'reps',
          goal: '8 repeticiones por lado',
          duration: 60,
          videoUrl: '',
        },
        {
          id: 'ex-3-3',
          name: 'Cobra Stretch',
          type: 'timer',
          goal: 'Respiración diafragmática',
          duration: 45, // 45 seconds timer
          videoUrl: '',
        },
      ],
    },
  ],
};

export type ExerciseType = 'reps' | 'timer';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  goal: string;
  duration: number; // in seconds, useful even for 'reps' as an estimated time or strict time limit
  videoUrl: string;
}

export interface Triset {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Routine {
  id: string;
  name: string;
  blocks: Triset[];
  restBetweenSets: number; // e.g., 90s
  restBetweenBlocks: number; // e.g., 60s
}

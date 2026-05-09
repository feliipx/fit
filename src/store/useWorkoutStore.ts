import { create } from 'zustand';
import { SPINE_FIT_ROUTINE } from '../constants/routine';
import { Routine, Exercise } from '../types/routine';

export type WorkoutState = 'IDLE' | 'PREPARING' | 'COUNTDOWN' | 'ACTIVE' | 'REST_SET' | 'REST_BLOCK' | 'FINISHED';

interface WorkoutStore {
  routine: Routine;
  currentState: WorkoutState;
  currentBlockIndex: number;
  currentExerciseIndex: number;
  timeRemaining: number;
  
  // Actions
  startWorkout: () => void;
  startCountdown: () => void;
  startExercise: () => void;
  finishExercise: () => void;
  previousExercise: () => void;
  tickTimer: () => void;
  
  // Helpers
  getCurrentExercise: () => Exercise | null;
  getCurrentBlockName: () => string | null;
  resetWorkout: () => void;
  setRoutine: (routine: Routine) => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  routine: SPINE_FIT_ROUTINE,
  currentState: 'IDLE',
  currentBlockIndex: 0,
  currentExerciseIndex: 0,
  timeRemaining: 0,

  startWorkout: () => {
    set({
      currentState: 'PREPARING',
      currentBlockIndex: 0,
      currentExerciseIndex: 0,
      timeRemaining: 0,
    });
  },

  startCountdown: () => {
    set({
      currentState: 'COUNTDOWN',
      timeRemaining: 3, // 3 seconds countdown
    });
  },

  startExercise: () => {
    const { getCurrentExercise } = get();
    const exercise = getCurrentExercise();
    if (exercise) {
      set({
        currentState: 'ACTIVE',
        timeRemaining: exercise.type === 'timer' ? exercise.duration : 0,
      });
    }
  },

  finishExercise: () => {
    const { routine, currentBlockIndex, currentExerciseIndex } = get();
    const currentBlock = routine.blocks[currentBlockIndex];
    
    // Check if we are at the last exercise of the block
    if (currentExerciseIndex >= currentBlock.exercises.length - 1) {
      // Check if we are at the last block of the routine
      if (currentBlockIndex >= routine.blocks.length - 1) {
        set({ currentState: 'FINISHED', timeRemaining: 0 });
      } else {
        // We go to REST_BLOCK
        set({
          currentState: 'REST_BLOCK',
          timeRemaining: routine.restBetweenBlocks,
          currentBlockIndex: currentBlockIndex + 1,
          currentExerciseIndex: 0,
        });
      }
    } else {
      // We go to REST_SET within the same block
      set({
        currentState: 'REST_SET',
        timeRemaining: routine.restBetweenSets,
        currentExerciseIndex: currentExerciseIndex + 1,
      });
    }
  },

  previousExercise: () => {
    const { routine, currentBlockIndex, currentExerciseIndex, startExercise } = get();
    
    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1 });
      startExercise();
    } else if (currentBlockIndex > 0) {
      const prevBlockIndex = currentBlockIndex - 1;
      const prevBlock = routine.blocks[prevBlockIndex];
      set({
        currentBlockIndex: prevBlockIndex,
        currentExerciseIndex: prevBlock.exercises.length - 1,
      });
      startExercise();
    } else {
      // At the very beginning, just reset to PREPARING
      set({
        currentState: 'PREPARING',
        timeRemaining: 0,
      });
    }
  },

  tickTimer: () => {
    const { currentState, timeRemaining, startExercise, finishExercise, startCountdown } = get();
    
    if (timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    } else {
      // Timer hit 0, trigger state transitions
      switch (currentState) {
        case 'COUNTDOWN':
          startExercise();
          break;
        case 'ACTIVE':
          // ACTIVE timer is only for 'timer' exercises. 'reps' exercises finish manually.
          const exercise = get().getCurrentExercise();
          if (exercise && exercise.type === 'timer') {
            finishExercise();
          }
          break;
        case 'REST_SET':
        case 'REST_BLOCK':
          // Rest is over, start countdown for next exercise
          startCountdown();
          break;
        default:
          break;
      }
    }
  },

  getCurrentExercise: () => {
    const { routine, currentBlockIndex, currentExerciseIndex } = get();
    if (!routine.blocks[currentBlockIndex]) return null;
    return routine.blocks[currentBlockIndex].exercises[currentExerciseIndex] || null;
  },

  getCurrentBlockName: () => {
    const { routine, currentBlockIndex } = get();
    return routine.blocks[currentBlockIndex]?.name || null;
  },

  resetWorkout: () => {
    set({
      currentState: 'IDLE',
      currentBlockIndex: 0,
      currentExerciseIndex: 0,
      timeRemaining: 0,
    });
  },

  setRoutine: (routine: Routine) => {
    set({ routine });
  }
}));

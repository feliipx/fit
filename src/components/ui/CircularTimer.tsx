'use client';

import { motion } from 'framer-motion';

interface CircularTimerProps {
  progress: number; // 0 to 1
  timeRemaining: number;
  label?: string;
}

export function CircularTimer({ progress, timeRemaining, label }: CircularTimerProps) {
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-100"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'linear' }}
          strokeLinecap="round"
          className="text-orange-300"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold tracking-tighter text-gray-900">
          {timeRemaining}
        </span>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-1">
          {label || 'Segundos'}
        </span>
      </div>
    </div>
  );
}

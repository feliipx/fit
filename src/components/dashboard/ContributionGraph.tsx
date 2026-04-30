'use client';

import { useMemo } from 'react';

interface ContributionGraphProps {
  logDates: string[]; // ISO strings
  createdAt?: string; // ISO string
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function ContributionGraph({ logDates, createdAt }: ContributionGraphProps) {
  
  const { columns, months, totalWorkouts } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = createdAt ? new Date(createdAt) : new Date();
    start.setHours(0, 0, 0, 0);

    // Ensure we show at least 20 weeks (140 days) so the grid always looks full and symmetric
    const minDays = 140;
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < minDays) {
      start.setDate(today.getDate() - minDays);
    }

    // Adjust start to the previous Sunday so the grid aligns correctly
    const startDay = start.getDay();
    start.setDate(start.getDate() - startDay);

    const logMap = new Set(
      logDates.map((dateStr) => {
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );

    const totalWorkouts = logDates.length;
    const grid: any[] = [];
    let curr = new Date(start);
    
    // Generate all days from start to today (and finish the week)
    while (curr <= today || curr.getDay() !== 0) {
      if (curr > today && curr.getDay() === 0) break; // Reached end of current week
      
      const key = `${curr.getFullYear()}-${curr.getMonth()}-${curr.getDate()}`;
      const isFuture = curr > today;

      grid.push({
        date: new Date(curr),
        didWorkout: !isFuture && logMap.has(key),
        isFuture,
        month: curr.getMonth()
      });
      curr.setDate(curr.getDate() + 1);
    }

    // Group into columns of 7
    const cols = [];
    let monthLabels: { label: string, colIndex: number }[] = [];
    let lastMonth = -1;

    for (let i = 0; i < grid.length; i += 7) {
      const col = grid.slice(i, i + 7);
      cols.push(col);
      
      // Determine if this column starts a new month
      const colMonth = col[0].month;
      if (colMonth !== lastMonth) {
        monthLabels.push({
          label: MONTH_NAMES[colMonth],
          colIndex: cols.length - 1
        });
        lastMonth = colMonth;
      }
    }

    // Filter out month labels that are too close to each other (e.g. less than 3 columns apart)
    monthLabels = monthLabels.filter((m, i, arr) => {
      if (i === arr.length - 1) return true; // always keep the last one
      return arr[i + 1].colIndex - m.colIndex >= 3;
    });

    return { columns: cols, months: monthLabels, totalWorkouts };
  }, [logDates, createdAt]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900 font-semibold tracking-tight">Actividad de Entrenamientos</h3>
        <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          Total: {totalWorkouts} sesiones
        </span>
      </div>
      
      <div className="overflow-x-auto pb-4 flex-1">
        <div className="w-max min-w-full">
          {/* Months Header */}
          <div className="flex relative mb-2 h-5">
            {months.map((m, i) => (
              <span 
                key={i} 
                className="absolute text-xs text-gray-400 font-medium"
                style={{ left: `${m.colIndex * (16 + 6)}px` }} // 16px width + 6px gap
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1.5">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1.5">
                {col.map((day, rowIdx) => (
                  <div
                    key={rowIdx}
                    title={day.isFuture ? '' : `${day.date.toDateString()}${day.didWorkout ? ' (Completado)' : ''}`}
                    className={`w-4 h-4 rounded-[4px] transition-colors duration-300 ${
                      day.isFuture 
                        ? 'bg-transparent' 
                        : day.didWorkout 
                          ? 'bg-orange-300' 
                          : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

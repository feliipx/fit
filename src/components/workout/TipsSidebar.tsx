'use client';

import { CheckCircle2 } from 'lucide-react';

interface TipsSidebarProps {
  tips: string[];
}

export function TipsSidebar({ tips }: TipsSidebarProps) {
  return (
    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm lg:sticky lg:top-8 w-full lg:w-80 shrink-0">
      <h3 className="font-semibold text-lg text-gray-900 mb-4 tracking-tight">
        Tips del Ejercicio
      </h3>
      <ul className="space-y-4">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-orange-300 shrink-0 mt-0.5" />
            <span className="text-[15px] leading-relaxed text-gray-700">
              {tip}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

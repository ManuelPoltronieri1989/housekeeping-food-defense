import React from 'react';
import { Shield, Star } from 'lucide-react';

export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange('safety')}
        className={`flex items-center gap-2 px-4 h-10 rounded-lg border text-sm font-medium transition-all duration-200 ${
          mode === 'safety'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
        }`}
      >
        <Shield className="w-4 h-4" />
        Safety
      </button>
      <button
        onClick={() => onChange('quality')}
        className={`flex items-center gap-2 px-4 h-10 rounded-lg border text-sm font-medium transition-all duration-200 ${
          mode === 'quality'
            ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
        }`}
      >
        <Star className="w-4 h-4" />
        Quality
      </button>
    </div>
  );
}

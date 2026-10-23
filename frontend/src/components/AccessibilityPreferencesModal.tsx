import React from 'react';
import { useAuth, TextSize, LayoutDensity } from '../context/AuthContext';
import {
  Eye, Check, RotateCcw, X, Sliders, Type, Contrast,
  ZapOff, Maximize2, Sparkles, ShieldCheck
} from 'lucide-react';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityPreferencesModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    accessibility,
    setTextSize,
    toggleHighContrast,
    toggleReducedMotion,
    setLayoutDensity,
    toggleEnhancedFocus,
    toggleDyslexicFont,
    toggleScreenReaderAids,
    resetAccessibility
  } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 id="a11y-modal-title" className="text-lg sm:text-xl font-bold text-slate-900">
                Accessibility & Display Preferences
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Customize your reading, visual contrast, and interaction comfort. All settings apply instantly.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-sky-600"
            aria-label="Close accessibility preferences"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational banner: No diagnosis required */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p>
            <strong>Personalized for you:</strong> You never need to disclose a diagnosis or register disability status to use these features. Both standard and accessible experiences share identical platform data and tools.
          </p>
        </div>

        {/* 1. Text Size */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-4 h-4 text-sky-600" />
              <span>Text Size & Legibility</span>
            </label>
            <span className="text-xs font-semibold text-sky-700 capitalize">
              Active: {accessibility.textSize}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'standard', label: 'Standard', desc: '100% default' },
              { id: 'medium', label: 'Medium', desc: '+15% larger' },
              { id: 'large', label: 'Large', desc: '+30% larger' },
              { id: 'xlarge', label: 'Extra Large', desc: '+45% high readability' }
            ].map(item => {
              const isSelected = accessibility.textSize === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTextSize(item.id as TextSize)}
                  className={`p-3 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">{item.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal block mt-1">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Visual Contrast & Layout Density */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* High Contrast */}
          <section className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-bold text-sm text-slate-900 block">High Contrast Mode</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Deep dark text on clean white backgrounds with stark solid borders.
                </span>
              </div>
              <button
                type="button"
                onClick={toggleHighContrast}
                className={`w-12 h-6 rounded-full transition p-1 shrink-0 ${
                  accessibility.highContrast ? 'bg-sky-600' : 'bg-slate-300'
                }`}
                aria-pressed={accessibility.highContrast}
                aria-label="Toggle high contrast mode"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    accessibility.highContrast ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {accessibility.highContrast && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md block w-fit">
                High contrast active
              </span>
            )}
          </section>

          {/* Reduced Motion */}
          <section className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-bold text-sm text-slate-900 block">Reduced Motion</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Stops sliding animations, decorative transforms, and transitions.
                </span>
              </div>
              <button
                type="button"
                onClick={toggleReducedMotion}
                className={`w-12 h-6 rounded-full transition p-1 shrink-0 ${
                  accessibility.reducedMotion ? 'bg-sky-600' : 'bg-slate-300'
                }`}
                aria-pressed={accessibility.reducedMotion}
                aria-label="Toggle reduced motion"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    accessibility.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {accessibility.reducedMotion && (
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md block w-fit">
                Motion reduced
              </span>
            )}
          </section>
        </div>

        {/* 3. Layout Density */}
        <section className="space-y-3">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-sky-600" />
            <span>Layout Spacing & Density</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'standard',
                title: 'Standard Density',
                desc: 'Balanced spacing, standard desktop & mobile view.'
              },
              {
                id: 'comfortable',
                title: 'Comfortable Spacing',
                desc: 'Larger touch targets (48px+) and generous breathing room.'
              },
              {
                id: 'simplified',
                title: 'Simplified Focus',
                desc: 'Single-column priority flow with less visual clutter.'
              }
            ].map(d => {
              const isSelected = accessibility.layoutDensity === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setLayoutDensity(d.id as LayoutDensity)}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm">{d.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    {d.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Fine-Tuning Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={toggleEnhancedFocus}
            className={`p-3 rounded-xl border flex items-center justify-between text-left text-xs transition ${
              accessibility.enhancedFocus
                ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div>
              <span className="block font-bold">Thick Visible Focus Indicator</span>
              <span className="text-[10px] text-slate-500">Enhanced 3px outline on focused controls</span>
            </div>
            {accessibility.enhancedFocus && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={toggleDyslexicFont}
            className={`p-3 rounded-xl border flex items-center justify-between text-left text-xs transition ${
              accessibility.dyslexicFont
                ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div>
              <span className="block font-bold">Generous Letter Spacing</span>
              <span className="text-[10px] text-slate-500">Increased tracking for reading comfort</span>
            </div>
            {accessibility.dyslexicFont && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
          </button>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
          <button
            type="button"
            onClick={resetAccessibility}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

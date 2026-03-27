// components/PWAInstallButton.tsx
// Drop this anywhere in the UI for a manual install trigger
import { Download, CheckCircle } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'banner' | 'button' | 'minimal';
}

export const PWAInstallButton = ({ className = '', variant = 'button' }: PWAInstallButtonProps) => {
  const { canInstall, isInstalled, promptInstall } = usePWA();

  if (isInstalled) {
    return (
      <div className={`flex items-center gap-2 text-green-600 text-sm font-medium ${className}`}>
        <CheckCircle size={16} /> App installed
      </div>
    );
  }

  if (!canInstall) return null;

  if (variant === 'minimal') {
    return (
      <button onClick={promptInstall} className={`text-indigo-600 text-sm underline ${className}`}>
        Install app
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between gap-3 ${className}`}>
        <div>
          <p className="text-sm font-bold text-indigo-800">Install CoachingApp</p>
          <p className="text-xs text-indigo-600 mt-0.5">Work offline, faster load, home screen shortcut</p>
        </div>
        <button
          onClick={promptInstall}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          <Download size={15} /> Install
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={promptInstall}
      className={`flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors ${className}`}
    >
      <Download size={16} /> Install App
    </button>
  );
};
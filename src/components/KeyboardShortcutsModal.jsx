import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { getGroupedShortcuts, formatShortcut } from '../hooks/useKeyboardShortcuts';

/**
 * Keyboard Shortcuts Help Modal
 * Displays all available keyboard shortcuts grouped by category
 * Accessible: Focus trap, escape to close, screen reader support
 */
export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  const shortcuts = getGroupedShortcuts();
  
  // Close on escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1a1a18] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">keyboard</span>
            </div>
            <div>
              <h2 id="shortcuts-title" className="text-xl font-bold">Klavye Kısayolları</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Daha hızlı gezinmek için kullanın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
            {Object.entries(shortcuts).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((shortcut) => (
                    <div 
                      key={shortcut.name}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-md border border-gray-200 dark:border-white/10 shadow-sm">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Tips */}
          <div className="mt-8 p-4 rounded-xl bg-brand-purple/5 border border-brand-purple/10">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-brand-purple text-xl">tips_and_updates</span>
              <div className="text-sm">
                <p className="font-bold text-gray-900 dark:text-white mb-1">İpucu</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Mac kullanıyorsanız Ctrl yerine ⌘ (Command) tuşunu kullanabilirsiniz.
                  Bu pencereyi istediğiniz zaman <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-white/10 rounded">Shift+?</kbd> ile açabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

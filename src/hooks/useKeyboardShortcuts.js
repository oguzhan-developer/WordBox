import { useEffect, useCallback, useRef } from 'react';

/**
 * Keyboard Shortcuts Hook
 * Provides global and contextual keyboard shortcuts for the application
 * Accessibility: Enables keyboard-only navigation and actions
 */

// Default shortcuts configuration
export const SHORTCUTS = {
  // Navigation
  GO_HOME: { key: 'h', ctrl: true, description: 'Ana sayfaya git' },
  GO_LIBRARY: { key: 'l', ctrl: true, description: 'Kütüphaneye git' },
  GO_PRACTICE: { key: 'p', ctrl: true, description: 'Pratik sayfasına git' },
  GO_VOCABULARY: { key: 'v', ctrl: true, description: 'Kelime listesine git' },
  GO_PROGRESS: { key: 'g', ctrl: true, description: 'İlerleme sayfasına git' },
  GO_SETTINGS: { key: ',', ctrl: true, description: 'Ayarlara git' },
  
  // Actions
  SEARCH: { key: 'k', ctrl: true, description: 'Ara' },
  TOGGLE_DARK_MODE: { key: 'd', ctrl: true, shift: true, description: 'Karanlık modu aç/kapa' },
  PLAY_AUDIO: { key: ' ', description: 'Sesi oynat/durdur', context: 'practice' },
  NEXT_ITEM: { key: 'ArrowRight', description: 'Sonraki', context: 'practice' },
  PREV_ITEM: { key: 'ArrowLeft', description: 'Önceki', context: 'practice' },
  SUBMIT: { key: 'Enter', description: 'Gönder', context: 'form' },
  ESCAPE: { key: 'Escape', description: 'Kapat/İptal' },
  
  // Help
  SHOW_SHORTCUTS: { key: '?', shift: true, description: 'Kısayolları göster' },
};

// Check if an element is an input-like element
const isInputElement = (element) => {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  const isContentEditable = element.isContentEditable;
  const inputTypes = ['input', 'textarea', 'select'];
  return inputTypes.includes(tagName) || isContentEditable;
};

// Match a key event against a shortcut definition
const matchShortcut = (event, shortcut) => {
  if (!shortcut || !shortcut.key) return false;
  
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                   event.code.toLowerCase() === `key${shortcut.key.toLowerCase()}`;
  
  const ctrlMatch = !shortcut.ctrl || (event.ctrlKey || event.metaKey);
  const shiftMatch = !shortcut.shift || event.shiftKey;
  const altMatch = !shortcut.alt || event.altKey;
  
  // If shortcut requires ctrl, it must be pressed
  if (shortcut.ctrl && !(event.ctrlKey || event.metaKey)) return false;
  // If shortcut requires shift, it must be pressed
  if (shortcut.shift && !event.shiftKey) return false;
  // If shortcut requires alt, it must be pressed
  if (shortcut.alt && !event.altKey) return false;
  
  return keyMatch && ctrlMatch && shiftMatch && altMatch;
};

/**
 * Format a shortcut for display
 */
export const formatShortcut = (shortcut) => {
  if (!shortcut) return '';
  
  const parts = [];
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  
  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  
  // Format special keys
  let keyDisplay = shortcut.key;
  switch (shortcut.key.toLowerCase()) {
    case 'arrowright': keyDisplay = '→'; break;
    case 'arrowleft': keyDisplay = '←'; break;
    case 'arrowup': keyDisplay = '↑'; break;
    case 'arrowdown': keyDisplay = '↓'; break;
    case 'enter': keyDisplay = '↵'; break;
    case 'escape': keyDisplay = 'Esc'; break;
    case ' ': keyDisplay = 'Space'; break;
    case ',': keyDisplay = ','; break;
    case '?': keyDisplay = '?'; break;
    default: keyDisplay = shortcut.key.toUpperCase();
  }
  
  parts.push(keyDisplay);
  return parts.join(isMac ? '' : '+');
};

/**
 * Main hook for handling keyboard shortcuts
 * @param {Object} handlers - Object mapping shortcut names to handler functions
 * @param {Object} options - Configuration options
 * @returns {Object} - Utility functions
 */
export default function useKeyboardShortcuts(handlers = {}, options = {}) {
  const {
    enabled = true,
    context = null, // 'practice', 'form', 'reading', etc.
    allowInInputs = false,
    preventDefault = true,
  } = options;
  
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;
    
    // Skip if typing in an input (unless explicitly allowed)
    if (!allowInInputs && isInputElement(event.target)) {
      // Allow Escape in inputs
      if (event.key !== 'Escape') return;
    }
    
    // Check each registered handler
    for (const [shortcutName, handler] of Object.entries(handlersRef.current)) {
      const shortcut = SHORTCUTS[shortcutName];
      if (!shortcut) continue;
      
      // Skip context-specific shortcuts if not in that context
      if (shortcut.context && shortcut.context !== context) continue;
      
      if (matchShortcut(event, shortcut)) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        handler(event);
        return;
      }
    }
  }, [enabled, context, allowInInputs, preventDefault]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Return utility functions
  return {
    getShortcutLabel: (shortcutName) => {
      const shortcut = SHORTCUTS[shortcutName];
      return shortcut ? formatShortcut(shortcut) : '';
    },
    getShortcutDescription: (shortcutName) => {
      const shortcut = SHORTCUTS[shortcutName];
      return shortcut?.description || '';
    },
  };
}

/**
 * Get all available shortcuts grouped by category
 */
export const getGroupedShortcuts = () => {
  return {
    'Navigasyon': [
      { name: 'GO_HOME', ...SHORTCUTS.GO_HOME },
      { name: 'GO_LIBRARY', ...SHORTCUTS.GO_LIBRARY },
      { name: 'GO_PRACTICE', ...SHORTCUTS.GO_PRACTICE },
      { name: 'GO_VOCABULARY', ...SHORTCUTS.GO_VOCABULARY },
      { name: 'GO_PROGRESS', ...SHORTCUTS.GO_PROGRESS },
      { name: 'GO_SETTINGS', ...SHORTCUTS.GO_SETTINGS },
    ],
    'Eylemler': [
      { name: 'SEARCH', ...SHORTCUTS.SEARCH },
      { name: 'TOGGLE_DARK_MODE', ...SHORTCUTS.TOGGLE_DARK_MODE },
      { name: 'ESCAPE', ...SHORTCUTS.ESCAPE },
    ],
    'Pratik Modu': [
      { name: 'PLAY_AUDIO', ...SHORTCUTS.PLAY_AUDIO },
      { name: 'NEXT_ITEM', ...SHORTCUTS.NEXT_ITEM },
      { name: 'PREV_ITEM', ...SHORTCUTS.PREV_ITEM },
      { name: 'SUBMIT', ...SHORTCUTS.SUBMIT },
    ],
    'Yardım': [
      { name: 'SHOW_SHORTCUTS', ...SHORTCUTS.SHOW_SHORTCUTS },
    ],
  };
};

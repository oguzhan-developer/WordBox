/**
 * wordLists.js - Özel kelime listeleri yönetimi
 * Kullanıcıların kendi özel kelime listelerini oluşturmasını sağlar
 */

const STORAGE_KEY = 'wordbox-custom-lists';

// Varsayılan kategoriler
export const DEFAULT_CATEGORIES = [
  { id: 'favorites', name: 'Favoriler', icon: '⭐', color: '#fbbf24', isSystem: true },
  { id: 'difficult', name: 'Zor Kelimeler', icon: '🔥', color: '#ef4444', isSystem: true },
  { id: 'review', name: 'Tekrar Edilecek', icon: '🔄', color: '#3b82f6', isSystem: true },
];

/**
 * Tüm listeleri al
 */
export const getAllLists = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return [...DEFAULT_CATEGORIES, ...data.lists.filter(l => !l.isSystem)];
    }
  } catch (e) {
    console.warn('Listeler yüklenemedi:', e);
  }
  return DEFAULT_CATEGORIES;
};

/**
 * Özel listeleri al (sistem listeleri hariç)
 */
export const getCustomLists = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.lists.filter(l => !l.isSystem);
    }
  } catch (e) {
    console.warn('Özel listeler yüklenemedi:', e);
  }
  return [];
};

/**
 * Yeni liste oluştur
 */
export const createList = (list) => {
  const newList = {
    id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: list.name,
    description: list.description || '',
    icon: list.icon || '📚',
    color: list.color || '#6366f1',
    wordIds: [],
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const data = getListsData();
  data.lists.push(newList);
  saveListsData(data);

  return newList;
};

/**
 * Liste güncelle
 */
export const updateList = (listId, updates) => {
  const data = getListsData();
  const index = data.lists.findIndex(l => l.id === listId);
  
  if (index === -1) {
    throw new Error('Liste bulunamadı');
  }

  if (data.lists[index].isSystem) {
    throw new Error('Sistem listeleri düzenlenemez');
  }

  data.lists[index] = {
    ...data.lists[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveListsData(data);
  return data.lists[index];
};

/**
 * Liste sil
 */
export const deleteList = (listId) => {
  const data = getListsData();
  const list = data.lists.find(l => l.id === listId);
  
  if (!list) {
    throw new Error('Liste bulunamadı');
  }

  if (list.isSystem) {
    throw new Error('Sistem listeleri silinemez');
  }

  data.lists = data.lists.filter(l => l.id !== listId);
  saveListsData(data);
  return true;
};

/**
 * Listeye kelime ekle
 */
export const addWordToList = (listId, wordId) => {
  const data = getListsData();
  const list = data.lists.find(l => l.id === listId);
  
  if (!list) {
    // Sistem listesi olabilir, data'ya ekle
    const systemList = DEFAULT_CATEGORIES.find(c => c.id === listId);
    if (systemList) {
      data.lists.push({
        ...systemList,
        wordIds: [wordId],
        updatedAt: new Date().toISOString(),
      });
      saveListsData(data);
      return true;
    }
    throw new Error('Liste bulunamadı');
  }

  if (!list.wordIds.includes(wordId)) {
    list.wordIds.push(wordId);
    list.updatedAt = new Date().toISOString();
    saveListsData(data);
  }

  return true;
};

/**
 * Listeden kelime kaldır
 */
export const removeWordFromList = (listId, wordId) => {
  const data = getListsData();
  const list = data.lists.find(l => l.id === listId);
  
  if (!list) {
    throw new Error('Liste bulunamadı');
  }

  list.wordIds = list.wordIds.filter(id => id !== wordId);
  list.updatedAt = new Date().toISOString();
  saveListsData(data);

  return true;
};

/**
 * Kelime hangi listelerde
 */
export const getListsForWord = (wordId) => {
  const data = getListsData();
  return data.lists
    .filter(list => list.wordIds?.includes(wordId))
    .map(list => list.id);
};

/**
 * Listedeki kelimeleri al
 */
export const getListWords = (listId) => {
  const data = getListsData();
  const list = data.lists.find(l => l.id === listId);
  
  if (!list) {
    const systemList = DEFAULT_CATEGORIES.find(c => c.id === listId);
    if (systemList) {
      return [];
    }
    throw new Error('Liste bulunamadı');
  }

  return list.wordIds || [];
};

/**
 * Liste detaylarını al
 */
export const getListById = (listId) => {
  const data = getListsData();
  const list = data.lists.find(l => l.id === listId);
  
  if (list) return list;
  
  // Sistem listesi kontrol
  const systemList = DEFAULT_CATEGORIES.find(c => c.id === listId);
  if (systemList) {
    return { ...systemList, wordIds: [] };
  }
  
  return null;
};

/**
 * Liste istatistiklerini al
 */
export const getListStats = () => {
  const data = getListsData();
  return {
    totalLists: data.lists.length,
    customLists: data.lists.filter(l => !l.isSystem).length,
    totalWords: data.lists.reduce((sum, l) => sum + (l.wordIds?.length || 0), 0),
  };
};

/**
 * Kelimeyi birden fazla listeye ekle/kaldır
 */
export const updateWordLists = (wordId, listIds) => {
  const data = getListsData();
  
  data.lists.forEach(list => {
    if (listIds.includes(list.id)) {
      // Listeye ekle
      if (!list.wordIds) list.wordIds = [];
      if (!list.wordIds.includes(wordId)) {
        list.wordIds.push(wordId);
        list.updatedAt = new Date().toISOString();
      }
    } else {
      // Listeden kaldır
      if (list.wordIds?.includes(wordId)) {
        list.wordIds = list.wordIds.filter(id => id !== wordId);
        list.updatedAt = new Date().toISOString();
      }
    }
  });

  saveListsData(data);
  return true;
};

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

const getListsData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Liste verileri okunamadı:', e);
  }
  return { lists: [] };
};

const saveListsData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Liste verileri kaydedilemedi:', e);
    return false;
  }
};

// ============================================
// HOOK: React component'lerde kullanım için
// ============================================

import { useState, useCallback } from 'react';

export const useWordLists = () => {
  const [lists, setLists] = useState(() => getAllLists());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLists(getAllLists());
    setLoading(false);
  }, []);

  const create = useCallback((list) => {
    const newList = createList(list);
    refresh();
    return newList;
  }, [refresh]);

  const update = useCallback((listId, updates) => {
    const updated = updateList(listId, updates);
    refresh();
    return updated;
  }, [refresh]);

  const remove = useCallback((listId) => {
    deleteList(listId);
    refresh();
  }, [refresh]);

  const addWord = useCallback((listId, wordId) => {
    addWordToList(listId, wordId);
    refresh();
  }, [refresh]);

  const removeWord = useCallback((listId, wordId) => {
    removeWordFromList(listId, wordId);
    refresh();
  }, [refresh]);

  const isWordInList = useCallback((listId, wordId) => {
    const wordLists = getListsForWord(wordId);
    return wordLists.includes(listId);
  }, []);

  return {
    lists,
    loading,
    refresh,
    create,
    update,
    remove,
    addWord,
    removeWord,
    isWordInList,
    getListWords,
    getListsForWord,
    stats: getListStats(),
  };
};

// ============================================
// EMOJI SEÇENEKLERİ
// ============================================

export const LIST_ICONS = [
  '📚', '📖', '📝', '✏️', '📓', '📒', '📕', '📗', '📘', '📙',
  '⭐', '💡', '🎯', '🔥', '⚡', '💎', '🏆', '🎓', '🚀', '💪',
  '❤️', '💙', '💚', '💛', '💜', '🧡', '🤍', '🖤', '💗', '💝',
  '🌟', '✨', '🌈', '☀️', '🌙', '⭕', '🔴', '🟢', '🔵', '🟡',
];

export const LIST_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#71717a', '#404040',
];

export default {
  getAllLists,
  getCustomLists,
  createList,
  updateList,
  deleteList,
  addWordToList,
  removeWordFromList,
  getListsForWord,
  getListWords,
  getListById,
  getListStats,
  updateWordLists,
  DEFAULT_CATEGORIES,
  LIST_ICONS,
  LIST_COLORS,
};

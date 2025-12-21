/**
 * Content Bookmarks Utility
 * İçerikleri favorilere ekleme ve yönetme
 */

const STORAGE_KEY = 'wordbox_bookmarks';

/**
 * Storage'dan bookmarks verisini al
 */
const getBookmarksData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { bookmarks: [], collections: [] };
  } catch (error) {
    console.error('Bookmarks verisi okunamadı:', error);
    return { bookmarks: [], collections: [] };
  }
};

/**
 * Bookmarks verisini storage'a kaydet
 */
const saveBookmarksData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Bookmarks verisi kaydedilemedi:', error);
  }
};

/**
 * İçeriği favorilere ekle
 * @param {Object} content - İçerik objesi
 * @param {string} content.id - İçerik ID
 * @param {string} content.title - İçerik başlığı
 * @param {string} content.type - İçerik tipi (article, vocabulary, etc.)
 * @param {string} content.level - İçerik seviyesi
 * @param {string} content.thumbnail - Küçük resim URL (opsiyonel)
 * @param {string} collectionId - Koleksiyon ID (opsiyonel)
 */
export const addBookmark = (content, collectionId = null) => {
  const data = getBookmarksData();
  
  // Zaten ekli mi kontrol et
  const existingIndex = data.bookmarks.findIndex(b => b.id === content.id);
  if (existingIndex !== -1) {
    // Koleksiyonu güncelle
    if (collectionId) {
      data.bookmarks[existingIndex].collectionId = collectionId;
      saveBookmarksData(data);
    }
    return false;
  }
  
  const bookmark = {
    id: content.id,
    title: content.title,
    type: content.type || 'article',
    level: content.level,
    thumbnail: content.thumbnail || null,
    collectionId: collectionId,
    addedAt: new Date().toISOString(),
    lastReadAt: null,
    notes: ''
  };
  
  data.bookmarks.unshift(bookmark);
  saveBookmarksData(data);
  return true;
};

/**
 * İçeriği favorilerden kaldır
 * @param {string} contentId - İçerik ID
 */
export const removeBookmark = (contentId) => {
  const data = getBookmarksData();
  data.bookmarks = data.bookmarks.filter(b => b.id !== contentId);
  saveBookmarksData(data);
};

/**
 * İçerik favori mi kontrol et
 * @param {string} contentId - İçerik ID
 * @returns {boolean}
 */
export const isBookmarked = (contentId) => {
  const data = getBookmarksData();
  return data.bookmarks.some(b => b.id === contentId);
};

/**
 * Bookmark'ı toggle et
 * @param {Object} content - İçerik objesi
 * @returns {boolean} - Toggle sonrası durum (true = eklendi, false = kaldırıldı)
 */
export const toggleBookmark = (content) => {
  if (isBookmarked(content.id)) {
    removeBookmark(content.id);
    return false;
  } else {
    addBookmark(content);
    return true;
  }
};

/**
 * Tüm bookmark'ları getir
 * @param {Object} filters - Filtreler
 * @param {string} filters.type - İçerik tipi
 * @param {string} filters.level - İçerik seviyesi
 * @param {string} filters.collectionId - Koleksiyon ID
 * @returns {Array}
 */
export const getBookmarks = (filters = {}) => {
  const data = getBookmarksData();
  let bookmarks = [...data.bookmarks];
  
  if (filters.type) {
    bookmarks = bookmarks.filter(b => b.type === filters.type);
  }
  
  if (filters.level) {
    bookmarks = bookmarks.filter(b => b.level === filters.level);
  }
  
  if (filters.collectionId) {
    bookmarks = bookmarks.filter(b => b.collectionId === filters.collectionId);
  }
  
  return bookmarks;
};

/**
 * Bookmark'a not ekle
 * @param {string} contentId - İçerik ID
 * @param {string} note - Not
 */
export const updateBookmarkNote = (contentId, note) => {
  const data = getBookmarksData();
  const bookmark = data.bookmarks.find(b => b.id === contentId);
  if (bookmark) {
    bookmark.notes = note;
    saveBookmarksData(data);
  }
};

/**
 * Son okuma tarihini güncelle
 * @param {string} contentId - İçerik ID
 */
export const updateLastRead = (contentId) => {
  const data = getBookmarksData();
  const bookmark = data.bookmarks.find(b => b.id === contentId);
  if (bookmark) {
    bookmark.lastReadAt = new Date().toISOString();
    saveBookmarksData(data);
  }
};

/**
 * Yeni koleksiyon oluştur
 * @param {string} name - Koleksiyon adı
 * @param {string} color - Koleksiyon rengi
 * @returns {string} - Koleksiyon ID
 */
export const createCollection = (name, color = 'purple') => {
  const data = getBookmarksData();
  
  const collection = {
    id: `col_${Date.now()}`,
    name,
    color,
    createdAt: new Date().toISOString()
  };
  
  data.collections.push(collection);
  saveBookmarksData(data);
  return collection.id;
};

/**
 * Koleksiyonu sil
 * @param {string} collectionId - Koleksiyon ID
 */
export const deleteCollection = (collectionId) => {
  const data = getBookmarksData();
  data.collections = data.collections.filter(c => c.id !== collectionId);
  // Koleksiyondaki bookmark'ları koleksiyonsuz yap
  data.bookmarks.forEach(b => {
    if (b.collectionId === collectionId) {
      b.collectionId = null;
    }
  });
  saveBookmarksData(data);
};

/**
 * Tüm koleksiyonları getir
 * @returns {Array}
 */
export const getCollections = () => {
  const data = getBookmarksData();
  return data.collections.map(col => ({
    ...col,
    count: data.bookmarks.filter(b => b.collectionId === col.id).length
  }));
};

/**
 * Bookmark istatistiklerini getir
 * @returns {Object}
 */
export const getBookmarkStats = () => {
  const data = getBookmarksData();
  const bookmarks = data.bookmarks;
  
  const byLevel = {
    A1: bookmarks.filter(b => b.level === 'A1').length,
    A2: bookmarks.filter(b => b.level === 'A2').length,
    B1: bookmarks.filter(b => b.level === 'B1').length,
    B2: bookmarks.filter(b => b.level === 'B2').length,
    C1: bookmarks.filter(b => b.level === 'C1').length,
    C2: bookmarks.filter(b => b.level === 'C2').length
  };
  
  const recentlyRead = bookmarks
    .filter(b => b.lastReadAt)
    .sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt))
    .slice(0, 5);
  
  const recentlyAdded = bookmarks.slice(0, 5);
  
  return {
    total: bookmarks.length,
    byLevel,
    collectionsCount: data.collections.length,
    recentlyRead,
    recentlyAdded,
    withNotes: bookmarks.filter(b => b.notes && b.notes.trim()).length
  };
};

/**
 * Bookmark'ı koleksiyona taşı
 * @param {string} contentId - İçerik ID
 * @param {string} collectionId - Hedef koleksiyon ID (null = koleksiyonsuz)
 */
export const moveToCollection = (contentId, collectionId) => {
  const data = getBookmarksData();
  const bookmark = data.bookmarks.find(b => b.id === contentId);
  if (bookmark) {
    bookmark.collectionId = collectionId;
    saveBookmarksData(data);
  }
};

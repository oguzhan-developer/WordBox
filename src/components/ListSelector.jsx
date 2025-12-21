/**
 * ListSelector - Kelime listesi seçici bileşeni
 * Kelimeleri listelere ekleme/çıkarma için kullanılır
 */

import { useState, useCallback, useMemo } from 'react';
import { Plus, Check, FolderPlus, X } from 'lucide-react';
import Modal from './Modal';
import { 
  useWordLists, 
  LIST_ICONS, 
  LIST_COLORS,
  getListsForWord 
} from '../utils/wordLists';

/**
 * Liste oluşturma formu
 */
const CreateListForm = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📚');
  const [color, setColor] = useState('#6366f1');
  const [showIcons, setShowIcons] = useState(false);
  const [showColors, setShowColors] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), icon, color });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Liste Adı
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yeni liste adı..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          autoFocus
        />
      </div>

      <div className="flex gap-4">
        {/* İkon seçici */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            İkon
          </label>
          <button
            type="button"
            onClick={() => setShowIcons(!showIcons)}
            className="size-12 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-2xl hover:bg-gray-50 dark:hover:bg-white/5"
          >
            {icon}
          </button>
          {showIcons && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 grid grid-cols-5 gap-1 w-48">
              {LIST_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setIcon(i); setShowIcons(false); }}
                  className={`size-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 ${icon === i ? 'bg-brand-blue/10 ring-2 ring-brand-blue' : ''}`}
                >
                  {i}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Renk seçici */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Renk
          </label>
          <button
            type="button"
            onClick={() => setShowColors(!showColors)}
            className="size-12 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <div className="size-8 rounded-full" style={{ backgroundColor: color }} />
          </button>
          {showColors && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 grid grid-cols-5 gap-1 w-48">
              {LIST_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setColor(c); setShowColors(false); }}
                  className={`size-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-brand-blue' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-4 py-2 text-sm font-medium bg-brand-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Oluştur
        </button>
      </div>
    </form>
  );
};

/**
 * Liste seçici dropdown
 */
export const ListSelectorDropdown = ({ wordId, onClose }) => {
  const { lists, addWord, removeWord, isWordInList, create } = useWordLists();
  const [showCreate, setShowCreate] = useState(false);

  const handleToggleList = useCallback((listId) => {
    if (isWordInList(listId, wordId)) {
      removeWord(listId, wordId);
    } else {
      addWord(listId, wordId);
    }
  }, [wordId, isWordInList, addWord, removeWord]);

  const handleCreate = useCallback((listData) => {
    const newList = create(listData);
    addWord(newList.id, wordId);
    setShowCreate(false);
  }, [create, addWord, wordId]);

  if (showCreate) {
    return (
      <div className="p-4 min-w-[280px]">
        <CreateListForm 
          onSubmit={handleCreate} 
          onCancel={() => setShowCreate(false)} 
        />
      </div>
    );
  }

  return (
    <div className="py-2 min-w-[220px]">
      <div className="px-3 pb-2 mb-2 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-500 uppercase">Listelere Ekle</p>
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        {lists.map((list) => {
          const isInList = isWordInList(list.id, wordId);
          
          return (
            <button
              key={list.id}
              onClick={() => handleToggleList(list.id)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <span className="text-lg">{list.icon}</span>
              <span className="flex-1 text-sm text-left text-gray-700 dark:text-gray-300">
                {list.name}
              </span>
              {isInList && (
                <Check className="size-4 text-brand-green" />
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2 px-1">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors"
        >
          <FolderPlus className="size-4" />
          Yeni Liste Oluştur
        </button>
      </div>
    </div>
  );
};

/**
 * Liste seçici modal
 */
export const ListSelectorModal = ({ isOpen, onClose, wordId, wordName }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`"${wordName}" için listeler`}
    >
      <ListSelectorDropdown wordId={wordId} onClose={onClose} />
    </Modal>
  );
};

/**
 * Liste yönetici paneli
 */
export const ListManagerPanel = () => {
  const { lists, create, remove, update, stats } = useWordLists();
  const [showCreate, setShowCreate] = useState(false);
  const [editingList, setEditingList] = useState(null);

  const customLists = useMemo(() => 
    lists.filter(l => !l.isSystem), 
    [lists]
  );

  const handleCreate = useCallback((listData) => {
    create(listData);
    setShowCreate(false);
  }, [create]);

  const handleDelete = useCallback((listId) => {
    if (window.confirm('Bu listeyi silmek istediğinize emin misiniz?')) {
      remove(listId);
    }
  }, [remove]);

  return (
    <div className="space-y-4">
      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLists}</div>
          <div className="text-xs text-gray-500">Toplam Liste</div>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.customLists}</div>
          <div className="text-xs text-gray-500">Özel Liste</div>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWords}</div>
          <div className="text-xs text-gray-500">Listedeki Kelime</div>
        </div>
      </div>

      {/* Sistem listeleri */}
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Varsayılan Listeler</h4>
        <div className="space-y-2">
          {lists.filter(l => l.isSystem).map((list) => (
            <div
              key={list.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl"
            >
              <span className="text-xl">{list.icon}</span>
              <span className="flex-1 font-medium text-gray-700 dark:text-gray-300">{list.name}</span>
              <span className="text-xs text-gray-400">Sistem</span>
            </div>
          ))}
        </div>
      </div>

      {/* Özel listeler */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-500">Özel Listelerim</h4>
          <button
            onClick={() => setShowCreate(true)}
            className="text-xs text-brand-blue hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Plus className="size-3" />
            Yeni Ekle
          </button>
        </div>
        
        {showCreate && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
            <CreateListForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
          </div>
        )}

        {customLists.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Henüz özel liste oluşturmadınız.
          </p>
        ) : (
          <div className="space-y-2">
            {customLists.map((list) => (
              <div
                key={list.id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-700"
                style={{ borderLeftColor: list.color, borderLeftWidth: 3 }}
              >
                <span className="text-xl">{list.icon}</span>
                <div className="flex-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{list.name}</span>
                  <p className="text-xs text-gray-400">{list.wordIds?.length || 0} kelime</p>
                </div>
                <button
                  onClick={() => handleDelete(list.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Kelime kartı için liste butonu
 */
export const ListButton = ({ wordId, size = 'sm' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const wordLists = getListsForWord(wordId);
  const hasLists = wordLists.length > 0;

  const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center transition-colors ${
          hasLists 
            ? 'bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20' 
            : 'bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20'
        }`}
      >
        <FolderPlus className="size-4" />
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)} 
          />
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <ListSelectorDropdown wordId={wordId} onClose={() => setShowDropdown(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export default ListSelectorDropdown;

import { useState, useMemo } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';
import Modal from './Modal';

// Avatar kategorileri
const AVATAR_CATEGORIES = [
    { id: 'characters', label: 'Karakterler', icon: '😊' },
    { id: 'animals', label: 'Hayvanlar', icon: '🐱' },
    { id: 'nature', label: 'Doğa', icon: '🌸' },
    { id: 'objects', label: 'Nesneler', icon: '⭐' },
    { id: 'minimal', label: 'Minimal', icon: '◯' },
];

// Avatar seçenekleri
const AVATARS = {
    characters: [
        '😀', '😎', '🤓', '😊', '🥳', '😈', '🤠', '🥸',
        '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞',
        '👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍🎨', '👩‍🎨',
        '🧑‍🚀', '👨‍🚀', '👩‍🚀', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🔬', '👨‍🔬',
    ],
    animals: [
        '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
        '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦',
        '🦄', '🐝', '🦋', '🐞', '🦀', '🐙', '🦩', '🦜',
    ],
    nature: [
        '🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '💐', '🌾',
        '🍀', '🌿', '🍃', '🌱', '🌲', '🌳', '🍄', '🌵',
        '🌈', '☀️', '🌙', '⭐', '🌟', '✨', '💫', '🔥',
    ],
    objects: [
        '⭐', '🌟', '💫', '✨', '💎', '🔮', '🎯', '🏆',
        '🎨', '🎭', '🎪', '🎢', '🎡', '🎠', '🎠️', '⚽',
        '🎮', '🕹️', '🎲', '🧩', '♟️', '🎰', '🎵', '🎸',
    ],
    minimal: [
        { type: 'letter', color: 'from-indigo-500 to-purple-500' },
        { type: 'letter', color: 'from-purple-500 to-pink-500' },
        { type: 'letter', color: 'from-pink-500 to-amber-500' },
        { type: 'letter', color: 'from-amber-500 to-orange-500' },
        { type: 'letter', color: 'from-orange-500 to-red-500' },
        { type: 'letter', color: 'from-red-500 to-rose-500' },
        { type: 'letter', color: 'from-emerald-500 to-teal-500' },
        { type: 'letter', color: 'from-cyan-500 to-blue-500' },
    ]
};

// Gradient arka plan seçenekleri
const GRADIENT_BACKGROUNDS = [
    'from-indigo-500 to-purple-500',
    'from-purple-500 to-pink-500',
    'from-pink-500 to-amber-500',
    'from-amber-500 to-orange-500',
    'from-orange-500 to-red-500',
    'from-red-500 to-rose-500',
    'from-emerald-500 to-teal-500',
    'from-cyan-500 to-blue-500',
    'from-blue-500 to-indigo-500',
    'from-violet-500 to-purple-500',
    'from-fuchsia-500 to-pink-500',
    'from-rose-500 to-orange-500',
];

// Avatar bileşeni
function AvatarItem({ avatar, isSelected, onClick, type = 'emoji' }) {
    if (type === 'gradient') {
        const initial = (avatar.value || 'A')[0].toUpperCase();
        return (
            <button
                onClick={() => onClick(avatar)}
                className={`relative size-16 rounded-2xl flex items-center justify-center transition-all hover:scale-110 ${
                    isSelected ? 'ring-3 ring-amber-400 ring-offset-2' : 'hover:ring-2 ring-gray-300'
                }`}
                title={avatar.label || avatar.value}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${avatar.color} rounded-2xl`}></div>
                <span className="relative z-10 text-xl font-bold text-white">{initial}</span>
                {isSelected && (
                    <div className="absolute -top-1 -right-1 size-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={() => onClick(avatar)}
            className={`relative size-16 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-white/10 transition-all hover:scale-110 ${
                isSelected ? 'ring-3 ring-amber-400 ring-offset-2' : 'hover:ring-2 ring-gray-300'
            }`}
            title={avatar}
        >
            <span className="text-3xl">{avatar}</span>
            {isSelected && (
                <div className="absolute -top-1 -right-1 size-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3.5 h-3.5 text-white" />
                </div>
            )}
        </button>
    );
}

export default function AvatarPicker({ isOpen, onClose, currentAvatar }) {
    const { user, updateAvatar } = useUser();
    const [selectedCategory, setSelectedCategory] = useState('characters');
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '😀');
    const [showMinimal, setShowMinimal] = useState(false);

    const handleSelect = (avatar) => {
        setSelectedAvatar(avatar);
    };

    const handleSave = () => {
        updateAvatar(selectedAvatar);
        onClose();
    };

    const currentAvatars = showMinimal
        ? AVATARS.minimal.map((color, i) => ({
            value: (user.name || 'A')[0].toUpperCase(),
            color: color.color,
            label: `Minimal ${i + 1}`
        }))
        : AVATARS[selectedCategory] || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Avatarını Seç">
            <div className="space-y-6">
                {/* Kategori Seçimi */}
                <div className="flex flex-wrap gap-2">
                    {AVATAR_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => {
                                setSelectedCategory(category.id);
                                setShowMinimal(category.id === 'minimal');
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                                selectedCategory === category.id && !showMinimal && category.id !== 'minimal'
                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white shadow-lg'
                                    : category.id === 'minimal' && showMinimal
                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                            }`}
                        >
                            <span className="text-lg">{category.icon}</span>
                            <span className="text-sm">{category.label}</span>
                        </button>
                    ))}
                </div>

                {/* Avatar Grid */}
                <div className="max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-2">
                        {currentAvatars.map((avatar, i) => (
                            <AvatarItem
                                key={i}
                                avatar={avatar}
                                isSelected={selectedAvatar === (avatar.value || avatar)}
                                onClick={handleSelect}
                                type={showMinimal ? 'gradient' : 'emoji'}
                            />
                        ))}
                    </div>
                </div>

                {/* Önizleme */}
                <div className="flex items-center justify-center gap-6 p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-amber-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Şu Anki</p>
                        <div className="size-16 rounded-2xl bg-gray-50 dark:bg-white/10 flex items-center justify-center">
                            <span className="text-3xl">{currentAvatar || '😀'}</span>
                        </div>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Yeni</p>
                        <div className="relative size-16 rounded-2xl flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500">
                            {typeof selectedAvatar === 'object' ? (
                                <div className={`absolute inset-0 bg-gradient-to-br ${selectedAvatar.color} rounded-2xl`}></div>
                            ) : null}
                            <span className="relative z-10 text-3xl">
                                {typeof selectedAvatar === 'object' ? (selectedAvatar.value || 'A') : selectedAvatar}
                            </span>
                        </div>
                    </div>
                </div>

                {/* İşlemler */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Kaydet
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// Compact Avatar Picker (küçük boyutlu)
export function CompactAvatarPicker({ currentAvatar, onSelect, isOpen, onToggle }) {
    const { user } = useUser();
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '😀');

    const quickAvatars = [
        '😀', '😎', '🤓', '🥳', '🦸', '🧙', '👨‍💻', '👩‍💻',
        '🐱', '🐶', '🦊', '🐼', '🦄', '🦋', '🌸', '⭐',
    ];

    const gradientAvatars = GRADIENT_BACKGROUNDS.slice(0, 4).map((color, i) => ({
        value: (user.name || 'A')[0].toUpperCase(),
        color: color,
        label: `Minimal ${i + 1}`
    }));

    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className={`size-20 rounded-2xl flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
                    isOpen ? 'ring-4 ring-amber-400 ring-offset-2' : ''
                }`}
            >
                <span className="text-3xl">
                    {typeof currentAvatar === 'object' ? (currentAvatar.value || 'A') : currentAvatar || '😀'}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 z-50 animate-slideDown">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Avatarını Değiştir</h4>
                        <span className="material-symbols-outlined text-lg text-indigo-500">edit</span>
                    </div>

                    {/* Emoji Avatars */}
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Emoji</p>
                        <div className="grid grid-cols-8 gap-2">
                            {quickAvatars.map((avatar) => (
                                <button
                                    key={avatar}
                                    onClick={() => {
                                        setSelectedAvatar(avatar);
                                        onSelect(avatar);
                                    }}
                                    className={`size-8 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${
                                        selectedAvatar === avatar
                                            ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 ring-2 ring-amber-400'
                                            : 'bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20'
                                    }`}
                                >
                                    {avatar}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gradient Avatars */}
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Minimal</p>
                        <div className="grid grid-cols-4 gap-2">
                            {gradientAvatars.map((avatar) => (
                                <button
                                    key={avatar.label}
                                    onClick={() => {
                                        setSelectedAvatar(avatar);
                                        onSelect(avatar);
                                    }}
                                    className={`size-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-110 ${
                                        selectedAvatar === avatar
                                            ? 'ring-2 ring-amber-400'
                                            : ''
                                    }`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${avatar.color} rounded-lg`}></div>
                                    <span className="relative z-10 text-white">{avatar.value}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-700">
                        <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                            Daha fazla avatar için tam sayfayı aç →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

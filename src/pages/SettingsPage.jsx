import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

// Icons using Material Symbols
const Icon = ({ name, className = "" }) => (
    <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: "'FILL' 0" }}>
        {name}
    </span>
);

// Consistent Card Component for Settings
const SettingsCard = ({ title, description, children, icon }) => (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-200 dark:border-[#333] shadow-sm overflow-hidden">
        {(title || icon) && (
            <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 flex items-center gap-3">
                {icon && <Icon name={icon} className="text-brand-blue" />}
                <div>
                    {title && <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>}
                    {description && <p className="text-sm text-gray-500">{description}</p>}
                </div>
            </div>
        )}
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default function SettingsPage() {
    const { user, updatePreferences, updateAvatar, logout, changePassword } = useUser();
    const [activeTab, setActiveTab] = useState('account');
    const [currentPrefs, setCurrentPrefs] = useState({ ...user.preferences });
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Change Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Sync state with context when user loads
    useEffect(() => {
        if (user && user.preferences) {
            setCurrentPrefs(user.preferences);
        }
    }, [user]);

    // Generic change handler for nested prefs
    const handlePrefChange = (section, key, value) => {
        let newPrefs;
        if (section) {
            newPrefs = {
                ...currentPrefs,
                [section]: {
                    ...currentPrefs[section],
                    [key]: value
                }
            };
        } else {
            newPrefs = {
                ...currentPrefs,
                [key]: value
            };
        }
        setCurrentPrefs(newPrefs);

        // Auto-save logic (debouncing could be added here)
        // For Settings UI, instant save or "Save" button? 
        // User requested "Sticky save bar when changes occur" OR "Fast changes".
        // Let's autosave for toggle/selects for "Fast changes" feel, but maybe show a visual indicator.
        updatePreferences(newPrefs);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwords.new !== passwords.confirm) {
            setPasswordError('Yeni parolalar uyuşmuyor.');
            return;
        }

        if (passwords.new.length < 6) {
            setPasswordError('Yeni parola en az 6 karakter olmalıdır.');
            return;
        }

        setIsChangingPassword(true);
        try {
            await changePassword(passwords.current, passwords.new);
            setPasswordSuccess('Parolanız başarıyla değiştirildi.');
            setPasswords({ current: '', new: '', confirm: '' });
            // Close modal after a short delay on success
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess('');
            }, 1500);
        } catch (err) {
            setPasswordError(err.message || 'Parolanız değiştirilirken bir hata oluştu.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const sections = [
        { id: 'account', label: 'Hesap Ayarları', icon: 'person' },
        { id: 'learning', label: 'Öğrenme Tercihleri', icon: 'school' },
        { id: 'appearance', label: 'Görünüm', icon: 'palette' },
        { id: 'privacy', label: 'Gizlilik & Güvenlik', icon: 'lock' },
        { id: 'subscription', label: 'Abonelik', icon: 'credit_card' },
        { id: 'data', label: 'Veri & Dışa Aktar', icon: 'database' },
    ];

    const avatars = [
        "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
        "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka",
        "https://api.dicebear.com/7.x/notionists/svg?seed=Mila",
        "https://api.dicebear.com/7.x/notionists/svg?seed=Robert",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Precious",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Jude",
        "https://api.dicebear.com/7.x/bottts/svg?seed=1",
        "https://api.dicebear.com/7.x/bottts/svg?seed=2",
        "https://api.dicebear.com/7.x/bottts/svg?seed=3",
        "https://api.dicebear.com/7.x/bottts/svg?seed=4",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Buddy",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Ginger",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Caleb",
        "https://api.dicebear.com/7.x/micah/svg?seed=1",
        "https://api.dicebear.com/7.x/micah/svg?seed=2",
        "https://api.dicebear.com/7.x/micah/svg?seed=3",
        "https://api.dicebear.com/7.x/micah/svg?seed=4",
        "https://api.dicebear.com/7.x/lorelei/svg?seed=1",
        "https://api.dicebear.com/7.x/lorelei/svg?seed=2",
        "https://api.dicebear.com/7.x/lorelei/svg?seed=3",
        "https://api.dicebear.com/7.x/lorelei/svg?seed=4"
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <SettingsCard title="Profil Bilgileri" icon="person">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-[#333] overflow-hidden border-4 border-white dark:border-[#27272a] shadow-md">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowAvatarModal(true)}
                                        className="absolute bottom-1 right-1 p-2.5 bg-brand-blue text-white rounded-full shadow-lg hover:bg-blue-600 transition-all border-2 border-white dark:border-[#27272a]"
                                    >
                                        <Icon name="edit" className="text-sm" />
                                    </button>
                                </div>

                                <div className="flex-1 w-full space-y-4 max-w-md">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ad Soyad</label>
                                            <input
                                                type="text"
                                                defaultValue={user.name}
                                                className="w-full p-3 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-[#333] rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all dark:text-white font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">E-posta</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    defaultValue={user.email}
                                                    disabled
                                                    className="w-full p-3 bg-gray-100 dark:bg-[#18181b] border border-gray-200 dark:border-[#333] rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 flex items-center gap-1 text-[10px] font-black bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                                    <Icon name="verified" className="text-xs" /> ONAYLI
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SettingsCard>

                        <SettingsCard title="Güvenlik" icon="security">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Parola Değiştir</p>
                                    <p className="text-sm text-gray-500">Hesap güvenliğiniz için parolanızı düzenli aralıklarla güncelleyin.</p>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-6 py-2.5 bg-gray-100 dark:bg-[#18181b] hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold rounded-xl transition-all border border-gray-200 dark:border-[#333]"
                                >
                                    Parolayı Değiştir
                                </button>
                            </div>
                        </SettingsCard>
                    </div>
                );

            case 'learning':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <SettingsCard title="Öğrenme Tercihleri" icon="school" description="Yapay zeka ve içerik önerilerini kişiselleştirin.">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="font-bold text-gray-900 dark:text-white block">Günlük Hedef</label>
                                        <p className="text-sm text-gray-500">Günde kaç kelime öğrenmek istiyorsun?</p>
                                    </div>
                                    <select
                                        className="p-2 border border-gray-200 dark:border-[#444] rounded-lg bg-gray-50 dark:bg-[#333] dark:text-white font-medium outline-none focus:border-brand-blue"
                                        value={currentPrefs.dailyGoal}
                                        onChange={(e) => handlePrefChange(null, 'dailyGoal', parseInt(e.target.value))}
                                    >
                                        <option value="10">10 Kelime (Hafif)</option>
                                        <option value="20">20 Kelime (Normal)</option>
                                        <option value="30">30 Kelime (Yoğun)</option>
                                        <option value="50">50 Kelime (Çılgın)</option>
                                    </select>
                                </div>

                                <hr className="border-gray-100 dark:border-white/5" />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="font-bold text-gray-900 dark:text-white block">Zorluk Adaptasyonu</label>
                                        <p className="text-sm text-gray-500">Seviyene göre içeriği otomatik zorlaştır.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={currentPrefs.difficultyAdaptation}
                                            onChange={(e) => handlePrefChange(null, 'difficultyAdaptation', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-[#444] peer-focus:outline-none ring-offset-2 peer-focus:ring-2 peer-focus:ring-brand-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                    </label>
                                </div>

                                <hr className="border-gray-100 dark:border-white/5" />

                                <div>
                                    <label className="font-bold text-gray-900 dark:text-white block mb-4">İçerik Türleri</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { id: 'news', label: 'Haberler', icon: 'newspaper' },
                                            { id: 'stories', label: 'Hikayeler', icon: 'auto_stories' },
                                            { id: 'novels', label: 'Romanlar', icon: 'book_2' },
                                        ].map(type => (
                                            <label key={type.id} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${currentPrefs.contentTypes?.[type.id] ? 'border-brand-blue bg-blue-50/50 dark:bg-brand-blue/10 text-brand-blue' : 'border-gray-100 dark:border-[#333] hover:border-gray-200 dark:hover:border-white/10 text-gray-500 dark:text-gray-400'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={currentPrefs.contentTypes?.[type.id]}
                                                    onChange={(e) => handlePrefChange('contentTypes', type.id, e.target.checked)}
                                                />
                                                <Icon name={type.icon} className="text-2xl" />
                                                <span className="font-black text-[10px] uppercase tracking-widest">{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SettingsCard>
                    </div>
                );



            case 'appearance':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <SettingsCard title="Görünüm" icon="palette" description="Uygulama temasını ve yazı boyutunu özelleştirin.">
                            <div className="space-y-8">
                                <div>
                                    <label className="font-bold text-gray-900 dark:text-white block mb-4">Tema</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['light', 'dark'].map(theme => (
                                            <button
                                                key={theme}
                                                onClick={() => handlePrefChange(null, 'theme', theme)}
                                                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${currentPrefs.theme === theme ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-gray-100 dark:border-[#333] hover:border-white/10 text-gray-500 dark:text-gray-400'}`}
                                            >
                                                <Icon name={theme === 'light' ? 'light_mode' : 'dark_mode'} className="text-2xl" />
                                                <span className="font-black text-xs uppercase tracking-widest">{theme === 'light' ? 'Açık' : 'Koyu'}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <hr className="border-gray-100 dark:border-white/5" />

                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="font-bold text-gray-900 dark:text-white text-sm">Yazı Boyutu</label>
                                        <span className="text-brand-blue font-black text-xs uppercase tracking-widest">{currentPrefs.fontSize || 'medium'}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="3"
                                        step="1"
                                        value={currentPrefs.fontSize === 'small' ? 1 : currentPrefs.fontSize === 'large' ? 3 : 2}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            const size = val === 1 ? 'small' : val === 3 ? 'large' : 'medium';
                                            handlePrefChange(null, 'fontSize', size);
                                        }}
                                        className="w-full h-1.5 bg-gray-100 dark:bg-[#18181b] rounded-lg appearance-none cursor-pointer accent-brand-blue"
                                    />
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4 px-1">
                                        <span>Aa</span>
                                        <span className="text-gray-300 dark:text-gray-600">Aa</span>
                                        <span className="text-lg">Aa</span>
                                    </div>
                                </div>
                            </div>
                        </SettingsCard>
                    </div>
                );
            case 'data':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <SettingsCard title="Verilerini Yönet" icon="database" description="Öğrendiğin kelimeleri ve verilerini dışa aktar.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-white/5 bg-white dark:bg-[#18181b] rounded-2xl transition-all border border-gray-200 dark:border-[#333] text-left group">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Icon name="download" /></div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">Kelimeleri Dışa Aktar</div>
                                        <div className="text-xs text-gray-500">CSV formatında indir.</div>
                                    </div>
                                </button>
                                <button className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-white/5 bg-white dark:bg-[#18181b] rounded-2xl transition-all border border-gray-200 dark:border-[#333] text-left group">
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl group-hover:scale-110 transition-transform"><Icon name="history" /></div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">İlerleme Geçmişi</div>
                                        <div className="text-xs text-gray-500">JSON formatında indir.</div>
                                    </div>
                                </button>
                            </div>
                        </SettingsCard>

                        <div className="bg-red-50/50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/20 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl">
                                    <Icon name="warning" className="text-3xl" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-red-900 dark:text-red-400 uppercase tracking-widest text-sm mb-1">Tehlikeli Bölge</h3>
                                    <p className="text-sm text-red-700/70 dark:text-red-300/60 mb-0 leading-relaxed">Bu işlemler geri alınamaz. İlerlemenizin sıfırlanması veya hesabınızın silinmesi tüm verilerinizi kalıcı olarak yok eder.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <button className="px-6 py-3 bg-white dark:bg-[#18181b] border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all text-sm">
                                        Sıfırla
                                    </button>
                                    <button className="px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 text-sm">
                                        Hesabı Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div className="p-12 text-center text-gray-500">Bu bölüm yapım aşamasında...</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pt-20 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="space-y-1 sticky top-24">
                            <h1 className="text-2xl font-bold px-4 mb-6 hidden lg:block">Ayarlar</h1>
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveTab(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === section.id
                                        ? 'bg-white dark:bg-[#27272a] shadow-sm text-brand-blue ring-1 ring-gray-200 dark:ring-[#333]'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon name={section.icon} className={activeTab === section.id ? 'text-brand-blue' : 'text-gray-400'} />
                                    {section.label}
                                </button>
                            ))}

                            <div className="pt-6 mt-6 border-t border-gray-200 px-4">
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 text-red-600 hover:text-red-700 font-medium transition-colors"
                                >
                                    <Icon name="logout" />
                                    Çıkış Yap
                                </button>
                            </div>
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0">
                        <div className="lg:hidden mb-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide flex gap-2">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveTab(section.id)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === section.id
                                        ? 'bg-brand-blue text-white'
                                        : 'bg-white dark:bg-[#27272a] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#333] shadow-sm'
                                        }`}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </div>

                        {renderContent()}
                    </main>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowPasswordModal(false)} />
                    <div className="relative bg-white dark:bg-[#18181b] rounded-3xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden border border-gray-200 dark:border-[#333]">
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Parolayı Değiştir</h3>
                                <p className="text-sm text-gray-500">Güvenliğiniz için mevcut parolanızı girin.</p>
                            </div>
                            <button onClick={() => setShowPasswordModal(false)} className="size-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                <Icon name="close" />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                            {passwordError && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-3 animate-shake">
                                    <Icon name="error" className="text-lg" />
                                    {passwordError}
                                </div>
                            )}
                            {passwordSuccess && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-xl flex items-center gap-3 animate-fadeIn">
                                    <Icon name="check_circle" className="text-lg" />
                                    {passwordSuccess}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mevcut Parola</label>
                                    <input
                                        type="password"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full p-4 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-2xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Yeni Parola</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            placeholder="En az 6 karakter"
                                            className="w-full p-4 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-2xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all dark:text-white"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Yeni Parola (Tekrar)</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            placeholder="Tekrar girin"
                                            className="w-full p-4 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-2xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="w-full bg-brand-blue text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isChangingPassword ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        GÜNCELLENİYOR...
                                    </>
                                ) : (
                                    <>
                                        ŞİFREYİ GÜNCELLE
                                        <Icon name="arrow_forward" className="text-lg group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

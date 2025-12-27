import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, BookOpen, BookA, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';
import Card from '../components/Card';
import AdminWords from '../components/admin/AdminWords';
import AdminNews from '../components/admin/AdminNews';
import AdminStories from '../components/admin/AdminStories';
import AdminCategories from '../components/admin/AdminCategories';

// Admin e-posta listesi - sadece bunlar admin paneline erişebilir
const ADMIN_EMAILS = ['oguzhanfinal@gmail.com', 'admin@wordbox.com'];

export default function AdminPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('news'); // 'news' | 'stories' | 'words' | 'categories'

    // Admin kontrolü
    const isAdmin = user?.email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase());

    useEffect(() => {
        // user henüz yüklenmediyse bekle
        if (!user?.email) {
            return;
        }

        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
    }, [user?.email, isAdmin, navigate]);

    // User henüz yüklenmemişse loading göster
    if (!user?.email) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-8 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-8 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-danger mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Erişim Reddedildi
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Bu sayfaya erişim yetkiniz bulunmamaktadır.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        E-posta: {user?.email}
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-8 pb-10">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        🛠️ Admin Paneli
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Haber ve hikaye içeriklerini yönet
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'news'
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <Newspaper size={20} />
                        Haberler
                    </button>
                    <button
                        onClick={() => setActiveTab('stories')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'stories'
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <BookOpen size={20} />
                        Hikayeler
                    </button>
                    <button
                        onClick={() => setActiveTab('words')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'words'
                                ? 'bg-secondary text-white'
                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <BookA size={20} />
                        Kelimeler
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'categories'
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <Filter size={20} />
                        Kategoriler
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'news' && <AdminNews />}
                {activeTab === 'stories' && <AdminStories />}
                {activeTab === 'words' && <AdminWords />}
                {activeTab === 'categories' && (
                    <AdminCategories
                        type="news"
                        onSwitchType={(type) => {
                            // Kategori tipi değiştiğinde önce ilgili tab'a geç
                            setActiveTab(type);
                            // Ardından categories tab'ına geç
                            setTimeout(() => setActiveTab('categories'), 0);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

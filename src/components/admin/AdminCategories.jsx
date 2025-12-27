import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../Toast';
import Card from '../Card';

export default function AdminCategories({ type = 'news', onSwitchType }) {
    const toast = useToast();
    const [categories, setCategories] = useState([]);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        name_en: '',
        slug: '',
        icon: '',
        color: '#3B82F6'
    });
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        loadCategories();
    }, [type]);

    const tableName = type === 'news' ? 'news_categories' : 'story_categories';

    const loadCategories = async () => {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('name');

        if (error) {
            console.error('Error loading categories:', error);
            return;
        }
        setCategories(data || []);
    };

    const handleSaveCategory = async () => {
        try {
            if (!categoryForm.name || !categoryForm.slug) {
                toast.error('İsim ve slug gerekli!');
                return;
            }

            if (selectedItem?.id) {
                // Update
                const { error } = await supabase
                    .from(tableName)
                    .update(categoryForm)
                    .eq('id', selectedItem.id);

                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from(tableName)
                    .insert(categoryForm);

                if (error) throw error;
            }

            toast.success('Kategori kaydedildi!');
            setCategoryForm({ name: '', name_en: '', slug: '', icon: '', color: '#3B82F6' });
            setSelectedItem(null);
            loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Kategori kaydedilemedi: ' + error.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Kategori silindi!');
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Kategori silinemedi: ' + error.message);
        }
    };

    const handleSelectCategory = (cat) => {
        setCategoryForm(cat);
        setSelectedItem(cat);
    };

    return (
        <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Kategorileri Yönet
            </h2>

            {/* Tab switch for news/story categories */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => onSwitchType('news')}
                    className={`px-3 py-1 text-sm rounded ${
                        type === 'news'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-600'
                    }`}
                >
                    Haber Kategorileri
                </button>
                <button
                    onClick={() => onSwitchType('stories')}
                    className={`px-3 py-1 text-sm rounded ${
                        type === 'stories'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-600'
                    }`}
                >
                    Hikaye Kategorileri
                </button>
            </div>

            {/* Category Form */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                <input
                    type="text"
                    placeholder="Kategori Adı (TR)"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                />
                <input
                    type="text"
                    placeholder="Category Name (EN)"
                    value={categoryForm.name_en}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                />
                <input
                    type="text"
                    placeholder="slug"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                />
                <input
                    type="text"
                    placeholder="icon (emoji)"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                />
                <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                />
                <button
                    onClick={handleSaveCategory}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Kaydet
                </button>
            </div>

            {/* Categories List */}
            <div className="space-y-2">
                {categories.map(cat => (
                    <div
                        key={cat.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{cat.icon}</span>
                            <div>
                                <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                                <span className="text-gray-500 ml-2">({cat.name_en})</span>
                            </div>
                            <span
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: cat.color }}
                            />
                            <code className="text-xs bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded">
                                {cat.slug}
                            </code>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSelectCategory(cat)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

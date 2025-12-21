import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { isValidEmail, validatePassword, validateUsername, RateLimiter } from '../utils/validation';

// Rate limiter for auth attempts
const authLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes

export default function AuthPage() {
    const navigate = useNavigate();
    const { register, login, isLoggedIn } = useUser();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Navigation effect
    useEffect(() => {
        if (isLoggedIn) {
            console.log("User is logged in, navigating to dashboard.");
            navigate('/dashboard');
        }
    }, [isLoggedIn, navigate]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        level: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const translateAuthError = (error) => {
        if (!error) return 'Bir hata oluştu.';
        const message = error.message.toLowerCase();

        if (message.includes('invalid login credentials')) return 'E-posta adresi veya parola geçersiz.';
        if (message.includes('user not found')) return 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.';
        if (message.includes('email not confirmed')) return 'Lütfen e-posta adresinizi doğrulayın.';
        if (message.includes('user already registered')) return 'Bu e-posta adresi zaten kullanımda.';
        if (message.includes('password should be at least 6 characters')) return 'Parola en az 6 karakter olmalıdır.';
        if (message.includes('new password should be different')) return 'Yeni parola eskisinden farklı olmalıdır.';
        if (message.includes('too many requests')) return 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.';

        return error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate name for registration
        if (!isLogin) {
            const nameValidation = validateUsername(formData.name);
            if (!nameValidation.isValid) {
                newErrors.name = nameValidation.error;
            }
        }

        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = 'E-posta gerekli';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = 'Parola gerekli';
        } else {
            const passwordValidation = validatePassword(formData.password);
            if (!passwordValidation.isValid) {
                newErrors.password = passwordValidation.errors[0]; // Show first error
            }
        }

        // Validate level for registration
        if (!isLogin && !formData.level) {
            newErrors.level = 'Seviye seçimi gerekli';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Check rate limiting
        const attemptKey = formData.email.toLowerCase();
        if (!authLimiter.canAttempt(attemptKey)) {
            setErrors({
                main: 'Çok fazla deneme yaptınız. Lütfen 5 dakika sonra tekrar deneyin.'
            });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // Create a timeout promise to prevent infinite hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Sunucu yanıt vermiyor (Zaman aşımı). Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.'));
                }, 15000); // 15 seconds timeout
            });

            console.log("Starting auth process...");
            const authPromise = isLogin
                ? login({
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password
                })
                : register(
                    formData.name.trim(),
                    formData.email.trim().toLowerCase(),
                    formData.password,
                    formData.level
                );

            // Race the auth request against the timeout
            await Promise.race([authPromise, timeoutPromise]);
            console.log("Auth process completed (promise resolved). Waiting for effect to navigate...");
            
            // Reset rate limiter on success
            authLimiter.reset(attemptKey);

            // Note: We rely on the useEffect hook to navigate when isLoggedIn becomes true.
            // If we stop loading here, the form might flash before redirect.
            // So we DO NOT set loading to false if successful.

        } catch (error) {
            console.error('Auth Error:', error);
            setErrors(prev => ({
                ...prev,
                main: translateAuthError(error)
            }));

            if (window.navigator.onLine === false) {
                setErrors(prev => ({ ...prev, main: "İnternet bağlantısı yok." }));
            }
            setLoading(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { label: '', colorClass: 'hidden' };

        let strength = 0;
        if (password.length >= 6) strength += 1;
        if (password.length >= 10) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        if (strength <= 2) return { label: 'Zayıf', colorClass: 'text-red-500' };
        if (strength <= 3) return { label: 'Orta', colorClass: 'text-yellow-500' };
        return { label: 'Güçlü', colorClass: 'text-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="font-display text-[#181811] min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d8b4fe] to-[#ffffff] p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden min-h-[700px]">
                {/* Left Side */}
                <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center bg-gradient-to-br from-brand-blue to-purple-600 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="gradient-abstract" x1="0%" x2="100%" y1="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: 'rgb(255,255,255)', stopOpacity: 0.2 }}></stop>
                                    <stop offset="100%" style={{ stopColor: 'rgb(255,255,255)', stopOpacity: 0.05 }}></stop>
                                </linearGradient>
                            </defs>
                            <path d="M57.6,-57C69.4,-45.7,69.5,-22.8,61.9,-6.2C54.3,10.4,39.1,23.3,23.7,31.5C8.3,39.7,-7.3,43.2,-23.5,39.9C-39.7,36.7,-56.5,26.6,-61.8,9.4C-67,-7.8,-60.6,-32.1,-46.6,-44C-32.6,-55.9,-16.3,-65.3,4.4,-68.8C25.1,-72.3,50.2,-69.9,57.6,-57Z" fill="url(#gradient-abstract)" transform="translate(100 100)"></path>
                        </svg>
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="size-16 bg-white rounded-full flex items-center justify-center text-brand-blue mb-6 shadow-lg">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">Hızlı ve Etkili Öğrenme</h2>
                        <p className="text-lg font-light mb-8 max-w-md">Kanıtlanmış Başarı.</p>
                        <div className="mb-8 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 text-yellow-300">
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                            </div>
                            <p className="text-base text-gray-200">4.8/5 - 2,341 değerlendirme</p>
                            <p className="text-xl font-semibold mt-2">10,000+ öğrenci her gün yeni kelimeler öğreniyor!</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 max-w-md text-left">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-brand-blue bg-white rounded-full p-2">auto_stories</span>
                                <span className="text-sm font-medium">1000+ hikaye ve haber</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-brand-green bg-white rounded-full p-2">stadia_controller</span>
                                <span className="text-sm font-medium">Gamification sistemi</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-brand-orange bg-white rounded-full p-2">workspace_premium</span>
                                <span className="text-sm font-medium">Rozetler ve liderlik tablosu</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-purple-600 bg-white rounded-full p-2">trending_up</span>
                                <span className="text-sm font-medium">Kişiselleştirilmiş öğrenme</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Forms */}
                <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center relative">
                    <div className="w-full max-w-md">
                        {/* Tabs */}
                        <div className="flex justify-center mb-8 bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-2 text-center rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out ${isLogin ? 'text-brand-blue bg-white shadow-sm' : 'text-gray-500 hover:text-brand-blue font-medium'}`}
                            >
                                Giriş Yap
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-2 text-center rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out ${!isLogin ? 'text-brand-blue bg-white shadow-sm' : 'text-gray-500 hover:text-brand-blue font-medium'}`}
                            >
                                Kayıt Ol
                            </button>
                        </div>

                        {errors.main && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                                {errors.main}
                            </div>
                        )}

                        {/* Login Form */}
                        {isLogin && (
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <h3 className="text-2xl font-bold text-center mb-6">Hesabına Giriş Yap</h3>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                                    <input
                                        className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors bg-gray-50"
                                        placeholder="E-posta Adresin"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                                    <input
                                        className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors bg-gray-50"
                                        placeholder="Parolanız"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {showPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center text-gray-600 cursor-pointer">
                                        <input className="form-checkbox h-4 w-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue mr-2" type="checkbox" />
                                        Beni hatırla
                                    </label>
                                    <a className="text-brand-blue hover:underline font-medium" href="#">Parolamı unuttum</a>
                                </div>
                                <button className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-brand-blue to-purple-600 hover:from-purple-600 hover:to-brand-blue transition-all duration-300 ease-in-out shadow-lg" type="submit" disabled={loading}>
                                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                </button>
                                <div className="relative flex items-center justify-center py-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-300"></span>
                                    </div>
                                    <div className="relative bg-white px-4 text-sm text-gray-500">veya</div>
                                </div>
                                <button className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors" type="button">
                                    <img alt="Google logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxMi1FauqtJzS0zprATRCKzKv1-yZaeqcKg0Fu0I5yaiYVPrPNm6rsvubMDIlldlOIW3V7R7od8z4K2-YjMJKD73h3I8fEwt5gn7Ek1CgOeujkc1NNKBpVHU2rgEa53Mr-xj6alDoy-xPpzrVqfHbIppIBacnFtpQvDF5FmFoPc5dXAeLTUZu5yQRXS9oF16piAPd6Knx3K0f_UNK64cBj5-i34u409RJfVIVe2z09Lx0eEfntceHzA8hwBPOYCL9V8SyKqHnW3CU" />
                                    Google ile devam et
                                </button>
                                <button className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors" type="button">
                                    <img alt="Facebook logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPfNSztl6JrRXl1ETk8Mk_EmsuTTQmqE98pWgAntZhQUl1oFAviFgBQ7Zr9DF0U0dWOneWmppghKED10g-qL0divghAlEOwO48UlhLbitQgnMksww6FSN0ODoA9plrUrs9L4BiKQQcnFjQtb4So7GvKbKo9qpw4vH2Ozk3nwzaNtMSICDk3evOx8l489erLJoLEsNMwQCog_8aXv3WR3MRACTXAte0OKmtAWjylQK4RNLKdytXQZC_okpgkIsyapCAchdC0_QIWDk" />
                                    Facebook ile devam et
                                </button>
                                <p className="text-center text-sm text-gray-600 mt-6">
                                    Hesabın yok mu? <button className="text-brand-blue hover:underline font-medium" type="button" onClick={() => setIsLogin(false)}>Kayıt Ol</button>
                                </p>
                            </form>
                        )}

                        {/* Register Form */}
                        {!isLogin && (
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <h3 className="text-2xl font-bold text-center mb-6">Yeni Hesap Oluştur</h3>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                                    <input
                                        className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors bg-gray-50"
                                        placeholder="Adın"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                                    <input
                                        className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors bg-gray-50"
                                        placeholder="E-posta Adresin"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                                    <input
                                        className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors bg-gray-50"
                                        placeholder="Parolanız"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {showPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                    <div className="mt-2 text-sm">
                                        <span className={`font-medium ${passwordStrength.colorClass}`}>{passwordStrength.label}</span>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="level-select">İngilizce Seviyeniz:</label>
                                    <select
                                        className="w-full p-3 pl-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors bg-gray-50 appearance-none"
                                        id="level-select"
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option disabled value="">Seviye Seçin</option>
                                        <option value="A1">A1 (Başlangıç)</option>
                                        <option value="A2">A2 (Temel)</option>
                                        <option value="B1">B1 (Orta)</option>
                                        <option value="B2">B2 (Orta Üstü)</option>
                                        <option value="C1">C1 (İleri)</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-[50px] -translate-y-1/2 text-gray-400 pointer-events-none">arrow_drop_down</span>
                                    <p className="text-xs text-gray-500 mt-2">
                                        <span className="font-semibold text-brand-blue cursor-pointer group relative">
                                            Emin değilim
                                            <span className="material-symbols-outlined text-xs align-middle ml-1">help</span>
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 text-white text-xs bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48 text-center pointer-events-none">Seviye tespit testi için buraya tıklayın.</span>
                                        </span>
                                    </p>
                                    {errors.level && <p className="text-xs text-red-500 mt-1">{errors.level}</p>}
                                </div>
                                <div className="flex items-start text-sm">
                                    <input className="form-checkbox h-4 w-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue mt-1" id="terms-checkbox" required type="checkbox" />
                                    <label className="ml-2 text-gray-600" htmlFor="terms-checkbox">
                                        <a className="text-brand-blue hover:underline font-medium" href="#">Kullanım koşullarını</a> kabul ediyorum.
                                    </label>
                                </div>
                                <button className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-brand-blue to-purple-600 hover:from-purple-600 hover:to-brand-blue transition-all duration-300 ease-in-out shadow-lg" type="submit" disabled={loading}>
                                    {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                                </button>
                                <div className="relative flex items-center justify-center py-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-300"></span>
                                    </div>
                                    <div className="relative bg-white px-4 text-sm text-gray-500">veya</div>
                                </div>
                                <button className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors" type="button">
                                    <img alt="Google logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFNWgV3hX8K152779iiJfa4xvSiAu_M-cCbtQDRZeOGlUxIJ5dmTHXmscVIrfk4XQuzd02HiYNbFYGgLG9sqsu5JfapCmnM_m8hEax7RhwufglXuMiTVQ2fvRbvGfiMEgat2yDXGgebdinTsFFWWHi8kqBXU5Mj7eWg1dbBaeovDIGFYLrXt1qtTKYY71Zgb4sCwAcR1K5leGWN_JbZX_oAANlSYbhRfW_YK7JesOlnx9nWQNh7droGhV2kvt1e5nh07zzFsMOZGk" />
                                    Google ile devam et
                                </button>
                                <button className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors" type="button">
                                    <img alt="Facebook logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_JVjepB-hBCxeg2kVRTfEn_nUiKCDfrvHbAP7alivN7f_TUKWF7SkrhLJoL09YFFdmtn27gUbCbhZwyjBCFtCAjkxvtu-irC_IE6bdes4Y38s-kJyzmeTa8raOOMrjHFyhcO_JidXCrFNMAmA3oc7i7qNElZWYrkP6999l4pfGDzbhQ3azXGjQkj3dIOoSnPqZ8rlqW8jhYxJDeeejX8i_Gbs_aY7XOspGnctH1vC4M0suXMnItSY1HHUjNjcqvHAKFSPx_QRZ34" />
                                    Facebook ile devam et
                                </button>
                                <p className="text-center text-sm text-gray-600 mt-6">
                                    Zaten hesabın var mı? <button className="text-brand-blue hover:underline font-medium" type="button" onClick={() => setIsLogin(true)}>Giriş Yap</button>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

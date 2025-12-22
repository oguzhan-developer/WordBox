import { Component } from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (import.meta.env.MODE === 'development') {
            console.error('Error Boundary caught an error:', error, errorInfo);
        }

        // Update state with error details
        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));

        // In production, you would send this to an error reporting service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Prevent infinite error loops
            if (this.state.errorCount > 5) {
                return (
                    <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] flex items-center justify-center p-4">
                        <div className="max-w-md w-full text-center">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Kritik Hata
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Çok fazla hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.
                            </p>
                            <button
                                onClick={this.handleReload}
                                className="w-full px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                            >
                                Sayfayı Yenile
                            </button>
                        </div>
                    </div>
                );
            }

            // Custom fallback UI can be passed via props
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-lg border border-gray-200 dark:border-[#333] p-8">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">😔</div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Bir Şeyler Yanlış Gitti
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
                                </p>
                            </div>

                            {/* Error details (development only) */}
                            {import.meta.env.MODE === 'development' && this.state.error && (
                                <details className="mb-6">
                                    <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        Hata Detayları (Geliştirici)
                                    </summary>
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-xs">
                                        <p className="font-mono text-red-900 dark:text-red-200 mb-2">
                                            {this.state.error.toString()}
                                        </p>
                                        {this.state.errorInfo && (
                                            <pre className="text-red-700 dark:text-red-300 overflow-auto">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        )}
                                    </div>
                                </details>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={this.handleReset}
                                    className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Tekrar Dene
                                </button>
                                <button
                                    onClick={this.handleReload}
                                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Sayfayı Yenile
                                </button>
                            </div>

                            {/* Go home link */}
                            <div className="mt-4 text-center">
                                <a
                                    href="/dashboard"
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Ana Sayfaya Dön
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

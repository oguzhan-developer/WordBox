/**
 * Skeleton loading components for better UX
 */

// Base Skeleton component
export function Skeleton({ className = '', width = 'w-full', height = 'h-4', ...props }) {
    return (
        <div
            className={`relative overflow-hidden rounded ${width} ${height} ${className}`}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-shimmer" 
                style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite'
                }}
            />
        </div>
    );
}

// Skeleton for cards
export function SkeletonCard({ className = '' }) {
    return (
        <div className={`glass rounded-2xl p-6 shadow-lg ${className}`}>
            <div className="space-y-4">
                <Skeleton height="h-6" width="w-3/4" />
                <Skeleton height="h-4" width="w-full" />
                <Skeleton height="h-4" width="w-5/6" />
                <div className="flex gap-2 mt-4">
                    <Skeleton height="h-8" width="w-20" className="rounded-full" />
                    <Skeleton height="h-8" width="w-20" className="rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Skeleton for vocabulary cards
export function SkeletonVocabularyCard() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <Skeleton height="h-5" width="w-16" className="rounded-full" />
                <div className="flex gap-2">
                    <Skeleton height="h-8" width="w-8" className="rounded-lg" />
                    <Skeleton height="h-8" width="w-8" className="rounded-lg" />
                </div>
            </div>
            <div className="text-center space-y-3">
                <Skeleton height="h-8" width="w-32" className="mx-auto" />
                <Skeleton height="h-4" width="w-24" className="mx-auto" />
                <Skeleton height="h-3" width="w-16" className="mx-auto" />
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Skeleton height="h-5" width="w-20" className="rounded-full" />
                <Skeleton height="h-3" width="w-32" />
            </div>
        </div>
    );
}

// Skeleton for list items
export function SkeletonListItem() {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Skeleton height="h-5" width="w-5" className="rounded" />
            <div className="flex-1 space-y-2">
                <Skeleton height="h-5" width="w-32" />
                <Skeleton height="h-4" width="w-48" />
            </div>
            <div className="hidden sm:flex gap-2">
                <Skeleton height="h-6" width="w-12" className="rounded-full" />
                <Skeleton height="h-6" width="w-12" className="rounded-full" />
            </div>
            <Skeleton height="h-8" width="w-8" className="rounded-lg" />
        </div>
    );
}

// Skeleton for content cards (articles/stories)
export function SkeletonContentCard() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <Skeleton height="h-48" width="w-full" className="rounded-none" />
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton height="h-5" width="w-16" className="rounded-full" />
                    <Skeleton height="h-5" width="w-20" className="rounded-full" />
                </div>
                <Skeleton height="h-6" width="w-full" />
                <Skeleton height="h-4" width="w-full" />
                <Skeleton height="h-4" width="w-3/4" />
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Skeleton height="h-4" width="w-24" />
                    <Skeleton height="h-4" width="w-16" />
                </div>
            </div>
        </div>
    );
}

// Skeleton for stats/dashboard cards
export function SkeletonStatCard() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <Skeleton height="h-12" width="w-12" className="rounded-xl" />
                <Skeleton height="h-6" width="w-16" className="rounded" />
            </div>
            <Skeleton height="h-8" width="w-20" className="mb-2" />
            <Skeleton height="h-4" width="w-32" />
        </div>
    );
}

// Skeleton for progress bars
export function SkeletonProgressBar() {
    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <Skeleton height="h-4" width="w-24" />
                <Skeleton height="h-4" width="w-12" />
            </div>
            <Skeleton height="h-2" width="w-full" className="rounded-full" />
        </div>
    );
}

// Skeleton for badges grid
export function SkeletonBadge() {
    return (
        <div className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Skeleton height="h-16" width="w-16" className="rounded-full" />
            <div className="text-center space-y-1 w-full">
                <Skeleton height="h-4" width="w-20" className="mx-auto" />
                <Skeleton height="h-3" width="w-full" />
            </div>
        </div>
    );
}

// Skeleton for navigation/navbar
export function SkeletonNav() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Skeleton height="h-8" width="w-32" />
                    <div className="flex items-center gap-6">
                        <Skeleton height="h-8" width="w-20" />
                        <Skeleton height="h-8" width="w-20" />
                        <Skeleton height="h-10" width="w-10" className="rounded-full" />
                    </div>
                </div>
            </div>
        </nav>
    );
}

// Full page skeleton loader
export function SkeletonPage({ title = true, stats = false, cards = 3 }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-8 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {title && (
                    <div className="mb-8 space-y-2">
                        <Skeleton height="h-10" width="w-64" />
                        <Skeleton height="h-5" width="w-96" />
                    </div>
                )}
                
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonStatCard key={i} />
                        ))}
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: cards }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Skeleton;

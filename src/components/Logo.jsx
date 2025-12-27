import { Link } from 'react-router-dom';

const sizeMap = {
    sm: 'size-10 text-sm',
    md: 'size-12 text-base',
    lg: 'size-14 text-lg',
};

export function Logo({ withText = true, size = 'md', to = '/dashboard' }) {
    const sizeClass = sizeMap[size] || sizeMap.md;

    return (
        <Link to={to} className="flex items-center gap-3 group">
            <div className={`relative ${sizeClass} rounded-2xl overflow-hidden shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35)] bg-gradient-to-br from-primary via-purple to-accent text-black transition-transform group-hover:-translate-y-0.5`}>
                <div className="absolute inset-0 bg-white/20 blur-md" aria-hidden="true" />
                <div className="absolute inset-[4px] rounded-xl bg-gradient-to-br from-white/80 via-primary/50 to-white/50 opacity-70" aria-hidden="true" />
                <div className="relative h-full w-full flex items-center justify-center font-black tracking-tight">
                    <span className="text-[#1f1f1f] drop-shadow-sm">WB</span>
                </div>
                <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-white/90 border border-white/60 shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px] text-accent">auto_awesome</span>
                </div>
            </div>
            {withText && (
                <div className="flex flex-col leading-tight">
                    <span className="text-xl font-black text-[#1f1f1f] dark:text-white tracking-tight">WordBox</span>
                    <span className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-[0.14em]">vocabulary lab</span>
                </div>
            )}
        </Link>
    );
}

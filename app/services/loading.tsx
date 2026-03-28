export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Hero Skeleton — premium shimmer */}
            <div className="relative h-[70vh] bg-gradient-to-br from-marine-900/30 to-slate-900/40 dark:from-marine-950/60 dark:to-slate-950/70 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-5 px-4 w-full max-w-2xl">
                        <div className="h-7 w-40 mx-auto bg-white/15 rounded-full animate-pulse" />
                        <div className="h-14 w-[80%] mx-auto bg-white/10 rounded-2xl animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="h-14 w-[60%] mx-auto bg-white/10 rounded-2xl animate-pulse" style={{ animationDelay: '300ms' }} />
                        <div className="h-5 w-[50%] mx-auto bg-white/8 rounded-lg animate-pulse" style={{ animationDelay: '450ms' }} />
                    </div>
                </div>
            </div>

            {/* Stats Bar Skeleton */}
            <div className="bg-gradient-to-b from-marine-900/20 to-transparent py-8">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 justify-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl">
                            <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                            <div className="space-y-2">
                                <div className="h-7 w-14 bg-white/12 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                                <div className="h-3 w-20 bg-white/8 rounded animate-pulse" style={{ animationDelay: `${i * 100 + 100}ms` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Core Services Section Skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-20 space-y-10">
                <div className="text-center space-y-4">
                    <div className="h-6 w-36 mx-auto bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="h-10 w-80 max-w-full mx-auto bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" style={{ animationDelay: '100ms' }} />
                    <div className="h-1 w-24 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="group relative bg-white dark:bg-slate-800/80 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-700/50" style={{ animationDelay: `${i * 100}ms` }}>
                            {/* Image skeleton */}
                            <div className="h-52 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" style={{ animationDelay: `${i * 200}ms` }} />
                            </div>
                            {/* Content skeleton */}
                            <div className="p-6 space-y-4">
                                <div className="h-6 w-3/5 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                    <div className="h-3 w-4/5 bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                </div>
                                {/* Feature pills skeleton */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <div className="h-7 w-28 bg-gray-100 dark:bg-slate-700/50 rounded-full animate-pulse" />
                                    <div className="h-7 w-24 bg-gray-100 dark:bg-slate-700/50 rounded-full animate-pulse" />
                                    <div className="h-7 w-20 bg-gray-100 dark:bg-slate-700/50 rounded-full animate-pulse" />
                                </div>
                                {/* CTA skeleton */}
                                <div className="h-5 w-28 bg-orange-100 dark:bg-orange-900/20 rounded-lg animate-pulse mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Specialized Cargo Skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center space-y-3 mb-10">
                    <div className="h-6 w-44 mx-auto bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="h-9 w-72 max-w-full mx-auto bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-64 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/50 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700/50 p-6 space-y-4 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" style={{ animationDelay: `${i * 300}ms` }} />
                            <div className="w-14 h-14 bg-gray-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                            <div className="h-6 w-2/3 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                <div className="h-3 w-4/5 bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fleet Skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-[420px] bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700/50 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" style={{ animationDelay: `${i * 400}ms` }} />
                            <div className="h-56 bg-gray-200 dark:bg-slate-700 animate-pulse" />
                            <div className="p-6 space-y-4">
                                <div className="h-7 w-2/3 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                                <div className="h-4 w-full bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

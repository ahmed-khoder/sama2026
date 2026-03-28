export default function Loading() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden">
            {/* Hero Skeleton — premium shimmer */}
            <div className="relative min-h-[80vh] bg-gradient-to-br from-marine-900/30 to-slate-900/40 dark:from-marine-950/60 dark:to-slate-950/70 overflow-hidden pt-20">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
                <div className="container mx-auto px-4 relative z-10 flex items-center min-h-[60vh]">
                    <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
                        <div className="max-w-2xl space-y-8">
                            {/* Badge */}
                            <div className="h-10 w-52 bg-white/12 rounded-full animate-pulse" />
                            {/* Title */}
                            <div className="h-20 w-[90%] bg-white/10 rounded-2xl animate-pulse" style={{ animationDelay: '100ms' }} />
                            {/* Description */}
                            <div className="space-y-2">
                                <div className="h-5 w-full bg-white/8 rounded-lg animate-pulse" style={{ animationDelay: '200ms' }} />
                                <div className="h-5 w-[80%] bg-white/8 rounded-lg animate-pulse" style={{ animationDelay: '300ms' }} />
                            </div>
                            {/* Stats */}
                            <div className="flex flex-wrap gap-8 md:gap-16 pt-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="text-center space-y-2">
                                        <div className="h-12 w-16 mx-auto bg-white/12 rounded-xl animate-pulse" style={{ animationDelay: `${400 + i * 100}ms` }} />
                                        <div className="h-3 w-14 mx-auto bg-white/8 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Skeleton */}
            <div className="py-20 bg-gray-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 space-y-3">
                        <div className="h-9 w-72 mx-auto bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                        <div className="h-1.5 w-24 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center space-y-4 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" style={{ animationDelay: `${i * 150}ms` }} />
                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl animate-pulse" />
                                <div className="h-5 w-3/4 mx-auto bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Sama Skeleton */}
            <div className="py-20 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                        {/* Stacked cards skeleton */}
                        <div className="relative h-[400px] flex items-center justify-center">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-72 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 space-y-4"
                                    style={{
                                        transform: `rotate(${(i - 1) * 8}deg) translate(${(i - 1) * 20}px, ${(i - 1) * 10}px)`,
                                        zIndex: 3 - i
                                    }}
                                >
                                    <div className="w-14 h-14 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                                    <div className="h-3 w-full bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                        {/* Right content */}
                        <div className="space-y-6">
                            <div className="h-7 w-28 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                            <div className="h-10 w-[85%] bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                <div className="h-4 w-[90%] bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                <div className="h-4 w-[70%] bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                            </div>
                            <div className="h-14 w-40 bg-orange-100 dark:bg-orange-900/20 rounded-xl animate-pulse mt-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs Skeleton */}
            <div className="py-20 bg-gray-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 space-y-3">
                        <div className="h-9 w-64 mx-auto bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                        <div className="h-1.5 w-24 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-full" />
                    </div>
                    <div className="max-w-4xl mx-auto space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" style={{ animationDelay: `${i * 200}ms` }} />
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                                        <div className="space-y-3">
                                            <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                                            <div className="flex gap-3">
                                                <div className="h-6 w-24 bg-gray-100 dark:bg-slate-700/60 rounded-full animate-pulse" />
                                                <div className="h-6 w-20 bg-gray-100 dark:bg-slate-700/60 rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-5 w-24 bg-orange-100 dark:bg-orange-900/20 rounded-lg animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Hero Skeleton — premium shimmer */}
            <div className="relative h-[70vh] md:h-[80vh] bg-gradient-to-br from-marine-900/30 to-slate-900/40 dark:from-marine-950/60 dark:to-slate-950/70 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
                <div className="container mx-auto px-4 relative z-10 flex items-center h-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
                        <div className="max-w-2xl space-y-6">
                            <div className="h-8 w-56 bg-white/12 rounded-full animate-pulse" />
                            <div className="space-y-3">
                                <div className="h-16 w-[85%] bg-white/10 rounded-2xl animate-pulse" style={{ animationDelay: '100ms' }} />
                                <div className="h-16 w-[65%] bg-white/10 rounded-2xl animate-pulse" style={{ animationDelay: '200ms' }} />
                            </div>
                            <div className="h-5 w-[70%] bg-white/8 rounded-lg animate-pulse" style={{ animationDelay: '300ms' }} />
                            <div className="flex gap-4 pt-4">
                                <div className="h-14 w-40 bg-white/12 rounded-xl animate-pulse" />
                                <div className="h-14 w-40 bg-white/8 rounded-xl animate-pulse" style={{ animationDelay: '100ms' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="relative -mt-20 z-20 pb-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-slate-800 text-center overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" style={{ animationDelay: `${i * 150}ms` }} />
                                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-xl animate-pulse" />
                                <div className="h-10 w-16 mx-auto mb-2 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                                <div className="h-3 w-20 mx-auto bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Vision & Mission Skeleton */}
            <div className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="p-8 md:p-10 rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 space-y-6 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" style={{ animationDelay: `${i * 300}ms` }} />
                                <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                                <div className="h-8 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                    <div className="h-4 w-[90%] bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                    <div className="h-4 w-[75%] bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Core Values Skeleton */}
            <div className="py-20 bg-gray-50 dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 space-y-3">
                        <div className="h-6 w-32 mx-auto bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                        <div className="h-9 w-56 mx-auto bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-full" />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" style={{ animationDelay: `${i * 150}ms` }} />
                                <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                                <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                    <div className="h-3 w-5/6 bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline Skeleton */}
            <div className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 space-y-3">
                        <div className="h-6 w-28 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full animate-pulse" />
                        <div className="h-9 w-52 mx-auto bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex gap-6 items-start">
                                <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-2xl animate-pulse flex-shrink-0" style={{ animationDelay: `${i * 200}ms` }} />
                                <div className="flex-1 space-y-3 pt-2">
                                    <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                                    <div className="h-4 w-3/4 bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

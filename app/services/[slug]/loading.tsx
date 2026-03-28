export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Breadcrumb Skeleton */}
            <div className="border-b border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-14 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                        <div className="h-4 w-2 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                        <div className="h-4 w-2 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                        <div className="h-4 w-28 bg-orange-100 dark:bg-orange-900/20 rounded animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Hero Image Skeleton */}
            <div className="relative w-full h-[70vh] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="container mx-auto">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-md animate-pulse" />
                            <div className="space-y-3">
                                <div className="h-12 w-72 bg-white/15 rounded-xl animate-pulse" />
                                <div className="h-5 w-56 bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: '150ms' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section Skeleton */}
            <div className="py-8 border-b border-gray-200 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="text-center p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" style={{ animationDelay: `${i * 150}ms` }} />
                                <div className="w-8 h-8 mx-auto mb-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg animate-pulse" />
                                <div className="h-8 w-14 mx-auto mb-1 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                                <div className="h-3 w-16 mx-auto bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content Skeleton */}
            <div className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Tabs */}
                            <div className="flex gap-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-2xl">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex-1 h-12 bg-white dark:bg-slate-700 rounded-xl animate-pulse" style={{ animationDelay: `${i * 80}ms`, opacity: i === 0 ? 1 : 0.5 }} />
                                ))}
                            </div>
                            {/* Content */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-slate-700 space-y-6">
                                <div className="h-10 w-48 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="h-4 bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" style={{ width: `${100 - i * 8}%`, animationDelay: `${i * 80}ms` }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* CTA Card */}
                            <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-3xl p-8 space-y-4">
                                <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800/30 rounded-xl animate-pulse" />
                                <div className="h-8 w-3/4 bg-orange-200 dark:bg-orange-800/30 rounded-lg animate-pulse" />
                                <div className="h-4 w-full bg-orange-100 dark:bg-orange-900/20 rounded animate-pulse" />
                                <div className="space-y-3 pt-2">
                                    <div className="h-14 w-full bg-white dark:bg-slate-700 rounded-xl animate-pulse" />
                                    <div className="h-14 w-full bg-white/50 dark:bg-slate-700/50 rounded-xl animate-pulse" />
                                </div>
                            </div>
                            {/* Other Services */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-slate-700 space-y-4">
                                <div className="h-6 w-36 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700/60 rounded-lg animate-pulse flex-shrink-0" />
                                        <div className="h-4 flex-1 bg-gray-100 dark:bg-slate-700/60 rounded animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
                        <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-6" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
                                <div className="h-3 w-1/2 bg-gray-200 dark:bg-slate-700 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

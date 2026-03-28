export default function CustomersLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-10 w-28 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {/* Table header */}
                <div className="flex gap-4 p-4 border-b border-gray-100 dark:border-slate-700">
                    {[120, 200, 160, 100].map((w, i) => (
                        <div key={i} className="h-4 bg-gray-200 dark:bg-slate-700 rounded" style={{ width: w }} />
                    ))}
                </div>
                {/* Table rows */}
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 border-b border-gray-50 dark:border-slate-700/50">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-40 bg-gray-200 dark:bg-slate-700 rounded" />
                            <div className="h-3 w-28 bg-gray-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                        <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

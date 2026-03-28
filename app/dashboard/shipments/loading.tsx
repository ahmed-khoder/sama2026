export default function ShipmentsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                <div className="flex gap-3">
                    <div className="h-10 w-28 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-10 w-28 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                </div>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-7 w-14 bg-gray-200 dark:bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50 dark:border-slate-700/50">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded flex-1" />
                        <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-full" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

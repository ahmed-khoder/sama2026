export default function StorageLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-700" />
                <div className="space-y-2">
                    <div className="w-48 h-6 rounded-lg bg-gray-200 dark:bg-slate-700" />
                    <div className="w-72 h-4 rounded-lg bg-gray-200 dark:bg-slate-700" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-slate-700" />
                ))}
            </div>
            <div className="h-16 rounded-2xl bg-gray-200 dark:bg-slate-700" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-slate-700" />
                ))}
            </div>
        </div>
    );
}

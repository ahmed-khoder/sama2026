export default function BlogLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-10 w-36 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="h-48 bg-gray-200 dark:bg-slate-700" />
                        <div className="p-5 space-y-3">
                            <div className="h-5 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
                            <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded" />
                            <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

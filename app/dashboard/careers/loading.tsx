export default function CareersLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-44 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-10 w-36 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                            <div className="space-y-2 flex-1">
                                <div className="h-5 w-2/3 bg-gray-200 dark:bg-slate-700 rounded" />
                                <div className="h-3 w-1/3 bg-gray-200 dark:bg-slate-700 rounded" />
                            </div>
                        </div>
                        <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

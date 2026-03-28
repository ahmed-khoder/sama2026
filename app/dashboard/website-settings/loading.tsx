export default function WebsiteSettingsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-52 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 pb-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                ))}
            </div>
            {/* Tab content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded" />
                            <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded-lg" />
                        </div>
                    ))}
                </div>
                {/* Preview area */}
                <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-2xl" />
            </div>
        </div>
    );
}

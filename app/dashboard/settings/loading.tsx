export default function SettingsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-36 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 space-y-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded" />
                        <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded-lg" />
                    </div>
                ))}
                <div className="h-12 w-40 bg-gray-200 dark:bg-slate-700 rounded-xl" />
            </div>
        </div>
    );
}

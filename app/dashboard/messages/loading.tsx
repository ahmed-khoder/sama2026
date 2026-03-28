export default function MessagesLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-36 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-5">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
                                <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
                            </div>
                            <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded" />
                            <div className="h-3 w-2/3 bg-gray-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AppLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700" />
                    <div className="absolute inset-0 rounded-full border-4 border-brand-orange border-t-transparent animate-spin" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
}

export default function JobLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 md:p-8">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                  <div className="h-5 bg-gray-200 rounded w-32" />
                </div>
              ))}
            </div>
            <div className="space-y-3 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
        <aside className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <div className="h-5 bg-gray-200 rounded w-24 mb-3" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded mb-2" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

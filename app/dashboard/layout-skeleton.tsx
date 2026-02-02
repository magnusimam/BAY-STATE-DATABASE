export function DashboardLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background dark flex animate-pulse">
      <aside className="hidden md:flex w-64 border-r border-border bg-secondary/20" />
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border bg-secondary/20" />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="h-8 bg-secondary/20 rounded mb-4 w-1/3" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary/20 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

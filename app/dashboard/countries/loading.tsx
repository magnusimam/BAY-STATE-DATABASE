import { Card } from '@/components/ui/card'

export default function CountriesLoading() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-10 bg-secondary/20 rounded w-1/3" />
        <div className="h-4 bg-secondary/20 rounded w-1/4" />
      </div>

      {/* Search skeleton */}
      <div className="h-10 bg-secondary/20 rounded" />

      {/* Chart skeleton */}
      <Card className="bg-card border-border p-6">
        <div className="mb-6 space-y-2">
          <div className="h-6 bg-secondary/20 rounded w-1/3" />
          <div className="h-4 bg-secondary/20 rounded w-1/4" />
        </div>
        <div className="h-72 bg-secondary/20 rounded" />
      </Card>

      {/* Countries grid skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-secondary/20 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-card border-border p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-secondary/20 rounded w-3/4" />
                  <div className="h-4 bg-secondary/20 rounded w-1/2" />
                </div>
                <div className="h-5 w-5 bg-secondary/20 rounded" />
              </div>
              <div className="h-12 bg-secondary/20 rounded" />
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-3 bg-secondary/20 rounded" />
                    <div className="h-4 bg-secondary/20 rounded" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="h-4 bg-secondary/20 rounded w-1/2" />
                <div className="h-6 bg-secondary/20 rounded w-1/4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

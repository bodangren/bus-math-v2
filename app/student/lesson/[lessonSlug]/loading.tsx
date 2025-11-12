/**
 * Loading state for lesson page
 * Displayed while lesson data is being fetched from database
 */
export default function LessonLoading() {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Lesson Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-20 bg-muted rounded mb-2" />
          <div className="h-10 w-3/4 bg-muted rounded mb-4" />
          <div className="h-6 w-full bg-muted rounded mb-2" />
          <div className="h-6 w-5/6 bg-muted rounded mb-4" />
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="h-5 w-40 bg-muted rounded mb-2" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-4/5 bg-muted rounded" />
            </div>
          </div>
        </div>

        {/* Phase Skeletons */}
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 animate-pulse">
              <div className="flex items-baseline gap-3 mb-4">
                <div className="h-5 w-16 bg-muted rounded" />
                <div className="h-7 w-48 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded ml-auto" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

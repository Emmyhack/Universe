import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
    />
  );
};

export const CandidateCardSkeleton = () => {
  return (
    <div className="card">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start space-x-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Platform Preview */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-24 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </div>

        {/* Manifesto */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Skeleton className="h-4 w-24" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ElectionCardSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-64" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Elections */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <ElectionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const CandidateListSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-32 rounded-lg" />
        ))}
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <CandidateCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const VotingPageSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Election Info Card */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>

      {/* Candidate Selection */}
      <div className="card">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-52" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-1">
                      <Skeleton className="h-6 w-32 rounded" />
                      <Skeleton className="h-6 w-28 rounded" />
                      <Skeleton className="h-6 w-24 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex flex-col space-y-2">
                  <Skeleton className="h-9 w-36" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
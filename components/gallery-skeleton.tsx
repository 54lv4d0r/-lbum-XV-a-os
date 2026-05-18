export function GallerySkeleton() {
  const skeletonHeights = [
    "h-48 sm:h-56 md:h-64",
    "h-64 sm:h-72 md:h-80",
    "h-56 sm:h-64 md:h-72",
    "h-72 sm:h-80 md:h-96",
    "h-52 sm:h-60 md:h-68",
    "h-48 sm:h-56 md:h-64",
    "h-64 sm:h-72 md:h-80",
    "h-56 sm:h-64 md:h-72",
  ]

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {skeletonHeights.map((height, index) => (
        <div
          key={index}
          className={`break-inside-avoid ${height} w-full rounded-xl bg-muted animate-pulse`}
        />
      ))}
    </div>
  )
}

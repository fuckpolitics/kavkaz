export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4" aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-card bg-border/60"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}

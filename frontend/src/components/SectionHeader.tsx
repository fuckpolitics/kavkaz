export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 tablet:mb-8 tablet:flex-row tablet:items-end tablet:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary desktop:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-text-secondary">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

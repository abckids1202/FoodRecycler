export default function PageHeader({ title, eyebrow, description, actions }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-700">{eyebrow}</p>}
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-forest-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-3xl text-base leading-7 text-ink/70">{description}</p>}
      </div>
      {actions && <div className="grid gap-3 sm:flex sm:flex-wrap sm:justify-end">{actions}</div>}
    </div>
  );
}

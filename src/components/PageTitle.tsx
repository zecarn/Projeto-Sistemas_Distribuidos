type PageTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageTitle({ eyebrow, title, description }: PageTitleProps) {
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">{eyebrow}</p>}
      <h1 className="text-4xl font-bold tracking-tight text-emerald-950">{title}</h1>
      {description && <p className="mt-3 text-black/60">{description}</p>}
    </div>
  );
}

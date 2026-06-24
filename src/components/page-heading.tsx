export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">{eyebrow}</p>
      <h1 className="text-4xl font-bold tracking-tight text-emerald-950">{title}</h1>
      <p className="mt-3 text-black/60">{description}</p>
    </div>
  );
}

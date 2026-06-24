export function Loading({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="card flex items-center justify-center gap-3 text-black/55">
      <span className="spinner text-emerald-800" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

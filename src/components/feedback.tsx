export function Feedback({ error }: { error: string }) {
  if (!error) return null;
  return <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
}

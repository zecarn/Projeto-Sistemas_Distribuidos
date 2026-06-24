export function Feedback({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <>
      {error && (
        <p role="alert" className="alert alert-error">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="alert alert-success">
          {success}
        </p>
      )}
    </>
  );
}

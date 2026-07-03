export default function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  // janela de páginas ao redor da atual
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="pagination">
      <button className="btn btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Anterior</button>
      {start > 1 && (
        <>
          <button className="btn btn-sm" onClick={() => onChange(1)}>1</button>
          {start > 2 && <span className="muted">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : ''}`} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="muted">…</span>}
          <button className="btn btn-sm" onClick={() => onChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Próxima →</button>
    </div>
  );
}

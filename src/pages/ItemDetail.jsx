import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ItemThumb from '../components/ItemThumb.jsx';
import { metadataFields } from '../components/MetadataFields.jsx';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);

  useEffect(() => {
    api.get(`/items/${id}`).then((res) => setItem(res.data.item));
  }, [id]);

  if (!item) return <div className="spinner">Carregando…</div>;

  const s = item.stats || {};
  const fields = metadataFields(item.type).filter((f) => item.metadata?.[f.key]);
  const isOwner = user && item.createdBy === user._id;

  return (
    <>
      <div className="page-head">
        <h1>{item.name}</h1>
        {isOwner && <Link to={`/item/${id}/editar`} className="btn btn-sm">✏ Editar</Link>}
      </div>

      <div className="row" style={{ alignItems: 'flex-start', gap: 24 }}>
        <div style={{ width: 220, flexShrink: 0 }}>
          <ItemThumb item={item} />
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <p>
            <span className="tag tag-type">{item.type}</span>
            {(item.categories || []).map((c) => <span key={c._id} className="tag">{c.name}</span>)}
          </p>

          {fields.length > 0 && (
            <div className="mt">
              {fields.map((f) => (
                <p key={f.key} className="muted" style={{ marginBottom: 4 }}>
                  <b style={{ color: 'var(--text)' }}>{f.label}:</b>{' '}
                  {String(item.metadata[f.key]).startsWith('http') ? (
                    <a href={item.metadata[f.key]} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>
                      {item.metadata[f.key]}
                    </a>
                  ) : (
                    item.metadata[f.key]
                  )}
                </p>
              ))}
            </div>
          )}

          <div className="stats-grid mt">
            <div className="stat-box"><div className="value">⚡ {s.elo ?? 1000}</div><div className="label">ELO</div></div>
            <div className="stat-box"><div className="value">{s.timesRanked || 0}</div><div className="label">sessões</div></div>
            <div className="stat-box"><div className="value">{s.winCount || 0}</div><div className="label">vezes campeão</div></div>
            <div className="stat-box"><div className="value">{s.averageRankPosition ?? '—'}</div><div className="label">posição média</div></div>
            <div className="stat-box"><div className="value">{s.winRate != null ? `${s.winRate}%` : '—'}</div><div className="label">taxa de vitória (duelos)</div></div>
          </div>
        </div>
      </div>
    </>
  );
}

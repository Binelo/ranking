import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Comments({ rankId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/comments', { params: { rank: rankId } }).then((res) => setComments(res.data.comments));
  }, [rankId]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/comments', { rank: rankId, text });
      setComments((prev) => [res.data.comment, ...prev]);
      setText('');
    } catch (err) {
      setError(errMsg(err));
    }
  }

  async function remove(id) {
    await api.delete(`/comments/${id}`);
    setComments((prev) => prev.filter((c) => c._id !== id));
  }

  return (
    <div className="mt">
      <h2 style={{ marginBottom: 12 }}>💬 Comentários ({comments.length})</h2>
      {user ? (
        <form onSubmit={submit} className="mb">
          {error && <div className="error-box">{error}</div>}
          <textarea
            className="input"
            placeholder="Discorda do resultado? Comenta aí…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-primary btn-sm mt" style={{ marginTop: 8 }} disabled={!text.trim()}>
            Comentar
          </button>
        </form>
      ) : (
        <p className="muted mb">Entre na sua conta para comentar.</p>
      )}
      {comments.map((c) => (
        <div key={c._id} className="comment">
          <div className="head">
            <span><b>@{c.author?.username || 'usuário'}</b> · {new Date(c.createdAt).toLocaleString('pt-BR')}</span>
            {user && c.author?._id === user._id && (
              <button className="btn btn-ghost btn-sm" onClick={() => remove(c._id)}>Excluir</button>
            )}
          </div>
          <p>{c.text}</p>
        </div>
      ))}
      {!comments.length && <p className="muted">Nenhum comentário ainda.</p>}
    </div>
  );
}

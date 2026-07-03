import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h1>Criar conta</h1>
      {error && <div className="error-box">{error}</div>}
      <div className="field">
        <label>Nome de usuário</label>
        <input className="input" value={form.username} onChange={(e) => set('username', e.target.value)} required minLength={3} />
      </div>
      <div className="field">
        <label>Email</label>
        <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
      </div>
      <div className="field">
        <label>Senha (mín. 6 caracteres)</label>
        <input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} />
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
        {busy ? 'Criando…' : 'Criar conta'}
      </button>
      <p className="muted center mt">Já tem conta? <Link to="/login" style={{ color: 'var(--blue)' }}>Entrar</Link></p>
    </form>
  );
}

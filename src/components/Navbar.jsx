import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // fecha o menu ao trocar de página
  useEffect(() => setOpen(false), [location.pathname]);

  // trava o scroll do body com o menu aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const links = (
    <>
      <NavLink to="/" end>Explorar</NavLink>
      <NavLink to="/itens">Itens</NavLink>
      <NavLink to="/estatisticas">Estatísticas</NavLink>
      {user && <NavLink to="/meus-ranks">Meus ranks</NavLink>}
      {user && <NavLink to="/minhas-sessoes">Sessões</NavLink>}
      {user && <NavLink to="/favoritos">Favoritos</NavLink>}
    </>
  );

  const userArea = user ? (
    <>
      <span className="muted">@{user.username}</span>
      <button className="btn btn-sm" onClick={() => { logout(); navigate('/'); }}>Sair</button>
    </>
  ) : (
    <>
      <Link to="/login" className="btn btn-sm">Entrar</Link>
      <Link to="/registro" className="btn btn-sm btn-primary">Criar conta</Link>
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-badge">VS</span>
          Versus
        </Link>

        {/* desktop */}
        <div className="nav-links">{links}</div>
        <div className="nav-user">{userArea}</div>

        {/* botão hambúrguer (mobile) */}
        <button
          className="nav-burger"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* menu mobile */}
      {open && (
        <div className="nav-mobile">
          <div className="nav-mobile-links">{links}</div>
          <div className="nav-mobile-user">{userArea}</div>
        </div>
      )}
    </nav>
  );
}

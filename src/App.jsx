import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RankDetail from './pages/RankDetail.jsx';
import RankForm from './pages/RankForm.jsx';
import Items from './pages/Items.jsx';
import ItemForm from './pages/ItemForm.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import SessionPlay from './pages/SessionPlay.jsx';
import MySessions from './pages/MySessions.jsx';
import MyRanks from './pages/MyRanks.jsx';
import Favorites from './pages/Favorites.jsx';
import GlobalStats from './pages/GlobalStats.jsx';

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner">Carregando…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/rank/:id" element={<RankDetail />} />
          <Route path="/rank/novo" element={<Private><RankForm /></Private>} />
          <Route path="/rank/:id/editar" element={<Private><RankForm edit /></Private>} />
          <Route path="/itens" element={<Items />} />
          <Route path="/item/novo" element={<Private><ItemForm /></Private>} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/item/:id/editar" element={<Private><ItemForm edit /></Private>} />
          <Route path="/sessao/:id" element={<Private><SessionPlay /></Private>} />
          <Route path="/minhas-sessoes" element={<Private><MySessions /></Private>} />
          <Route path="/meus-ranks" element={<Private><MyRanks /></Private>} />
          <Route path="/favoritos" element={<Private><Favorites /></Private>} />
          <Route path="/estatisticas" element={<GlobalStats />} />
          <Route path="*" element={<div className="empty">Página não encontrada</div>} />
        </Routes>
      </div>
    </>
  );
}

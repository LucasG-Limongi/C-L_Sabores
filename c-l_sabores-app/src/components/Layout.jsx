import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getAuth, logout } from '../api';

const NAV_ITEMS = [
  { to: '/menu', label: 'Cardápio', icon: '🍽️' },
  { to: '/clients', label: 'Clientes', icon: '👥' },
  { to: '/ingredients', label: 'Ingredientes', icon: '🥬' },
  { to: '/stock', label: 'Estoque', icon: '📦' },
  { to: '/recipes', label: 'Receitas', icon: '📋' },
  { to: '/orders', label: 'Pedidos', icon: '🧾' },
];

export default function Layout() {
  const { employee } = getAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (to) => location.pathname === to;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>C-L Sabores</h2>
          <p>Gestão de Restaurante</p>
        </div>
        <nav>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="icon">{item.icon}</span>{item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="name">{employee?.name || 'Funcionário'}</span>
            <span>{employee?.role || ''}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="app-header">
          <h1 id="page-title">{location.pathname.split('/')[1] || 'Cardápio'}</h1>
          <div className="actions">
            <span className={`badge badge-info`}>{employee?.role || ''}</span>
            <button className="btn btn-outline btn-sm" onClick={() => window.location.reload()}>
              Atualizar
            </button>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}

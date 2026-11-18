import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from './api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Clients from './pages/Clients';
import Ingredients from './pages/Ingredients';
import Stock from './pages/Stock';
import Recipes from './pages/Recipes';
import Orders from './pages/Orders';

function ProtectedRoute() {
  const location = useLocation();
  if (!isAuthenticated() && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="menu" element={<Menu />} />
          <Route path="clients" element={<Clients />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="stock" element={<Stock />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Route>
    </Routes>
  );
}

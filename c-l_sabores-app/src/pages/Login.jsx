import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, saveAuth } from '../api';

export default function Login() {
  const [msg, setMsg] = useState({ text: '', type: '', show: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '', show: false });
    setLoading(true);

    const email = e.target.email.value.trim();
    const senha = e.target.senha.value;

    try {
      const data = await authAPI.login({ email, senha });
      saveAuth(data.token, data.employee);
      navigate('/menu');
    } catch (err) {
      setMsg({ text: err.message || 'Erro ao fazer login.', type: 'error', show: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>C-L Sabores</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Sistema de gestão de restaurante — acesso restrito a funcionários
        </p>

        {msg.show && (
          <div
            style={{
              display: 'block',
              marginBottom: '1rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: msg.type === 'error' ? '#fdecea' : '#e8f5e9',
              color: msg.type === 'error' ? 'var(--danger)' : 'var(--success)',
              border: `1px solid ${msg.type === 'error' ? '#f5c6cb' : '#c3e6cb'}`,
            }}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" name="email" className="form-control" required placeholder="seu@email.com" />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input type="password" id="senha" name="senha" className="form-control" required minLength="4" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          Não tem cadastro? <Link to="/register">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}

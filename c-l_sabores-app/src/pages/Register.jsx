import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, saveAuth } from '../api';

export default function Register() {
  const [msg, setMsg] = useState({ text: '', type: '', show: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '', show: false });
    setLoading(true);

    const payload = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      senha: e.target.senha.value,
      tel: e.target.tel.value.trim() || null,
      role: e.target.role.value,
    };

    try {
      await authAPI.register(payload);
      setMsg({ text: 'Cadastro realizado com sucesso! Redirecionando...', type: 'success', show: true });
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setMsg({ text: err.message || 'Erro ao cadastrar.', type: 'error', show: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Criar conta</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Cadastre um novo funcionário no sistema
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
            <label htmlFor="name">Nome completo</label>
            <input type="text" id="name" name="name" className="form-control" required minLength="3" placeholder="João da Silva" />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" name="email" className="form-control" required placeholder="joao@email.com" />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input type="password" id="senha" name="senha" className="form-control" required minLength="4" />
          </div>
          <div className="form-group">
            <label htmlFor="tel">Telefone (opcional)</label>
            <input type="tel" id="tel" name="tel" className="form-control" placeholder="(11) 99999-9999" />
          </div>
          <div className="form-group">
            <label htmlFor="role">Cargo</label>
            <select id="role" name="role" className="form-control">
              <option value="Attendant">Atendente</option>
              <option value="Cooker">Cozinheiro</option>
              <option value="Manager">Gerente</option>
              <option value="CEO">CEO</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem conta? <Link to="/">Fazer login</Link>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { recipeAPI } from '../api';

export default function Recipes() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState({ text: '', type: '', show: false });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await recipeAPI.list();
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setMsg({ text: 'Erro ao carregar receitas: ' + err.message, type: 'error', show: true });
    } finally {
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Receitas</h2>
      </div>

      {msg.show && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1rem' }}>
          {msg.text}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th>Prato</th>
              <th>Ingrediente</th>
              <th style={{ width: '120px' }}>Quantidade</th>
              <th style={{ width: '80px' }}>Unidade</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhuma receita encontrada.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{escapeHtml(item.dishName || (item.dish && item.dish.name) || '—')}</td>
                  <td>{escapeHtml(item.ingredientName || (item.ingredient && item.ingredient.name) || '—')}</td>
                  <td>{Number(item.quantity || 0)}</td>
                  <td>{item.unit || ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

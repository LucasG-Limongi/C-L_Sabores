import { useState, useEffect } from 'react';
import { stockAPI, hasAnyRole } from '../api';

export default function Stock() {
  const [items, setItems] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ quantity: '', unit: 'kg', minQuantity: '' });
  const [msg, setMsg] = useState({ text: '', type: '', show: false });
  const canWrite = hasAnyRole(['Manager', 'CEO']);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await stockAPI.list();
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setMsg({ text: 'Erro ao carregar estoque: ' + err.message, type: 'error', show: true });
    } finally {
    }
  }

  async function loadLow() {
    try {
      const data = await stockAPI.low();
      setItems(data || []);
      setMsg({ text: `Estoque baixo: ${Array.isArray(data) ? data.length : 0} item(ns).`, type: 'warning', show: true });
    } catch (err) {
      setMsg({ text: 'Erro ao carregar alerta de estoque baixo: ' + err.message, type: 'error', show: true });
    }
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      quantity: String(item.quantity || ''),
      unit: item.unit || 'kg',
      minQuantity: String(item.minQuantity || ''),
    });
    setOpenForm(true);
  }

  function closeForm() {
    setOpenForm(false);
    setEditing(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ingredientId = Number(editing?.ingredientId || editing?.id);
    const payload = {
      quantity: Number(form.quantity),
      unit: form.unit,
      minQuantity: Number(form.minQuantity),
    };
    try {
      await stockAPI.update(ingredientId, payload);
      closeForm();
      load();
      setMsg({ text: 'Estoque atualizado com sucesso.', type: 'success', show: true });
    } catch (err) {
      setMsg({ text: 'Erro ao atualizar estoque: ' + err.message, type: 'error', show: true });
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Estoque</h2>
        <div className="btn-group">
          <button className="btn btn-outline btn-sm" onClick={load}>Atualizar</button>
          <button className="btn btn-outline btn-sm" onClick={loadLow}>Alerta Estoque Baixo</button>
        </div>
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
              <th>Ingrediente</th>
              <th style={{ width: '140px' }}>Quantidade</th>
              <th style={{ width: '140px' }}>Mínimo</th>
              <th style={{ width: '140px' }}>Status</th>
              <th style={{ width: '140px' }}>{canWrite ? 'Ações' : null}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum registro de estoque encontrado.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const ing = item.ingredient || {};
                const low = Number(item.quantity || 0) <= Number(item.minQuantity || 0);
                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{escapeHtml(ing.name || '—')}</td>
                    <td>{Number(item.quantity || 0)} {item.unit || ''}</td>
                    <td>{Number(item.minQuantity || 0)} {item.unit || ''}</td>
                    <td>
                      <span className={`badge ${low ? 'badge-danger' : 'badge-success'}`}>
                        {low ? 'Abaixo do mínimo' : 'OK'}
                      </span>
                    </td>
                    <td className="actions">
                      {canWrite && <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Atualizar</button>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {openForm && (
        <div className="form-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>Atualizar Estoque</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="stock-quantity">Quantidade</label>
              <input id="stock-quantity" name="quantity" type="number" min="0" step="0.01" className="form-control" required defaultValue={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="stock-unit">Unidade</label>
              <select id="stock-unit" name="unit" className="form-control" defaultValue={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="mL">mL</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="stock-min-quantity">Quantidade Mínima</label>
              <input id="stock-min-quantity" name="minQuantity" type="number" min="0" step="0.01" className="form-control" required defaultValue={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} />
            </div>
            <div className="btn-group" style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Salvar</button>
              <button type="button" className="btn btn-outline" onClick={closeForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

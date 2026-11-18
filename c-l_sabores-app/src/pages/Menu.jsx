import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { menuAPI, hasAnyRole } from '../api';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Prato Principal', description: '', price: '', available: true });
  const [msg, setMsg] = useState({ text: '', type: '', show: false });
  const canWrite = hasAnyRole(['Manager', 'CEO']);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [page]);

  async function load() {
    try {
      const data = await menuAPI.list({ page });
      setItems(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setMsg({ text: 'Erro ao carregar cardápio: ' + err.message, type: 'error', show: true });
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id) {
    if (!confirm('Excluir este item do cardápio?')) return;
    menuAPI.remove(id).then(() => {
      load();
      setMsg({ text: 'Item excluído com sucesso.', type: 'success', show: true });
    }).catch((err) => setMsg({ text: 'Erro ao excluir: ' + err.message, type: 'error', show: true }));
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ name: item.name || '', category: item.category || 'Prato Principal', description: item.description || '', price: String(item.price || ''), available: item.available !== false });
    setOpenForm(true);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', category: 'Prato Principal', description: '', price: '', available: true });
    setOpenForm(true);
  }

  function closeForm() {
    setOpenForm(false);
    setEditing(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      available: form.available,
    };
    try {
      if (editing) {
        await menuAPI.update(editing.id, payload);
        setMsg({ text: 'Item atualizado com sucesso.', type: 'success', show: true });
      } else {
        await menuAPI.create(payload);
        setMsg({ text: 'Item cadastrado com sucesso.', type: 'success', show: true });
      }
      closeForm();
      load();
    } catch (err) {
      setMsg({ text: 'Erro ao salvar: ' + err.message, type: 'error', show: true });
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Cardápio</h2>
        {canWrite && <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Cadastrar Item</button>}
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
              <th>Nome</th>
              <th style={{ width: '120px' }}>Categoria</th>
              <th style={{ width: '100px' }}>Preço</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '140px' }}>{canWrite ? 'Ações' : null}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum item de cardápio encontrado.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{escapeHtml(item.name)}</td>
                  <td>{escapeHtml(item.category || '—')}</td>
                  <td>R$ {Number(item.price || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${item.available ? 'badge-success' : 'badge-danger'}`}>
                      {item.available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td className="actions">
                    {canWrite && (
                      <>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Editar</button>
                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(item.id)}>Excluir</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`btn btn-outline btn-sm ${p === page ? 'btn-primary' : ''}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {openForm && (
        <div className="form-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>{editing ? 'Editar Item' : 'Novo Item'}</h3>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="id" />
            <div className="form-group">
              <label htmlFor="menu-name">Nome do item</label>
              <input id="menu-name" name="name" className="form-control" required minLength="2" defaultValue={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="menu-category">Categoria</label>
              <select id="menu-category" name="category" className="form-control" defaultValue={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Prato Principal">Prato Principal</option>
                <option value="Acompanhamento">Acompanhamento</option>
                <option value="Bebida">Bebida</option>
                <option value="Sobremesa">Sobremesa</option>
                <option value="Entrada">Entrada</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="menu-description">Descrição</label>
              <input id="menu-description" name="description" className="form-control" required minLength="3" defaultValue={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="menu-price">Preço (R$)</label>
              <input id="menu-price" name="price" type="number" min="0" step="0.01" className="form-control" required defaultValue={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input id="menu-available" name="available" type="checkbox" defaultChecked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
              <label htmlFor="menu-available">Disponível para venda</label>
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

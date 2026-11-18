import { useState, useEffect } from 'react';
import { orderAPI, clientAPI, hasAnyRole } from '../api';

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ clientId: '', status: 'Pendente', items: [] });
  const [clients, setClients] = useState([]);
  const [msg, setMsg] = useState({ text: '', type: '', show: false });
  const userStr = localStorage.getItem('c_l_sabores_user');
  let user = null;
  try { user = userStr ? JSON.parse(userStr) : null; } catch { user = null; }
  const canWrite = user && hasAnyRole(['Manager', 'CEO', 'Atendente']);

  useEffect(() => {
    loadClients();
    load();
  }, [page]);

  async function loadClients() {
    try {
      const data = await clientAPI.list({ page: 1, size: 100 });
      setClients(Array.isArray(data.data) ? data.data : (data || []));
    } catch (err) {
      setMsg({ text: 'Erro ao carregar clientes: ' + err.message, type: 'error', show: true });
    }
  }

  async function load() {
    try {
      const data = await orderAPI.list({ page });
      setItems(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setMsg({ text: 'Erro ao carregar pedidos: ' + err.message, type: 'error', show: true });
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id) {
    if (!confirm('Excluir este pedido?')) return;
    orderAPI.remove(id).then(() => {
      load();
      setMsg({ text: 'Pedido excluído com sucesso.', type: 'success', show: true });
    }).catch((err) => setMsg({ text: 'Erro ao excluir: ' + err.message, type: 'error', show: true }));
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      clientId: String(item.clientId || item.client || ''),
      status: item.status || 'Pendente',
      items: (item.items || []).map((it) => ({ menuItemId: String(it.menuItemId || it.itemId || ''), quantity: it.quantity || 1 })),
    });
    setOpenForm(true);
  }

  function openCreate() {
    setEditing(null);
    setForm({ clientId: '', status: 'Pendente', items: [] });
    setOpenForm(true);
  }

  function closeForm() {
    setOpenForm(false);
    setEditing(null);
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, { menuItemId: '', quantity: 1 }] });
  }

  function removeItem(idx) {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  }

  function updateItem(idx, field, value) {
    const newItems = [...form.items];
    newItems[idx][field] = value;
    setForm({ ...form, items: newItems });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      clientId: Number(form.clientId),
      status: form.status,
      items: form.items,
    };
    try {
      if (editing) {
        await orderAPI.update(editing.id, payload);
        setMsg({ text: 'Pedido atualizado com sucesso.', type: 'success', show: true });
      } else {
        await orderAPI.create(payload);
        setMsg({ text: 'Pedido criado com sucesso.', type: 'success', show: true });
      }
      closeForm();
      load();
    } catch (err) {
      setMsg({ text: 'Erro ao salvar pedido: ' + err.message, type: 'error', show: true });
    }
  }

  function statusBadgeClass(status) {
    switch (String(status || '').toLowerCase()) {
      case 'pendente': return 'badge-warning';
      case 'preparando': return 'badge-info';
      case 'pronto': return 'badge-success';
      case 'entregue': return 'badge-success';
      case 'cancelado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Pedidos</h2>
        {canWrite && <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Novo Pedido</button>}
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
              <th>Cliente</th>
              <th style={{ width: '100px' }}>Total</th>
              <th style={{ width: '120px' }}>Status</th>
              <th style={{ width: '140px' }}>Criado em</th>
              <th style={{ width: '140px' }}>{canWrite ? 'Ações' : null}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{escapeHtml(item.clientName || (item.client && item.client.name) || '—')}</td>
                  <td>R$ {Number(item.total || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass(item.status)}`}>
                      {item.status || '—'}
                    </span>
                  </td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : '—'}</td>
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
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>{editing ? 'Editar Pedido' : 'Novo Pedido'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="order-client">Cliente</label>
              <select id="order-client" name="clientId" className="form-control" required defaultValue={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {escapeHtml(c.name)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="order-status">Status</label>
              <select id="order-status" name="status" className="form-control" defaultValue={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Pendente">Pendente</option>
                <option value="Preparando">Preparando</option>
                <option value="Pronto">Pronto</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Itens do pedido</div>
              <div id="order-items-list">
                {form.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ flex: '1' }}
                      placeholder="Item do cardápio"
                      defaultValue={it.menuItemId}
                      onChange={(e) => updateItem(idx, 'menuItemId', e.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      style={{ width: '80px' }}
                      defaultValue={it.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value) || 1)}
                    />
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => removeItem(idx)}>
                      Remover
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={addItem} style={{ marginTop: '0.5rem' }}>
                  + Adicionar item
                </button>
              </div>
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

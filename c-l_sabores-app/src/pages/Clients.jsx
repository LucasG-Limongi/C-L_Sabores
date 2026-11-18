import { useState, useEffect } from 'react';
import { clientAPI, hasAnyRole } from '../api';

export default function Clients() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', tel: '', email: '' });
  const [msg, setMsg] = useState({ text: '', type: '', show: false });
  const canWrite = hasAnyRole(['Manager', 'CEO']);

  useEffect(() => {
    load();
  }, [page]);

  async function load() {
    try {
      const data = await clientAPI.list({ page });
      setItems(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setMsg({ text: 'Erro ao carregar clientes: ' + err.message, type: 'error', show: true });
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id) {
    if (!confirm('Excluir este cliente?')) return;
    clientAPI.remove(id).then(() => {
      load();
      setMsg({ text: 'Cliente excluído com sucesso.', type: 'success', show: true });
    }).catch((err) => setMsg({ text: 'Erro ao excluir: ' + err.message, type: 'error', show: true }));
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ name: item.name || '', tel: item.tel || '', email: item.email || '' });
    setOpenForm(true);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', tel: '', email: '' });
    setOpenForm(true);
  }

  function closeForm() {
    setOpenForm(false);
    setEditing(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { name: form.name.trim(), tel: form.tel.trim(), email: form.email.trim() };
    try {
      if (editing) {
        await clientAPI.update(editing.id, payload);
        setMsg({ text: 'Cliente atualizado com sucesso.', type: 'success', show: true });
      } else {
        await clientAPI.create(payload);
        setMsg({ text: 'Cliente cadastrado com sucesso.', type: 'success', show: true });
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
        <h2>Clientes</h2>
        {canWrite && <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Cadastrar Cliente</button>}
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
              <th style={{ width: '120px' }}>Telefone</th>
              <th>E-mail</th>
              <th style={{ width: '140px' }}>{canWrite ? 'Ações' : null}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{escapeHtml(item.name)}</td>
                  <td>{escapeHtml(item.tel || '—')}</td>
                  <td>{escapeHtml(item.email || '—')}</td>
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
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>{editing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="client-name">Nome</label>
              <input id="client-name" name="name" className="form-control" required minLength="2" defaultValue={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="client-tel">Telefone</label>
              <input id="client-tel" name="tel" type="tel" className="form-control" required defaultValue={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="client-email">E-mail</label>
              <input id="client-email" name="email" type="email" className="form-control" required defaultValue={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function PreferenciasAdmin() {
  const [perguntas, setPerguntas] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ texto: '', ativa: true, ordem: 0, opcoes: ['', ''] });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const { data } = await api.get('/preferencias');
      const lista = Array.isArray(data) ? data : (data.perguntas ?? data.data ?? []);
      setPerguntas(lista);
    } catch (e) {
      console.error('Erro ao carregar preferências:', e);
      setPerguntas([]);
    }
  }

  function abrirCriar() {
    setForm({ texto: '', ativa: true, ordem: perguntas.length, opcoes: ['', ''] });
    setErro('');
    setModal('criar');
  }

  function abrirEditar(p) {
    setForm({ texto: p.texto, ativa: Boolean(p.ativa), ordem: p.ordem, opcoes: p.opcoes.map(o => o.texto) });
    setErro('');
    setModal(p);
  }

  function addOpcao() {
    setForm(f => ({ ...f, opcoes: [...f.opcoes, ''] }));
  }

  function removeOpcao(i) {
    setForm(f => ({ ...f, opcoes: f.opcoes.filter((_, idx) => idx !== i) }));
  }

  function setOpcao(i, val) {
    setForm(f => ({ ...f, opcoes: f.opcoes.map((o, idx) => idx === i ? val : o) }));
  }

  async function salvar() {
    setErro('');
    const opcoesFiltradas = form.opcoes.filter(o => o.trim());
    if (!form.texto.trim()) return setErro('Texto da pergunta obrigatório.');
    if (opcoesFiltradas.length < 2) return setErro('Mínimo 2 opções.');

    setLoading(true);
    try {
      const payload = {
        texto: form.texto.trim(),
        ativa: Boolean(form.ativa), // garante boolean explícito
        ordem: Number(form.ordem),
        opcoes: opcoesFiltradas,
      };
      if (modal === 'criar') {
        await api.post('/preferencias', payload);
      } else {
        await api.put(`/preferencias/${modal.id}`, payload);
      }
      setModal(null);
      carregar();
    } catch (e) {
      setErro(e.response?.data?.message || e.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  async function excluir(id) {
    if (!confirm('Excluir pergunta e todas as respostas associadas?')) return;
    try {
      await api.delete(`/preferencias/${id}`);
      carregar();
    } catch (e) {
      alert('Erro ao excluir.');
    }
  }

  async function toggleAtiva(p) {
    try {
      await api.put(`/preferencias/${p.id}`, {
        texto: p.texto,
        ativa: !p.ativa,
        ordem: p.ordem,
        opcoes: p.opcoes.map(o => o.texto),
      });
      carregar();
    } catch (e) {
      alert('Erro ao atualizar.');
    }
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.5rem' }}>Preferências</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
            Perguntas exibidas no cadastro de clientes
          </p>
        </div>
        <button onClick={abrirCriar} style={btnPrimary}>+ Nova Pergunta</button>
      </div>

      {perguntas.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Nenhuma pergunta cadastrada ainda.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {perguntas.map((p, i) => (
            <div key={p.id} style={{ ...card, opacity: p.ativa ? 1 : 0.55 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-hint)', fontSize: '0.75rem' }}>#{i + 1}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.texto}</span>
                    <span style={{
                      borderRadius: 20,
                      padding: '1px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: p.ativa ? 'var(--success-bg)' : 'var(--danger-bg)',
                      color: p.ativa ? 'var(--success)' : 'var(--danger)',
                    }}>
                      {p.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {(p.opcoes ?? []).map(o => (
                      <span key={o.id} style={badge}>{o.texto}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {/* Toggle ativa/inativa */}
                  <button
                    onClick={() => toggleAtiva(p)}
                    title={p.ativa ? 'Desativar' : 'Ativar'}
                    style={{
                      ...btnSecondary,
                      borderColor: p.ativa ? 'var(--success)' : 'var(--border)',
                      color: p.ativa ? 'var(--success)' : 'var(--text-secondary)',
                    }}
                  >
                    {p.ativa ? '● Ativa' : '○ Inativa'}
                  </button>
                  <button onClick={() => abrirEditar(p)} style={btnSecondary}>Editar</button>
                  <button onClick={() => excluir(p.id)} style={btnDanger}>Excluir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <div style={overlay} onClick={() => setModal(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.25rem', color: 'var(--text-primary)', fontSize: '1.125rem' }}>
              {modal === 'criar' ? 'Nova Pergunta' : 'Editar Pergunta'}
            </h2>

            <label style={labelStyle}>Texto da pergunta</label>
            <input
              style={inputStyle}
              value={form.texto}
              onChange={e => setForm(f => ({ ...f, texto: e.target.value }))}
              placeholder="Ex: Você tem alguma restrição alimentar?"
            />

            <div style={{ display: 'flex', gap: '1rem', margin: '0.75rem 0', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Ordem</label>
                <input
                  type="number"
                  style={{ ...inputStyle, marginBottom: 0 }}
                  value={form.ordem}
                  onChange={e => setForm(f => ({ ...f, ordem: Number(e.target.value) }))}
                />
              </div>

              {/* Toggle visual de ativa no modal */}
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, ativa: !f.ativa }))}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 8,
                  border: '1px solid',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s',
                  borderColor: form.ativa ? 'var(--success)' : 'var(--border)',
                  background: form.ativa ? 'var(--success-bg)' : 'var(--surface)',
                  color: form.ativa ? 'var(--success)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {form.ativa ? '● Ativa' : '○ Inativa'}
              </button>
            </div>

            <label style={labelStyle}>Opções de resposta</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {form.opcoes.map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    style={{ ...inputStyle, margin: 0, flex: 1 }}
                    value={o}
                    onChange={e => setOpcao(i, e.target.value)}
                    placeholder={`Opção ${i + 1}`}
                  />
                  {form.opcoes.length > 2 && (
                    <button onClick={() => removeOpcao(i)} style={{ ...btnDanger, padding: '0.4rem 0.75rem' }}>×</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addOpcao} style={{ ...btnSecondary, marginBottom: '1rem', fontSize: '0.8rem' }}>
              + Adicionar opção
            </button>

            {erro && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', margin: '0 0 0.75rem' }}>{erro}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={btnSecondary}>Cancelar</button>
              <button onClick={salvar} disabled={loading} style={btnPrimary}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' };
const badge = { background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 10px', fontSize: '0.8rem' };
const btnPrimary = { background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' };
const btnDanger = { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' };
const inputStyle = { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '0.5rem', boxSizing: 'border-box' };
const labelStyle = { display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 500 };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalBox = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' };
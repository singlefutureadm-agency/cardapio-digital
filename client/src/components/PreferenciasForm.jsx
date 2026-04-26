import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PreferenciasForm({ onSalvo }) {
  const [perguntas, setPerguntas] = useState([]);
  const [respostas, setRespostas] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    api.get('/preferencias/ativas')
      .then(({ data }) => {
        const lista = Array.isArray(data) ? data : [];
        setPerguntas(lista);
      })
      .catch(() => setPerguntas([]));

    api.get('/preferencias/respostas')
      .then(({ data }) => {
        const map = {};
        (Array.isArray(data) ? data : []).forEach(r => {
          map[r.perguntaId] = r.opcaoId;
        });
        setRespostas(map);
      })
      .catch(() => {}); // não autenticado ainda no register — ok ignorar
  }, []);

  async function salvar() {
    setLoading(true);
    setFeedback('');
    try {
      await api.post('/preferencias/respostas', {
        respostas: Object.entries(respostas).map(([perguntaId, opcaoId]) => ({
          perguntaId: Number(perguntaId),
          opcaoId: Number(opcaoId),
        })),
      });
      setFeedback('Preferências salvas!');
      onSalvo?.();
    } catch {
      setFeedback('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  if (perguntas.length === 0) return (
    <p style={{ color: 'var(--text-hint)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
      Nenhuma preferência cadastrada ainda.
    </p>
  );

  return (
    <div>
      {perguntas.map(p => (
        <div key={p.id} style={{ marginBottom: '1.25rem' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
            {p.texto}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(p.opcoes ?? []).map(o => {
              const selecionado = respostas[p.id] === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setRespostas(r => ({ ...r, [p.id]: o.id }))}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 20,
                    border: selecionado ? '2px solid var(--brand)' : '1px solid var(--border)',
                    background: selecionado ? 'var(--brand)' : 'var(--surface)',
                    color: selecionado ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.15s',
                    fontWeight: selecionado ? 600 : 400,
                  }}
                >
                  {o.texto}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={salvar}
        disabled={loading || Object.keys(respostas).length === 0}
        style={{
          background: 'var(--brand)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '0.6rem 1.5rem',
          cursor: 'pointer',
          fontWeight: 600,
          opacity: Object.keys(respostas).length === 0 ? 0.5 : 1,
        }}
      >
        {loading ? 'Salvando...' : 'Salvar preferências'}
      </button>

      {feedback && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: feedback.includes('Erro') ? 'var(--danger)' : 'var(--success)' }}>
          {feedback}
        </p>
      )}
    </div>
  );
}
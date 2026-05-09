import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const TODOS_METODOS = [
  { value: 'PIX',      label: 'Pix',      icon: '📱', desc: 'Pague com QR Code' },
  { value: 'CARTAO',   label: 'Cartão',   icon: '💳', desc: 'Pague com o garçom' },
  { value: 'DINHEIRO', label: 'Dinheiro', icon: '💵', desc: 'Pague com o garçom' },
];

export default function ClienteCheckout() {
  const { mesa } = useParams();
  const navigate = useNavigate();
  const { features } = useTheme();

  const METODOS = TODOS_METODOS.filter(m => m.value !== 'PIX' || features.pix);

  const [metodo, setMetodo] = useState(() => features.pix ? 'PIX' : 'CARTAO');
  const [loading, setLoading] = useState(false);
  const [chamado, setChamado] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!features.pix && metodo === 'PIX') setMetodo('CARTAO');
  }, [features.pix]);

  const chamarGarcom = async () => {
    setLoading(true);
    setErro('');
    try {
      await api.post('/chamadas', { mesa, metodo });
      setChamado(true);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao chamar o garçom');
    } finally {
      setLoading(false);
    }
  };

  // ── Tela de sucesso ──
  if (chamado) {
    return (
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🛎️</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Garçom chamado!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
            Aguarde, em breve o garçom virá até a mesa {mesa}.
          </p>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            Pagamento:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {TODOS_METODOS.find(m => m.value === metodo)?.label}
            </strong>
          </div>
          <button
            onClick={() => navigate(`/cliente/${mesa}/cardapio`)}
            style={{ width: '100%', padding: 12, background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
          >
            Voltar ao cardápio
          </button>
        </div>
      </div>
    );
  }

  // ── Seleção de pagamento ──
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem 1rem' }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand)', marginBottom: 4 }}>
        Finalizar
      </p>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 4, fontSize: '1.3rem', fontWeight: 700 }}>
        Chamar Garçom
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
        Mesa {mesa} · Selecione como deseja pagar e chamamos o garçom para você.
      </p>

      {/* Métodos */}
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, fontSize: 14 }}>
        Como deseja pagar?
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {METODOS.map(m => (
          <button
            key={m.value}
            onClick={() => setMetodo(m.value)}
            style={{
              flex: 1,
              padding: '14px 8px',
              border: `2px solid ${metodo === m.value ? 'var(--brand)' : 'var(--border)'}`,
              borderRadius: 10,
              background: metodo === m.value ? 'var(--surface)' : 'var(--card)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 24 }}>{m.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{m.label}</div>
          </button>
        ))}
      </div>

      {/* Info contextual */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
        {metodo === 'PIX'
          ? '📱 O garçom trará o QR Code para pagamento via Pix.'
          : '🛎️ O garçom virá até a mesa para efetuar o pagamento.'}
      </div>

      {erro && (
        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
          {erro}
        </div>
      )}

      <button
        onClick={chamarGarcom}
        disabled={loading}
        style={{
          width: '100%',
          padding: 14,
          background: loading ? 'var(--border)' : 'var(--brand)',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 15,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Chamando...' : '🛎️ Chamar Garçom'}
      </button>
    </div>
  );
}

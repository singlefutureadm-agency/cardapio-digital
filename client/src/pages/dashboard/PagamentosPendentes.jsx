import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function PagamentosPendentes() {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pagamentos/pendentes');
      setPagamentos(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const confirmar = async (id) => {
    await api.patch(`/pagamentos/${id}/confirmar`);
    carregar();
  };

  const badgeMetodo = (metodo) => {
    const map = {
      PIX:      { label: '📱 Pix',      bg: '#dcfce7', color: '#166534' },
      CARTAO:   { label: '💳 Cartão',   bg: '#dbeafe', color: '#1e40af' },
      DINHEIRO: { label: '💵 Dinheiro', bg: '#fef9c3', color: '#854d0e' },
    };
    const b = map[metodo] || { label: metodo, bg: 'var(--surface)', color: 'var(--text-secondary)' };
    return (
      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: b.bg, color: b.color }}>
        {b.label}
      </span>
    );
  };

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Pagamentos Pendentes</h2>
        <button
          onClick={carregar}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}
        >
          ↻ Atualizar
        </button>
      </div>

      {pagamentos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-hint)', background: 'var(--card)', borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          Nenhum pagamento pendente
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pagamentos.map(p => (
            <div
              key={p.id}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Pedido #{p.pedidoId}</span>
                  {badgeMetodo(p.metodo)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Mesa {p.pedido.mesa} · R$ {parseFloat(p.pedido.total).toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
                  {new Date(p.createdAt).toLocaleString('pt-BR')}
                </div>
                {p.metodo !== 'PIX' && (
                  <div style={{ fontSize: 12, color: 'var(--warning)', marginTop: 4 }}>
                    🛎️ Aguardando cobrança do garçom
                  </div>
                )}
              </div>

              <button
                onClick={() => confirmar(p.id)}
                style={{ padding: '8px 18px', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
              >
                ✓ Confirmar pagamento
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
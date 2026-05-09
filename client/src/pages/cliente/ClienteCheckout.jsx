import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import useCarrinhoStore from '../../store/useCarrinhoStore';
import { useTheme } from '../../context/ThemeContext';

const TODOS_METODOS = [
  { value: 'PIX',      label: 'Pix',      icon: '📱', desc: 'Pague agora com QR Code' },
  { value: 'CARTAO',   label: 'Cartão',   icon: '💳', desc: 'Pague com o garçom' },
  { value: 'DINHEIRO', label: 'Dinheiro', icon: '💵', desc: 'Pague com o garçom' },
];

export default function ClienteCheckout() {
  const { mesa } = useParams();
  const navigate = useNavigate();
  const { features } = useTheme();
  const itens = useCarrinhoStore(s => s.itens);
  const totalValor = useCarrinhoStore(s => s.totalValor);
  const limparCarrinho = useCarrinhoStore(s => s.limparCarrinho);

  const METODOS = TODOS_METODOS.filter(m => m.value !== 'PIX' || features.pix);

  const [metodo, setMetodo] = useState(() => features.pix ? 'PIX' : 'CARTAO');
  const [loading, setLoading] = useState(false);
  const [pagamento, setPagamento] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState('');

  const confirmar = async () => {
    setLoading(true);
    setErro('');
    try {
      const { data: pedido } = await api.post('/pedidos', {
        mesa,
        itens: itens.map(i => ({
          menuItemId: i.id,
          quantidade: i.quantidade,
          observacao: i.observacao || '',
        })),
      });

      const { data: pag } = await api.post('/pagamentos', {
        pedidoId: pedido.id,
        metodo,
      });

      limparCarrinho();

      if (metodo === 'PIX') {
        setPagamento({ ...pag, pedidoId: pedido.id });
      } else {
        navigate(`/pedido/${pedido.id}?mesa=${mesa}`);
      }
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao confirmar pedido');
    } finally {
      setLoading(false);
    }
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(pagamento.pixCopiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  // ── Tela Pix após confirmação ──
  if (pagamento) {
    return (
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Pague via Pix</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
            Escaneie o QR Code ou copie o código abaixo
          </p>

          {pagamento.qrCode && (
            <img
              src={pagamento.qrCode}
              alt="QR Code Pix"
              style={{ width: 220, height: 220, borderRadius: 8, marginBottom: 20, border: '4px solid var(--border)' }}
            />
          )}

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 11, wordBreak: 'break-all', color: 'var(--text-secondary)', marginBottom: 12, maxHeight: 72, overflowY: 'auto', textAlign: 'left' }}>
            {pagamento.pixCopiaECola}
          </div>

          <button
            onClick={copiarPix}
            style={{ width: '100%', padding: 12, background: copiado ? 'var(--success)' : 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginBottom: 10, transition: 'background 0.2s' }}
          >
            {copiado ? '✓ Copiado!' : 'Copiar código Pix'}
          </button>

          <button
            onClick={() => navigate(`/pedido/${pagamento.pedidoId}?mesa=${mesa}`)}
            style={{ width: '100%', padding: 10, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
          >
            Já paguei — ver status do pedido
          </button>

          <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 16 }}>
            O garçom confirmará o pagamento no sistema.
          </p>
        </div>
      </div>
    );
  }

  // ── Tela seleção de método ──
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Finalizar pedido</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>Mesa {mesa}</p>

      {/* Resumo */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: 24 }}>
        {itens.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
            <span style={{ color: 'var(--text-primary)' }}>{item.quantidade}x {item.nome}</span>
            <span style={{ color: 'var(--text-secondary)' }}>R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</span>
          </div>
        ))}
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span style={{ color: 'var(--text-primary)' }}>Total</span>
          <span style={{ color: 'var(--brand)' }}>R$ {totalValor().toFixed(2)}</span>
        </div>
      </div>

      {/* Método */}
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Como deseja pagar?</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {METODOS.map(m => (
          <button
            key={m.value}
            onClick={() => setMetodo(m.value)}
            style={{ flex: 1, padding: '14px 8px', border: `2px solid ${metodo === m.value ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 10, background: metodo === m.value ? 'var(--surface)' : 'var(--card)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
          >
            <div style={{ fontSize: 24 }}>{m.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{m.label}</div>
          </button>
        ))}
      </div>

      {/* Info contextual */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
        {metodo === 'PIX'
          ? '📱 Você receberá um QR Code para pagar agora.'
          : '🛎️ Após confirmar, chame o garçom para efetuar o pagamento.'}
      </div>

      {erro && (
        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
          {erro}
        </div>
      )}

      <button
        onClick={confirmar}
        disabled={loading || itens.length === 0}
        style={{ width: '100%', padding: 14, background: loading ? 'var(--border)' : 'var(--brand)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Processando...' : metodo === 'PIX' ? 'Gerar QR Code Pix' : 'Confirmar pedido'}
      </button>
    </div>
  );
}
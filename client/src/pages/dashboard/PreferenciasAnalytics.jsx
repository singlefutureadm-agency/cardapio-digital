import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function PreferenciasAnalytics() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try {
      const { data } = await api.get('/preferencias/analytics');
      setDados(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-hint)' }}>
      Carregando analytics...
    </div>
  );

  if (!dados) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>
      Erro ao carregar dados.
    </div>
  );

  const { totalUsuarios, perguntas } = dados;
  const totalPerguntas = perguntas.length;
  const totalRespostasGeral = perguntas.reduce((acc, p) => acc + p.totalRespostas, 0);
  const taxaEngajamento = totalUsuarios > 0
    ? Math.round((totalRespostasGeral / (totalUsuarios * totalPerguntas || 1)) * 100)
    : 0;

  // Paleta de cores para as barras
  const cores = [
    'var(--brand)',
    'var(--success)',
    'var(--warning)',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#F59E0B',
    '#10B981',
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
          Analytics de Preferências
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
          Visão geral das respostas dos clientes
        </p>
      </div>

      {/* Cards de métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard
          label="Usuários responderam"
          valor={totalUsuarios}
          icon="👥"
          cor="var(--brand)"
        />
        <MetricCard
          label="Total de respostas"
          valor={totalRespostasGeral}
          icon="✅"
          cor="var(--success)"
        />
        <MetricCard
          label="Perguntas ativas"
          valor={perguntas.filter(p => p.ativa).length}
          icon="❓"
          cor="#8B5CF6"
        />
        <MetricCard
          label="Taxa de engajamento"
          valor={`${taxaEngajamento}%`}
          icon="📊"
          cor="var(--warning)"
        />
      </div>

      {/* Sem dados */}
      {perguntas.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '3rem', color: 'var(--text-hint)' }}>
          Nenhuma pergunta cadastrada ainda.
        </div>
      )}

      {/* Perguntas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {perguntas.map((p, pi) => {
          const aberto = expandido === p.id;
          const semRespostas = p.totalRespostas === 0;

          return (
            <div key={p.id} style={{ ...card, overflow: 'hidden' }}>
              {/* Header da pergunta */}
              <div
                onClick={() => setExpandido(aberto ? null : p.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '1rem' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-hint)', fontSize: '0.75rem' }}>#{pi + 1}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{p.texto}</span>
                    {!p.ativa && (
                      <span style={badgeInativo}>Inativa</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-hint)', fontSize: '0.8rem' }}>
                      {p.totalRespostas} {p.totalRespostas === 1 ? 'resposta' : 'respostas'}
                    </span>
                    {p.mais_votada && !semRespostas && (
                      <span style={{ color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 600 }}>
                        Mais votada: {p.mais_votada.texto} ({p.mais_votada.percentual}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Mini preview das barras */}
                {!semRespostas && !aberto && (
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: 32, flexShrink: 0 }}>
                    {p.opcoes.slice(0, 5).map((o, i) => (
                      <div
                        key={o.id}
                        title={`${o.texto}: ${o.percentual}%`}
                        style={{
                          width: 8,
                          height: Math.max(4, (o.percentual / 100) * 32),
                          borderRadius: 2,
                          background: cores[i % cores.length],
                          opacity: 0.8,
                        }}
                      />
                    ))}
                  </div>
                )}

                <span style={{ color: 'var(--text-hint)', fontSize: '1rem', flexShrink: 0 }}>
                  {aberto ? '▲' : '▼'}
                </span>
              </div>

              {/* Detalhe expandido */}
              {aberto && (
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  {semRespostas ? (
                    <p style={{ color: 'var(--text-hint)', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>
                      Nenhuma resposta ainda para esta pergunta.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      {p.opcoes.map((o, oi) => (
                        <div key={o.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: o.votos === p.mais_votada?.votos ? 600 : 400 }}>
                              {o.votos === p.mais_votada?.votos && '🏆 '}{o.texto}
                            </span>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <span style={{ color: 'var(--text-hint)', fontSize: '0.8rem' }}>
                                {o.votos} {o.votos === 1 ? 'voto' : 'votos'}
                              </span>
                              <span style={{
                                color: cores[oi % cores.length],
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                minWidth: 36,
                                textAlign: 'right',
                              }}>
                                {o.percentual}%
                              </span>
                            </div>
                          </div>
                          {/* Barra de progresso */}
                          <div style={{ height: 8, background: 'var(--surface)', borderRadius: 99, overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${o.percentual}%`,
                                background: cores[oi % cores.length],
                                borderRadius: 99,
                                transition: 'width 0.6s ease',
                              }}
                            />
                          </div>
                        </div>
                      ))}

                      {/* Comparativo resumido */}
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem 1rem',
                        background: 'var(--surface)',
                        borderRadius: 8,
                        display: 'flex',
                        gap: '1.5rem',
                        flexWrap: 'wrap',
                      }}>
                        <div>
                          <span style={{ color: 'var(--text-hint)', fontSize: '0.75rem', display: 'block' }}>Mais popular</span>
                          <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
                            {p.opcoes[0]?.texto} — {p.opcoes[0]?.percentual}%
                          </span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-hint)', fontSize: '0.75rem', display: 'block' }}>Menos escolhida</span>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>
                            {p.opcoes[p.opcoes.length - 1]?.texto} — {p.opcoes[p.opcoes.length - 1]?.percentual}%
                          </span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-hint)', fontSize: '0.75rem', display: 'block' }}>Total de respostas</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                            {p.totalRespostas}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão recarregar */}
      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button onClick={carregar} style={btnSecondary}>
          ↻ Atualizar dados
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, valor, icon, cor }) {
  return (
    <div style={{
      ...card,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
        <div style={{ width: 4, height: 32, borderRadius: 2, background: cor }} />
      </div>
      <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.5rem', lineHeight: 1 }}>
        {valor}
      </span>
      <span style={{ color: 'var(--text-hint)', fontSize: '0.8rem' }}>{label}</span>
    </div>
  );
}

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '1rem',
};
const badgeInativo = {
  background: 'var(--danger-bg)',
  color: 'var(--danger)',
  borderRadius: 20,
  padding: '1px 8px',
  fontSize: '0.7rem',
  fontWeight: 600,
};
const btnSecondary = {
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
};
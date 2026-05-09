const prisma = require('../lib/prisma')
const QRCode = require('qrcode');

const PIX_CONFIG = {
  chave: process.env.PIX_CHAVE || 'restaurante@pix.com',
  nome: process.env.PIX_NOME || 'Restaurante Digital',
  cidade: process.env.PIX_CIDADE || 'SAO PAULO',
};

function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return crc & 0xffff;
}

function gerarPayloadPix({ chave, nome, cidade, valor, txid }) {
  const f = (id, value) => `${id}${value.length.toString().padStart(2, '0')}${value}`;
  const merchantAccount = f('00', 'BR.GOV.BCB.PIX') + f('01', chave);
  const txidClean = txid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || 'SEMID';

  let payload =
    f('00', '01') +
    f('01', '12') +
    f('26', merchantAccount) +
    f('52', '0000') +
    f('53', '986') +
    f('54', valor.toFixed(2)) +
    f('58', 'BR') +
    f('59', nome.substring(0, 25)) +
    f('60', cidade.substring(0, 15)) +
    f('62', f('05', txidClean)) +
    '6304';

  const crc = crc16(payload).toString(16).toUpperCase().padStart(4, '0');
  return payload + crc;
}

async function criarPagamento({ pedidoId, metodo }) {
  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
  if (!pedido) throw new Error('Pedido não encontrado');

  const tipo = metodo === 'PIX' ? 'ONLINE' : 'GARCOM';
  let qrCode = null;
  let pixCopiaECola = null;

  if (metodo === 'PIX') {
    const txid = `PED${pedidoId}${Date.now()}`;
    pixCopiaECola = gerarPayloadPix({
      chave: PIX_CONFIG.chave,
      nome: PIX_CONFIG.nome,
      cidade: PIX_CONFIG.cidade,
      valor: parseFloat(pedido.total),
      txid,
    });
    qrCode = await QRCode.toDataURL(pixCopiaECola, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
  }

  return prisma.pagamento.upsert({
    where: { pedidoId },
    update: { tipo, metodo, status: 'PENDENTE', qrCode, pixCopiaECola },
    create: { pedidoId, tipo, metodo, status: 'PENDENTE', qrCode, pixCopiaECola },
  });
}

async function confirmarPagamento(id) {
  return prisma.pagamento.update({
    where: { id },
    data: { status: 'PAGO' },
  });
}

async function buscarPorPedido(pedidoId) {
  return prisma.pagamento.findUnique({ where: { pedidoId } });
}

async function listarPendentes() {
  return prisma.pagamento.findMany({
    where: { status: 'PENDENTE' },
    include: {
      pedido: { select: { id: true, mesa: true, total: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Retorna mesas com chamada de garçom pendente + seus pedidos do dia
async function listarMesasAbertas() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const chamadas = await prisma.chamadaGarcom.findMany({
    where: { status: 'PENDENTE' },
    orderBy: { createdAt: 'asc' },
  })

  const mesas = []
  for (const chamada of chamadas) {
    const todosPedidos = await prisma.pedido.findMany({
      where: {
        mesa: chamada.mesa,
        createdAt: { gte: hoje },
        status: { not: 'CANCELADO' },
      },
      include: {
        itens: { include: { menuItem: { select: { nome: true } } } },
        pagamento: { select: { id: true, status: true, metodo: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Exibe apenas pedidos da sessão atual (sem pagamento ou ainda não PAGO)
    const pedidos = todosPedidos.filter(p => p.pagamento?.status !== 'PAGO')
    const totalMesa = pedidos.reduce((acc, p) => acc + Number(p.total), 0)

    mesas.push({ mesa: chamada.mesa, chamada, pedidos, totalMesa })
  }

  return mesas
}

// Fecha a conta de uma mesa: cria/atualiza pagamentos e marca chamadas como atendido
async function fecharMesa(mesa, metodo, io) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const pedidos = await prisma.pedido.findMany({
    where: { mesa, createdAt: { gte: hoje }, status: { not: 'CANCELADO' } },
  })

  for (const pedido of pedidos) {
    await prisma.pagamento.upsert({
      where: { pedidoId: pedido.id },
      update: { status: 'PAGO', metodo, tipo: 'GARCOM' },
      create: { pedidoId: pedido.id, status: 'PAGO', metodo, tipo: 'GARCOM' },
    })
  }

  const chamadas = await prisma.chamadaGarcom.findMany({
    where: { mesa, status: 'PENDENTE' },
  })

  for (const c of chamadas) {
    await prisma.chamadaGarcom.update({ where: { id: c.id }, data: { status: 'ATENDIDO' } })
    if (io) io.to('cozinha').emit('chamada_atendida', { id: c.id })
  }

  return {
    mesa,
    pedidosFechados: pedidos.length,
    total: pedidos.reduce((acc, p) => acc + Number(p.total), 0),
  }
}

module.exports = { criarPagamento, confirmarPagamento, buscarPorPedido, listarPendentes, listarMesasAbertas, fecharMesa };
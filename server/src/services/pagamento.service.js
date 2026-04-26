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

module.exports = { criarPagamento, confirmarPagamento, buscarPorPedido, listarPendentes };
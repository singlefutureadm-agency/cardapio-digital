const prisma = require('../lib/prisma')

// Admin - listar todas
async function listarPerguntas() {
  return prisma.perguntaPreferencia.findMany({
    orderBy: { ordem: 'asc' },
    include: { opcoes: true },
  });
}

// Público - listar apenas ativas (para register/perfil)
async function listarPerguntasAtivas() {
  return prisma.perguntaPreferencia.findMany({
    where: { ativa: true },
    orderBy: { ordem: 'asc' },
    include: { opcoes: true },
  });
}

async function criarPergunta({ texto, ativa = true, ordem = 0, opcoes }) {
  return prisma.perguntaPreferencia.create({
    data: {
      texto,
      ativa,
      ordem,
      opcoes: { create: opcoes.map((o) => ({ texto: o })) },
    },
    include: { opcoes: true },
  });
}

async function atualizarPergunta(id, { texto, ativa, ordem, opcoes }) {
  // Recria opções para simplificar (deleta antigas, insere novas)
  await prisma.opcaoPreferencia.deleteMany({ where: { perguntaId: id } });

  return prisma.perguntaPreferencia.update({
    where: { id },
    data: {
      texto,
      ativa,
      ordem,
      opcoes: { create: opcoes.map((o) => ({ texto: o })) },
    },
    include: { opcoes: true },
  });
}

async function excluirPergunta(id) {
  return prisma.perguntaPreferencia.delete({ where: { id } });
}

// Cliente - salvar respostas (upsert por pergunta)
async function salvarRespostas(userId, respostas) {
  // respostas: [{ perguntaId, opcaoId }]
  const ops = respostas.map(({ perguntaId, opcaoId }) =>
    prisma.respostaPreferencia.upsert({
      where: { userId_perguntaId: { userId, perguntaId } },
      update: { opcaoId },
      create: { userId, perguntaId, opcaoId },
    })
  );
  return prisma.$transaction(ops);
}

// Cliente - buscar respostas do usuário
async function buscarRespostasUsuario(userId) {
  return prisma.respostaPreferencia.findMany({
    where: { userId },
    include: { pergunta: true, opcao: true },
  });
}

module.exports = {
  listarPerguntas,
  listarPerguntasAtivas,
  criarPergunta,
  atualizarPergunta,
  excluirPergunta,
  salvarRespostas,
  buscarRespostasUsuario,
};
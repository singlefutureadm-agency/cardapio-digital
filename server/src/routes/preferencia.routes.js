const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma')
const { authMiddleware } = require('../middlewares/auth.middleware');

// Público - perguntas ativas
router.get('/ativas', async (req, res, next) => {
  try {
    const perguntas = await prisma.perguntaPreferencia.findMany({
      where: { ativa: true },
      orderBy: { ordem: 'asc' },
      include: { opcoes: true },
    });
    res.json(perguntas);
  } catch (e) { next(e); }
});

// Admin - todas
router.get('/', async (req, res, next) => {
  try {
    const perguntas = await prisma.perguntaPreferencia.findMany({
      orderBy: { ordem: 'asc' },
      include: { opcoes: true },
    });
    res.json(perguntas);
  } catch (e) { next(e); }
});

// Admin - criar
router.post('/', async (req, res, next) => {
  try {
    const { texto, ativa = true, ordem = 0, opcoes } = req.body;
    const pergunta = await prisma.perguntaPreferencia.create({
      data: {
        texto,
        ativa: Boolean(ativa),
        ordem: Number(ordem),
        opcoes: { create: opcoes.map(o => ({ texto: o })) },
      },
      include: { opcoes: true },
    });
    res.status(201).json(pergunta);
  } catch (e) { next(e); }
});

// Admin - editar
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { texto, ativa, ordem, opcoes } = req.body;
    await prisma.opcaoPreferencia.deleteMany({ where: { perguntaId: id } });
    const pergunta = await prisma.perguntaPreferencia.update({
      where: { id },
      data: {
        texto,
        ativa: Boolean(ativa),
        ordem: Number(ordem),
        opcoes: { create: opcoes.map(o => ({ texto: o })) },
      },
      include: { opcoes: true },
    });
    res.json(pergunta);
  } catch (e) { next(e); }
});

// Admin - excluir
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // 1. Busca os ids das opções desta pergunta
    const opcoes = await prisma.opcaoPreferencia.findMany({
      where: { perguntaId: id },
      select: { id: true },
    });
    const opcaoIds = opcoes.map(o => o.id);

    // 2. Deleta respostas que referenciam essas opções
    await prisma.respostaPreferencia.deleteMany({
      where: { opcaoId: { in: opcaoIds } },
    });

    // 3. Deleta respostas que referenciam a pergunta diretamente
    await prisma.respostaPreferencia.deleteMany({
      where: { perguntaId: id },
    });

    // 4. Deleta as opções
    await prisma.opcaoPreferencia.deleteMany({
      where: { perguntaId: id },
    });

    // 5. Deleta a pergunta
    await prisma.perguntaPreferencia.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Admin - analytics de respostas
router.get('/analytics', async (req, res, next) => {
  try {
    const perguntas = await prisma.perguntaPreferencia.findMany({
      orderBy: { ordem: 'asc' },
      include: {
        opcoes: {
          include: {
            respostas: true,
          },
        },
        respostas: true,
      },
    });

    const totalUsuarios = await prisma.respostaPreferencia.groupBy({
      by: ['userId'],
    }).then(r => r.length);

    const analytics = perguntas.map(p => {
      const totalRespostas = p.respostas.length;
      const opcoes = p.opcoes.map(o => ({
        id: o.id,
        texto: o.texto,
        votos: o.respostas.length,
        percentual: totalRespostas > 0
          ? Math.round((o.respostas.length / totalRespostas) * 100)
          : 0,
      })).sort((a, b) => b.votos - a.votos);

      const mais_votada = opcoes[0] ?? null;

      return {
        id: p.id,
        texto: p.texto,
        ativa: p.ativa,
        totalRespostas,
        opcoes,
        mais_votada,
      };
    });

    res.json({ totalUsuarios, perguntas: analytics });
  } catch (e) { next(e); }
});


// Cliente - buscar respostas (GET antes do POST para não colidir com /:id)
router.get('/respostas', authMiddleware, async (req, res, next) => {
  try {
    const respostas = await prisma.respostaPreferencia.findMany({
      where: { userId: req.user.id },
      include: { pergunta: true, opcao: true },
    });
    res.json(respostas);
  } catch (e) { next(e); }
});

// Cliente - salvar respostas
router.post('/respostas', authMiddleware, async (req, res, next) => {
  try {
    const { respostas } = req.body;

    if (!Array.isArray(respostas) || respostas.length === 0) {
      return res.status(400).json({ error: 'Nenhuma resposta enviada.' });
    }

    const ops = respostas.map(({ perguntaId, opcaoId }) =>
      prisma.respostaPreferencia.upsert({
        where: {
          userId_perguntaId: {
            userId: req.user.id,
            perguntaId: Number(perguntaId),
          },
        },
        update: { opcaoId: Number(opcaoId) },
        create: {
          userId: req.user.id,
          perguntaId: Number(perguntaId),
          opcaoId: Number(opcaoId),
        },
      })
    );

    await prisma.$transaction(ops);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
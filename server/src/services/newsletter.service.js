const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const inscrever = async (email) => {
  const existe = await prisma.newsletter.findUnique({ where: { email } })
  if (existe?.ativo) throw Object.assign(new Error('Email já cadastrado'), { status: 409 })
  return prisma.newsletter.upsert({
    where: { email },
    update: { ativo: true },
    create: { email },
  })
}

const listar = async () => {
  const inscritos = await prisma.newsletter.findMany({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
  });

  const emails = inscritos.map(i => i.email);
  const usuarios = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true, role: true, nome: true },
  });

  const userMap = Object.fromEntries(usuarios.map(u => [u.email, u]));

  return inscritos.map(i => ({
    ...i,
    usuario: userMap[i.email] ?? null,
  }));
};

const remover = (id) =>
  prisma.newsletter.update({ where: { id: Number(id) }, data: { ativo: false } })

module.exports = { inscrever, listar, remover }
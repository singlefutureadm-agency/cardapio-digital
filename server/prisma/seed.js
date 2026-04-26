const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')
async function main() {
  const categorias = await prisma.menuCategoria.createMany({
    data: [
      { nome: 'Entradas', ordem: 1 },
      { nome: 'Pratos Principais', ordem: 2 },
      { nome: 'Bebidas', ordem: 3 },
      { nome: 'Sobremesas', ordem: 4 },
    ],
  })

  const cat = await prisma.menuCategoria.findMany()
  const byName = Object.fromEntries(cat.map(c => [c.nome, c.id]))

  await prisma.menuItem.createMany({
    data: [
      { nome: 'Bruschetta', descricao: 'Pão tostado com tomate e manjericão', preco: 18.9, categoriaId: byName['Entradas'] },
      { nome: 'Frango Grelhado', descricao: 'Filé de frango com legumes grelhados', preco: 42.9, categoriaId: byName['Pratos Principais'] },
      { nome: 'Picanha na Brasa', descricao: 'Picanha 300g com arroz e farofa', preco: 68.9, categoriaId: byName['Pratos Principais'] },
      { nome: 'Suco de Laranja', descricao: 'Natural 500ml', preco: 12.0, categoriaId: byName['Bebidas'] },
      { nome: 'Refrigerante', descricao: 'Lata 350ml', preco: 7.0, categoriaId: byName['Bebidas'] },
      { nome: 'Petit Gateau', descricao: 'Com sorvete de creme', preco: 24.9, categoriaId: byName['Sobremesas'] },
    ],
  })

const senhaHash = await bcrypt.hash('admin123', 10)
await prisma.user.upsert({
  where: { email: 'admin@restaurante.com' },
  update: {},
  create: {
    nome: 'Administrador',
    email: 'admin@restaurante.com',
    senha: senhaHash,
    role: 'ADMIN',
  },
})

await prisma.mesa.createMany({
  data: Array.from({ length: 10 }, (_, i) => ({
    numero: String(i + 1),
    ativa: true,
  })),
  skipDuplicates: true,
})
console.log('✅ Mesas criadas')


  console.log('✅ Seed concluído')
}

main()
    
  .catch(console.error)
  .finally(() => prisma.$disconnect())
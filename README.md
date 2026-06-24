# Entrelinhas — Sistema de Biblioteca

Aplicação full stack para gerenciar livros, autores e categorias. Construída com Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL e Vitest.

## Funcionalidades

- Painel com totais e disponibilidade do acervo;
- cadastro, listagem, edição e exclusão por API de livros, autores e categorias;
- associação de um autor a vários livros (**1:N**);
- associação de livros a várias categorias por `BookCategory` (**N:M**);
- registro de empréstimos entre usuários e livros;
- controle de disponibilidade dos livros;
- respostas HTTP consistentes para validação, conflito e registros ausentes;
- 4 telas: painel, livros, autores e categorias.

## Arquitetura

```text
src/
├── app/                 # Telas e App Router
│   └── api/             # Route Handlers REST
├── components/          # Componentes reutilizáveis
├── lib/                 # Prisma, validação e tratamento HTTP
├── services/            # Regras de acesso a dados e cliente HTTP
└── tests/               # Testes do backend com Vitest
prisma/
├── migrations/          # Histórico versionado do banco
├── schema.prisma        # Modelos e relacionamentos
└── seed.ts              # Dados iniciais
```

O fluxo do backend é `Route Handler → service → Prisma → PostgreSQL`. Os handlers cuidam de HTTP; os services concentram operações de domínio e persistência.

## Pré-requisitos

- Node.js 20.9 ou superior;
- npm;
- PostgreSQL 14+ ou Docker com Compose.

## Instalação

```bash
npm install
cp .env.example .env
```

No PowerShell, copie o ambiente com `Copy-Item .env.example .env`.

Para iniciar o PostgreSQL fornecido pelo projeto:

```bash
docker compose up -d
```

Se usar outro banco, altere `DATABASE_URL` no `.env`.

## Banco, migrations e dados iniciais

Para aplicar migrations já versionadas em um ambiente local ou de produção:

```bash
npm run db:deploy
npm run db:seed
```

Durante o desenvolvimento, depois de alterar `prisma/schema.prisma`, crie uma nova migration:

```bash
npm run db:migrate -- --name descricao_da_mudanca
```

Outros comandos úteis:

```bash
npm run db:generate   # regenera o Prisma Client
npm run db:studio     # abre a interface visual do Prisma
```

## Execução

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Para validar e executar em modo de produção:

```bash
npm run build
npm start
```

## API REST

| Método | Endpoint | Operação |
|---|---|---|
| GET | `/api/books` | Lista livros |
| POST | `/api/books` | Cria livro |
| GET | `/api/books/:id` | Busca livro |
| PUT | `/api/books/:id` | Atualiza livro |
| DELETE | `/api/books/:id` | Exclui livro |
| GET | `/api/authors` | Lista autores |
| POST | `/api/authors` | Cria autor |
| GET | `/api/authors/:id` | Busca autor |
| PUT | `/api/authors/:id` | Atualiza autor |
| DELETE | `/api/authors/:id` | Exclui autor |
| GET | `/api/categories` | Lista categorias |
| POST | `/api/categories` | Cria categoria |
| GET | `/api/categories/:id` | Busca categoria |
| PUT | `/api/categories/:id` | Atualiza categoria |
| DELETE | `/api/categories/:id` | Exclui categoria |
| GET | `/api/stats` | Retorna indicadores |

Exemplo para criar um livro:

```json
{
  "title": "Clean Architecture",
  "description": "Princípios de arquitetura de software",
  "publishedYear": 2017,
  "authorId": 1,
  "categoryIds": [1, 2],
  "available": true
}
```

## Testes

Os testes de backend isolam os Route Handlers com mocks dos services; assim são rápidos, determinísticos e não exigem banco ativo.

```bash
npm test
npm run test:watch
npm run test:coverage
```

Antes de entregar alterações, rode também:

```bash
npm run lint
npm run build
```

## Boas práticas adotadas

- TypeScript em modo `strict` e aliases de importação;
- singleton do Prisma para evitar excesso de conexões em desenvolvimento;
- migrations versionadas e `.env` fora do Git;
- validação na fronteira HTTP e status adequados (`201`, `204`, `400`, `404`, `409`, `500`);
- services separados dos handlers para reduzir acoplamento e facilitar testes;
- constraints e índices no banco (`unique` para e-mail/categoria e chaves estrangeiras indexadas);
- deleção restrita nos empréstimos e cascade apenas na tabela de junção N:M;
- seed idempotente para categorias e livros de exemplo.

Em produção, use uma credencial de banco exclusiva, mantenha segredos no provedor de deploy, execute `prisma migrate deploy` no pipeline e adicione autenticação/autorização antes de expor operações administrativas.

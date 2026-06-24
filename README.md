# Entrelinhas — Sistema de Biblioteca

Aplicação full stack para gerenciar livros, autores, categorias, usuários e empréstimos. Construída com Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, Vitest e Docker.

## Funcionalidades

- Painel com totais e disponibilidade do acervo;
- cadastro, listagem, edição e exclusão de livros, autores, categorias, usuários e empréstimos;
- associação de um autor a vários livros (**1:N**);
- associação de livros a várias categorias por `BookCategory` (**N:M**);
- registro de empréstimos entre usuários e livros;
- controle de disponibilidade dos livros;
- respostas HTTP consistentes para validação, conflito e registros ausentes;
- 6 telas: painel, livros, autores, categorias, usuários e empréstimos.

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

## Modelo de dados e relações

O banco possui seis tabelas principais: `User`, `Author`, `Book`, `Category`, `BookCategory` e `Loan`.

- **Author 1:N Book:** um autor pode possuir vários livros; cada livro possui um autor;
- **Book N:M Category:** livros e categorias relacionam-se pela tabela explícita `BookCategory`;
- **User 1:N Loan:** um usuário pode possuir vários empréstimos;
- **Book 1:N Loan:** um livro mantém seu histórico de empréstimos;
- `LoanStatus` controla os estados `ACTIVE` e `RETURNED`.

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

## Executando com Docker

O Docker Compose inicia somente os serviços essenciais: a aplicação Next.js e o PostgreSQL. O banco usa um volume persistente, enquanto o código-fonte é montado no container da aplicação para manter o hot reload.

Primeiro, crie o arquivo local de ambiente:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

No `.env`, `DATABASE_URL` usa `localhost` e continua válida para executar o Next.js fora do Docker. Dentro do container, o Compose sobrescreve essa variável para usar o serviço `postgres`:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/biblioteca_db?schema=public"
```

Construa as imagens e inicie os dois serviços:

```bash
docker compose up --build
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000). Para iniciar em segundo plano, use `docker compose up --build -d`.

Na primeira execução, aplique as migrations e, opcionalmente, carregue os dados iniciais:

```bash
docker compose exec app npx prisma generate
docker compose exec app npx prisma migrate dev
docker compose exec app npx prisma db seed
```

Comandos úteis:

```bash
docker compose logs -f app       # acompanha os logs do Next.js
docker compose logs -f postgres  # acompanha os logs do banco
docker compose ps                # mostra o estado dos containers
docker compose down              # para e remove os containers
```

O comando `docker compose down` preserva os dados. Para também remover os volumes e apagar o banco do ambiente Docker, use `docker compose down -v` com cuidado.

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
| GET | `/api/users` | Lista usuários |
| POST | `/api/users` | Cria usuário |
| GET | `/api/users/:id` | Busca usuário e empréstimos |
| PUT | `/api/users/:id` | Atualiza usuário |
| DELETE | `/api/users/:id` | Exclui usuário sem empréstimo ativo |
| GET | `/api/loans` | Lista empréstimos e filtra por status |
| POST | `/api/loans` | Registra empréstimo |
| GET | `/api/loans/:id` | Busca empréstimo |
| PUT | `/api/loans/:id` | Atualiza empréstimo |
| PUT | `/api/loans/:id/return` | Registra devolução |
| DELETE | `/api/loans/:id` | Exclui empréstimo devolvido |
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

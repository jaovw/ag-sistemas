# AG Sistemas

# Plataforma de Gestão para Grupos de Networking

**Stack escolhida**: Monolito Next.js (Frontend + API Routes) + PostgreSQL (Prisma ORM). Autenticação com NextAuth (ou Supabase Auth), Storage em S3/Supabase Storage, opcional Redis para cache.

> Observação: foco inicial do desenvolvimento será o fluxo "Gestão de membros" — por isso o modelo de dados e endpoints estão simplificados para esse domínio, mantendo extensibilidade.
> 

---

## 1. Visão Geral / Diagrama de Arquitetura

Abaixo um diagrama mermaid simples mostrando os componentes e comunicação.

```mermaid
flowchart LR
  subgraph Frontend
    A[Next.js - App & Pages]
  end

  subgraph Backend
    B[Next API Routes]
    C[Prisma Service - server]
  end

  subgraph DB
    D[PostgreSQL]
  end

  subgraph Auth
    F[NextAuth]
  end

  A -->|HTTP / SSR| B
  B --> C
  A --> F
  B --> F
  C -->|SQL| D
  D --> C

```

---

## 2. Modelo de Dados (focado em Gestão de Membros)

Escolha: **PostgreSQL** (relacional) — justificativa: domínio com relacionamentos fortes (membros, indicações, reuniões, pagamentos), consistência transacional e capacidade de consultas complexas e agregações para relatórios. Prisma fornece migrations, tipagem TypeScript e excelente DX.

### Entidades principais (resumido)

- `MembershipIntent` — formulário público de intenção de participação (aprovado/recusado/pendente)
- `Member` — cadastro completo do membro (após aprovação)
- `Role` — papéis (admin, organizer, member)
- `Attendance` — controle de presença em reuniões
- `Notice` — avisos/comunicados (simples)

### Esquema exemplo (Prisma schema simplified)

```tsx
// schema.prisma (exemplo simplificado)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Role {
  id    Int    @id @default(autoincrement())
  name  String @unique
  users Member[]
}

model MembershipIntent {
  id          Int      @id @default(autoincrement())
  name        String
  email       String
  phone       String?
  message     String?
  status      String   @default("PENDING") // PENDING | APPROVED | REJECTED
  createdAt   DateTime @default(now())
  processedAt DateTime?
  processedBy Int?     // admin user id
}

model Member {
  id         Int      @id @default(autoincrement())
  name       String
  email      String   @unique
  phone      String?
  company    String?
  position   String?
  roleId     Int
  role       Role     @relation(fields: [roleId], references: [id])
  createdAt  DateTime @default(now())
}

model Attendance {
  id        Int      @id @default(autoincrement())
  memberId  Int
  eventDate DateTime
  status    String   @default("PRESENT") // PRESENT | ABSENT | EXCUSED
  member    Member   @relation(fields: [memberId], references: [id])
}

model Notice {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  authorId  Int?
  createdAt DateTime @default(now())
}

```

> Observação: como o foco inicial é apenas Gestão de Membros, modelos como Indication / 1to1 / Payments podem ser adicionados depois com migrações incrementais.
> 

---

## 3. Organização do Projeto (Next.js) — estrutura mínima sugerida

```
/ (root)
├─ /app
│  ├─ /members
│  │  ├─ page.tsx
│  │  └─ [id]
│  ├─ /admin
│  │  └─ /intents
│  │     └─ page.tsx
│  └─ _app.tsx
├─ /components
│  ├─ MemberCard.tsx
│  ├─ IntentForm.tsx
│  └─ Layout.tsx
├─ /lib
│  ├─ prisma.ts          // instancia do Prisma
│  └─ auth.ts            // helpers NextAuth / middleware
├─ /services
│  ├─ memberService.ts   // lógica seguindo SOLID (use cases)
│  └─ intentService.ts
├─ /pages (se usar pages router)
│  └─ api
│     ├─ admin
│     │  └─ intents.ts   // API Route exemplo
│     └─ members.ts
├─ /hooks
│  └─ useAuth.ts
├─ /styles
├─ prisma/schema.prisma
├─ next.config.js
└─ package.json

```

### Padrões Frontend

- Componentes pequenos e reutilizáveis (atom -> molecule -> organism).
- State local para formulários; state global mínimo (ex: React Context ou Zustand) para auth e sessão.
- Fetching: use `fetch` / `SWR` / `React Query` para cache e revalidação onde necessário.

---

## 4. Definição da API (Next API Routes) — principais endpoints (exemplos)

> Padrões: usar controllers finos que delegam a services/repositories (princípio da responsabilidade única). Validação de entrada com Zod e DTOs, erros padronizados.
> 

### 4.1 - Listar intenções de participação (Admin)

- **Rota**: `GET /api/admin/intents`
- **Autenticação**: admin role required
- **Response (200)**: JSON array de intents

```json
// Exemplo response
[
  {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria@example.com",
    "status": "PENDING",
    "createdAt": "2025-11-04T...Z"
  }
]

```

### 4.2 - Aprovar / Recusar intenção (Admin)

- **Rota**: `POST /api/admin/intents/:id/approve`
- **Body**: `{ "action": "approve" | "reject", "notes"?: string }`
- **Behavior**: se `approve` -> cria registro em `Member` (ou cria rascunho para completar cadastro) e muda `MembershipIntent.status` para `APPROVED`; se `reject` -> status `REJECTED`.

```json
// Request body
{ "action": "approve" }

// Response
{ "ok": true, "memberId": 42 }

```

### 4.3 - Cadastro completo do membro (após aprovação)

- **Rota**: `POST /api/members`
- **Auth**: protected (admin ou self-flow com token do intent)
- **Body**: `{ name, email, phone, company, position, roleId }`
- **Response**: criado Member

```json
// Request
{
  "name": "Joao Victor",
  "email": "joao@ex.com",
  "phone": "+55...",
  "company": "Minha Empresa",
  "position": "CEO",
  "roleId": 2
}

// Response
{ "id": 10, "name": "Joao Victor", "email": "joao@ex.com" }

```

### 4.4 - Consultar membro por id

- **Rota**: `GET /api/members/:id`
- **Response**: objeto Member com campos básicos.

```json
{
  "id": 10,
  "name": "Joao Victor",
  "email": "joao@ex.com",
  "company": "Minha Empresa",
  "position": "CEO",
  "role": { "id": 2, "name": "member" }
}

```

> Outros endpoints (presença, avisos, etc.) podem seguir o mesmo padrão e serão adicionados posteriormente.
> 

---

## 5. Design & Padrões de Código (breve)

- **SOLID**: separar repositório (Prisma calls) de serviços (regra de negócio) e de controllers (API Routes).
- **DTOs/Validation**: usar Zod para validar e tipar request bodies.
- **Erro e logs**: padronizar respostas de erro `{ error: { code, message } }`. Integrar Sentry (opcional).
- **Transações**: use `prisma.$transaction` quando criar Member + atualizar Intent para garantir consistência.

**Exemplo simples de service/controller split (pseudocódigo)**

```tsx
// services/intentService.ts
export class IntentService {
  constructor(private intentRepo: IntentRepository) {}
  async approveIntent(id: number, adminId: number) {
    const intent = await this.intentRepo.findById(id)
    if (!intent) throw new NotFoundError()
    return prisma.$transaction(async (tx) => {
      const member = await tx.member.create({ data: { name: intent.name, email: intent.email } })
      await tx.membershipIntent.update({ where: { id }, data: { status: 'APPROVED', processedBy: adminId } })
      return member
    })
  }
}

```

---

## 6. Autenticação e Autorização

- **NextAuth** (JWT / session) com callback para incluir `role`.
- Proteja rotas API com middleware que valida sessão e role (admin).
- Tokens curtos para flows públicos (ex: link de continuação do cadastro após aprovação).

---

## 7. Desenvolvimento Local & Uso do pgAdmin / Docker

- Você já tem **pgAdmin** no Windows 11 — ótimo para inspecionar o banco local.
- Sugestão local: use um Postgres local ou via Docker. Exemplo Rápido (docker run):

```bash
# Rodar Postgres para desenvolvimento
docker run --rm -d \
  --name networking-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=networking_dev \
  -p 5432:5432 \
  postgres:15

# Em seguida configure sua URL:
# postgres://postgres:postgres@localhost:5432/networking_dev

```

- No **pgAdmin**, adicione um servidor apontando para `localhost:5432` com as credenciais acima.
- Quando for subir o projeto em Docker (futuro), inclua `Dockerfile` e `docker-compose.yml` com serviços `app` e `db` (Postgres). Configure `volumes` para persistência e `depends_on`.

---

## 8. Variáveis de Ambiente (exemplo essencial)

- `DATABASE_URL` (Postgres)
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `S3_BUCKET`, `S3_KEY`, `S3_SECRET`
- `SENTRY_DSN` (opcional)

---

## 9. Observações finais e próximos passos

1. Este documento prioriza simplicidade e pragmatismo: monolito Next.js + Prisma é rentável e alinhado ao seu objetivo.
2. Para iniciar o desenvolvimento da **Gestão de Membros** implemente na ordem:
    - model/prisma + migrations
    - serviços/repositories
    - API Routes (listar intents, aprovar/rejeitar)
    - UI admin (lista de intents + fluxo de aprovação)
3. Posso gerar a base inicial do projeto (ex.: `prisma/schema.prisma`, `lib/prisma.ts`, exemplos de API Routes e serviços) — se quiser eu gero os arquivos de exemplo agora.

---

*Documento gerado com foco em clareza e extensibilidade — se quiser, faço ajustes (mais entidades, endpoints, ou exemplo de `docker-compose.yml`).*
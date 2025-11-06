# 📘 AG Sistemas — Plataforma de Gestão para Grupos de Networking

> **Stack:** Next.js (App Router + Server Components + Server Actions) • Node.js • Prisma ORM • PostgreSQL  
> **Infra:** Docker + Docker Compose  
> **Foco:** Fluxo de **Gestão de Membros** — formulário público, aprovação administrativa e convite.

---

## 🚀 1. Instalação e configuração local (sem Docker)

### 🔧 Pré-requisitos
- Node.js ≥ 18  
- npm (ou yarn)  
- PostgreSQL ≥ 14  
- Prisma CLI (`npx prisma -v`)  

### ⚙️ Passos

```bash
git clone https://github.com/seuusuario/ag-sistemas.git
cd ag-sistemas
npm install
cp .env.example .env
```

Edite o `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/networking_dev"
ADMIN_SECRET="minha_senha_super_segura"
NEXTAUTH_SECRET="um_secret_qualquer"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 🗄️ Criação do banco e Prisma
```bash
npx prisma generate
npx prisma db push
```

### ▶️ Rodar o servidor local
```bash
npm run dev
```
Acesse `http://localhost:3000`.

---

## 🐳 2. Execução com Docker e Docker Compose

### ⚙️ Build e execução
```bash
cp .env.example .env
docker compose up --build
```
Acesse `http://localhost:3000`

### 🔄 Parar containers
```bash
docker compose down
```

### 🧹 Remover tudo (inclusive dados do banco)
```bash
docker compose down -v
```

---

## 🧪 3. Executar testes

### ✅ Unitários
```bash
npm run test:unit
```

### 🔗 Integração
```bash
npm run test:integration
```

---

## 🌐 4. Endpoints principais

| Método | Endpoint | Descrição | Auth |
|--------|-----------|------------|------|
| POST | `/api/intents` | Cria intenção de participação | Público |
| GET  | `/api/intents` | Lista intenções pendentes | Admin |
| POST | `/api/intents/[id]` | Aprova ou rejeita intenção | Admin |
| GET  | `/api/invites/validate?token=...` | Valida token de convite | Público |
| POST | `/api/invites/register` | Cadastra membro via token | Público |

---

## 🧰 5. Collection Postman

Crie um arquivo `AG-Sistemas.postman_collection.json` com o conteúdo abaixo e importe no Postman.

```json
{
  "info": {
    "_postman_id": "b39c1e12-4a51-4f80-a202-4c92b7a4d2f7",
    "name": "AG Sistemas - Networking API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Criar Intenção",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Maria Teste\",\n  \"email\": \"maria@example.com\",\n  \"company\": \"Empresa X\",\n  \"message\": \"Quero participar do grupo\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/intents",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "intents"]
        }
      }
    },
    {
      "name": "Listar Intenções (Admin)",
      "request": {
        "method": "GET",
        "header": [{ "key": "x-admin-secret", "value": "minha_senha_super_segura" }],
        "url": {
          "raw": "http://localhost:3000/api/intents",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "intents"]
        }
      }
    }
  ]
}
```

---

## 🧩 6. Páginas do Frontend

| Página | Caminho | Acesso |
|---------|----------|--------|
| Formulário público | `/intents` | Aberto |
| Área administrativa | `/admin/intents?adminSecret=SUASENHA` | Protegido |

---

## 🧾 7. Estrutura de Pastas

```
src/
 ├── app/
 │   ├── api/
 │   ├── intents/
 │   └── admin/intents/
 ├── components/
 ├── server/
 │   ├── repositories/
 │   ├── services/
 │   └── actions/
 ├── lib/prisma.ts
 ├── types/
 │   ├── entities.ts
 │   └── dto.ts
prisma/schema.prisma
docker-compose.yml
Dockerfile
docker-entrypoint.sh
```

---

## 🧱 8. Comandos úteis

| Ação | Comando |
|------|----------|
| Rodar localmente | `npm run dev` |
| Build de produção | `npm run build` |
| Rodar produção local | `npm run start` |
| Rodar com Docker | `docker compose up --build` |
| Testes unitários | `npm run test:unit` |
| Testes integração | `npm run test:integration` |
| Acessar container | `docker exec -it ag_sistemas_app sh` |

---

## 🧠 9. Problemas comuns

| Erro | Solução |
|------|----------|
| `prisma: Command not found` | Rode `npm install` e `npx prisma generate` |
| `Port 3000 in use` | Altere a porta em `docker-compose.yml` |
| `Database not reachable` | Espere o Postgres iniciar (compose tem healthcheck) |
| Overlay de erro Next | Verifique logs no terminal |

---


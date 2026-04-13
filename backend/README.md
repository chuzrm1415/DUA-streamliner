# DUA Streamliner — Backend

NestJS REST API + asynchronous document processing worker for the DUA Streamliner system.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Architecture Overview](#architecture-overview)
6. [API Endpoints](#api-endpoints)
7. [Processing Pipeline](#processing-pipeline)
8. [Design Patterns](#design-patterns)
9. [Authentication & Authorization](#authentication--authorization)
10. [Testing](#testing)
11. [Docker](#docker)
12. [CI/CD](#cicd)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 (Express adapter) |
| Language | TypeScript 5.9 |
| Runtime | Node.js 22 LTS |
| Database | PostgreSQL 16 + Prisma 6 ORM |
| Queue | BullMQ 5 + Redis 7 |
| Storage | Azure Blob Storage (SDK v12) |
| Auth | Passport.js + Azure Entra ID (OAuth2/OIDC) |
| AI Extraction | OpenAI API (GPT-4o) |
| PDF Parsing | pdf-parse |
| DOCX Parsing | mammoth |
| XLSX Parsing | xlsx |
| OCR | Tesseract.js 5 |
| Word Generation | docx 9 |
| Validation | Zod 4 |
| Logging | Winston 3 + Azure Application Insights |
| Security | Helmet 7, ThrottlerModule |
| API Docs | Swagger / OpenAPI 3 |
| Unit Tests | Jest 30 |
| E2E Tests | Supertest 7 |
| Linting | ESLint 10 + Prettier 3 |
| Git Hooks | Husky 9 |
| CI/CD | Azure DevOps Pipelines |
| Containers | Docker 26 + Azure Container Apps |

---

## Project Structure

```
dua-backend/
├── src/
│   ├── main.ts                         # API bootstrap
│   ├── worker.main.ts                  # Standalone worker bootstrap
│   ├── app.module.ts                   # Root module
│   │
│   ├── config/
│   │   └── app.config.ts               # Typed env var accessors
│   │
│   ├── database/
│   │   ├── prisma.service.ts
│   │   └── database.module.ts
│   │
│   ├── logger/
│   │   ├── app-logger.service.ts       # Winston structured logger
│   │   └── logger.module.ts
│   │
│   ├── storage/
│   │   ├── storage.service.ts          # Azure Blob Storage
│   │   └── storage.module.ts
│   │
│   ├── ai/
│   │   ├── ai.service.ts               # OpenAI semantic extraction
│   │   └── ai.module.ts
│   │
│   ├── common/
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts
│   │   └── types/
│   │       └── index.ts                # Shared domain types
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── azure-ad.strategy.ts    # Passport Bearer strategy
│   │   │   ├── auth.module.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── decorators/
│   │   │       ├── roles.decorator.ts
│   │   │       └── current-user.decorator.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.service.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.module.ts
│   │   │
│   │   ├── sessions/
│   │   │   ├── sessions.service.ts     # Upload, queue dispatch, status
│   │   │   ├── sessions.controller.ts
│   │   │   ├── sessions.module.ts
│   │   │   └── dto/session.dto.ts
│   │   │
│   │   ├── dua/
│   │   │   ├── dua.service.ts          # Review, finalize, download
│   │   │   ├── dua.controller.ts
│   │   │   └── dua.module.ts
│   │   │
│   │   └── health/
│   │       ├── health.controller.ts
│   │       └── health.module.ts
│   │
│   └── workers/
│       └── document-processing/
│           ├── queue.constants.ts
│           ├── document-parser.strategies.ts   # Strategy Pattern
│           ├── dua-document.generator.ts       # Adapter Pattern
│           ├── document-processing.worker.ts   # BullMQ processor
│           └── document-processing-worker.module.ts
│
├── prisma/
│   └── schema.prisma                   # DB schema (User, Session, Document, Job, DuaData)
│
├── test/
│   ├── jest-e2e.json
│   └── health.e2e-spec.ts
│
├── Dockerfile                          # Multi-stage (api + worker targets)
├── docker-compose.yml                  # Local dev (postgres + redis + api + worker)
├── azure-pipelines.yml                 # CI/CD pipeline
├── jest.config.ts
├── nest-cli.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose (recommended for local dependencies)
- Azure Entra ID app registration
- OpenAI API key (or Azure OpenAI endpoint)

### 1 — Install dependencies

```bash
npm install
```

### 2 — Start local infrastructure

```bash
docker compose up postgres redis -d
```

### 3 — Configure environment

```bash
cp .env.example .env
# Fill in .env with your credentials
```

### 4 — Run database migrations

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 5 — Start API (development)

```bash
npm run start:dev
```

### 6 — Start worker (separate terminal)

```bash
npm run start:worker
```

> In development the worker is also embedded inside the API process via `AppModule`. The separate `start:worker` command runs a standalone worker process for production-like testing.

### Swagger

Available at `http://localhost:3001/api/v1/docs` in non-production environments.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values.

| Variable | Description |
|---|---|
| `PORT` | API listen port (default `3001`) |
| `DATABASE_URL` | Prisma PostgreSQL connection string |
| `REDIS_HOST` / `REDIS_PORT` | BullMQ queue backend |
| `AZURE_AD_TENANT_ID` | Azure Entra ID tenant |
| `AZURE_AD_CLIENT_ID` | Azure Entra ID app client ID |
| `AZURE_AD_AUDIENCE` | Token audience (e.g. `api://<client-id>`) |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection string |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Model name (default `gpt-4o`) |
| `MAX_FILE_SIZE_MB` | Per-file upload limit (default `50`) |
| `QUEUE_CONCURRENCY` | Worker concurrency (default `5`) |
| `QUEUE_MAX_RETRIES` | BullMQ retry attempts (default `3`) |
| `APPINSIGHTS_CONNECTION_STRING` | Azure Application Insights |

---

## Architecture Overview

```
HTTP Request
     │
     ▼
┌──────────────────┐
│  main.ts         │  Helmet · CORS · Throttler · Swagger · ValidationPipe
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Auth Layer      │  Passport AzureAD BearerStrategy → JWT validation
│  (Middleware)    │  JwtAuthGuard + RolesGuard on every protected route
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Controllers     │  SessionsController · DuaController · UsersController
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Services        │  SessionsService · DuaService · UsersService · AiService
└────────┬─────────┘
         │
    ┌────┴──────┐
    │           │
┌───▼───┐  ┌───▼──────────────────┐
│Prisma │  │  BullMQ Queue        │
│  DB   │  │  (Redis)             │
└───────┘  └──────────┬───────────┘
                       │
              ┌────────▼─────────┐
              │  Worker Process  │  DocumentProcessingWorker
              │  (async)         │  ├── Parse (PDF/DOCX/XLSX/OCR)
              │                  │  ├── AI Extraction (OpenAI)
              │                  │  ├── Map to DuaFields
              │                  │  └── Generate .docx
              └────────┬─────────┘
                       │
              ┌────────▼─────────┐
              │  Azure Blob      │  Uploads + Generated DUA docs
              └──────────────────┘
```

---

## API Endpoints

All routes are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <azure_token>`.

### Health
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Overall health (DB + Redis) |
| GET | `/health/liveness` | Liveness probe |
| GET | `/health/readiness` | Readiness probe |

### Sessions
| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/sessions` | CUSTOMS_AGENT | Upload files, start processing |
| GET | `/sessions` | Any | List user's sessions |
| GET | `/sessions/:id` | Any | Get session status + details |

### DUA
| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/sessions/:id/dua/preliminary` | CUSTOMS_AGENT | Get extracted DUA fields |
| PATCH | `/sessions/:id/dua/fields` | CUSTOMS_AGENT | Update fields after review |
| POST | `/sessions/:id/dua/final` | CUSTOMS_AGENT | Generate final DUA document |
| GET | `/sessions/:id/dua/download` | CUSTOMS_AGENT | Download `.docx` file |

### Users
| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/users/me` | Any | Get current user |
| GET | `/users` | MANAGER | List all users |
| PATCH | `/users/:id/role` | MANAGER | Update user role |
| PATCH | `/users/:id/deactivate` | MANAGER | Deactivate user |

---

## Processing Pipeline

The worker executes these steps for each job:

```
1. Mark job PROCESSING
2. For each document:
   a. Download from Azure Blob Storage
   b. Select parsing strategy (PDF / DOCX / XLSX / OCR)
   c. Extract raw text
   d. Store extracted text in DB
3. Send combined text to OpenAI for semantic extraction
4. Map extracted data → DuaField[] with confidence levels
5. Store preliminary DuaData in DB
6. Generate preliminary .docx with confidence color coding
7. Upload .docx to Azure Blob Storage
8. Mark session status → REVIEW
```

**Retry policy:** Exponential backoff, up to 3 attempts per job (configurable).

**Graceful degradation:**
- AI extraction failure → fields marked `low` confidence, user reviews manually
- OCR failure → document skipped, session continues

---

## Design Patterns

### Strategy Pattern — Document Parsing
`DocumentParserContext` selects the correct strategy at runtime based on `DocumentFormat`:
- `PdfParsingStrategy` → pdf-parse
- `DocxParsingStrategy` → mammoth
- `XlsxParsingStrategy` → xlsx
- `OcrParsingStrategy` → Tesseract.js

### Adapter Pattern — DUA Document Generation
`DuaDocumentGenerator` transforms `DuaField[]` into a `.docx` Word document with color-coded confidence cells (green / yellow / red) using the `docx` library.

### Observer Pattern — Async Status Updates
BullMQ job events + Prisma DB updates propagate session status changes. The frontend polls `GET /sessions/:id` to observe progress in real time.

---

## Authentication & Authorization

- **Provider:** Azure Entra ID via Passport.js `BearerStrategy`
- **Token type:** JWT (Azure-issued access token)
- **Validation:** Signature verified against Azure OIDC metadata endpoint
- **User upsert:** On first login, the user is created in the DB from the JWT claims

### RBAC

| Permission | MANAGER | CUSTOMS_AGENT |
|---|:---:|:---:|
| List/manage users | ✅ | ❌ |
| View reports | ✅ | ❌ |
| Upload files | ❌ | ✅ |
| Process documents | ❌ | ✅ |
| Review/edit DUA | ❌ | ✅ |
| Generate final DUA | ❌ | ✅ |
| Download DUA | ❌ | ✅ |

---

## Testing

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# E2E tests (requires running DB + Redis)
npm run test:e2e
```

Coverage threshold: **70%** across branches, functions, lines, statements.

---

## Docker

### Build images

```bash
# API image
docker build --target api -t dua-api .

# Worker image
docker build --target worker -t dua-worker .
```

### Run full stack locally

```bash
docker compose up
```

This starts PostgreSQL, Redis, the API, and the worker with all services wired together.

---

## CI/CD

Pipeline defined in `azure-pipelines.yml`:

| Branch | Environment | Steps |
|---|---|---|
| `develop` | Development | Install → Lint → Test → Docker build → Deploy |
| `staging` | Staging | Same + staging Container App |
| `main` | Production | Manual approval gate required |

Both `dua-api` and `dua-worker` Docker images are built and pushed to Azure Container Registry, then deployed to Azure Container Apps independently so each can scale separately.

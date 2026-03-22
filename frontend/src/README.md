# DUA Generator — Frontend

Server-Side Rendered web application for automated DUA (Documento Único Aduanero) generation, built with Next.js 15, React 19, TypeScript, Material UI, and Tailwind CSS.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Architecture Overview](#architecture-overview)
6. [Design Patterns](#design-patterns)
7. [Authentication & Authorization](#authentication--authorization)
8. [Testing](#testing)
9. [CI/CD](#cicd)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, SSR) |
| UI | React 19 + Material UI 6 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 + MUI Theme |
| State | Zustand 5 (client) + TanStack Query 5 (server) |
| Forms | React Hook Form 7 + Zod 4 |
| File upload | React Dropzone 14 |
| Auth | NextAuth.js 5 + Azure Entra ID (SSO/MFA) |
| Unit tests | Jest 30 + React Testing Library 15 |
| E2E tests | Playwright 1.58 |
| Linting | ESLint 10 + Prettier 3 |
| Git hooks | Husky 9 + lint-staged |
| Hosting | Azure App Service |
| CI/CD | Azure DevOps Pipelines |
| Monitoring | Azure Application Insights |

---

## Project Structure

```
dua-frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (providers)
│   │   ├── page.tsx                # Root redirect
│   │   ├── globals.css
│   │   ├── api/auth/[...nextauth]/ # NextAuth route handler
│   │   ├── auth/login/             # Public login page
│   │   └── protected/              # Authenticated pages
│   │       ├── layout.tsx          # Protected shell (SSR auth check)
│   │       ├── dashboard/
│   │       ├── document-processing/
│   │       └── dua-preview/
│   │
│   ├── auth/                       # NextAuth config & session provider
│   │   ├── auth.config.ts
│   │   └── auth.provider.tsx
│   │
│   ├── components/                 # Atomic Design
│   │   ├── atoms/                  # ConfidenceBadge, StatusIndicator
│   │   ├── molecules/              # FileDropzone, DUAFieldRow
│   │   ├── organisms/              # Sidebar, TopBar, DUAPreviewPanel
│   │   └── templates/             # ProtectedLayout
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   ├── useDUAProcessing.ts     # Main workflow orchestration
│   │   └── useFileUpload.ts
│   │
│   ├── stores/                     # Zustand stores (Observer Pattern)
│   │   ├── processingStore.ts
│   │   └── uiStore.ts
│   │
│   ├── services/                   # Business logic
│   │   ├── authService.ts
│   │   └── duaService.ts           # Strategy + Adapter patterns
│   │
│   ├── api-clients/                # HTTP layer
│   │   ├── apiClient.ts            # Base fetch wrapper
│   │   └── duaApiClient.ts         # DUA-specific endpoints
│   │
│   ├── lib/                        # Shared utilities & providers
│   │   ├── permissions.ts          # RBAC definitions
│   │   ├── validations.ts          # Zod schemas
│   │   ├── queryProvider.tsx       # TanStack Query setup
│   │   └── muiProvider.tsx         # MUI ThemeProvider
│   │
│   ├── config/
│   │   ├── theme.ts                # MUI theme (colors, typography)
│   │   └── app.config.ts           # Environment variable accessors
│   │
│   ├── middleware/
│   │   └── authMiddleware.ts       # Route protection middleware
│   │
│   ├── utils/
│   │   └── index.ts                # Date, currency, file, string helpers
│   │
│   └── types/
│       ├── index.ts                # Shared TypeScript interfaces
│       └── next-auth.d.ts          # NextAuth type augmentation
│
├── tests/
│   ├── setup.ts                    # Jest setup
│   ├── unit/                       # Jest + RTL tests
│   └── e2e/                        # Playwright tests
│
├── public/media/                   # Static assets / wireframe images
├── .env.example                    # Environment variable template
├── azure-pipelines.yml             # CI/CD pipeline
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.ts
└── playwright.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+
- Azure Entra ID app registration (for SSO)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd dua-frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Azure credentials

# 4. Install Husky git hooks
npm run prepare

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL of the app |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL |
| `AUTH_SECRET` | NextAuth secret (random string) |
| `AUTH_AZURE_AD_CLIENT_ID` | Azure Entra ID app client ID |
| `AUTH_AZURE_AD_CLIENT_SECRET` | Azure Entra ID client secret |
| `AUTH_AZURE_AD_TENANT_ID` | Azure tenant ID |
| `AZURE_KEY_VAULT_URL` | Azure Key Vault URL (server-side) |
| `NEXT_PUBLIC_APP_INSIGHTS_CONNECTION_STRING` | Application Insights |

> **Important:** Never commit `.env.local`. Secrets are managed via Azure Key Vault in production.

---

## Architecture Overview

The frontend follows a **layered architecture**:

```
Browser Request
      │
      ▼
┌─────────────────────┐
│  Rendering Layer    │  SSR (Next.js App Router) + Client Hydration
└────────┬────────────┘
         │
┌────────▼────────────┐
│  Auth Layer         │  NextAuth.js + Azure Entra ID middleware
└────────┬────────────┘
         │
┌────────▼────────────┐
│  Components Layer   │  Atomic Design (Atoms → Molecules → Organisms → Templates)
└────────┬────────────┘
         │
┌────────▼────────────┐
│  Hooks Layer        │  useAuth, useDUAProcessing, useFileUpload, usePermissions
└────────┬────────────┘
         │
┌────────▼────────────┐
│  State Layer        │  Zustand (UI/client state) + TanStack Query (server state)
└────────┬────────────┘
         │
┌────────▼────────────┐
│  Services Layer     │  duaService (Strategy + Adapter patterns)
└────────┬────────────┘
         │
┌────────▼────────────┐
│  API Clients Layer  │  apiClient (base fetch) + duaApiClient (DUA endpoints)
└────────┬────────────┘
         │
┌────────▼────────────┐
│  Config / Utils     │  app.config.ts, theme.ts, utils/index.ts
└─────────────────────┘
```

---

## Design Patterns

### Strategy Pattern — Document Processing (`src/services/duaService.ts`)
Each document format (PDF, DOCX, XLSX, Image) has its own processing strategy. The `DocumentProcessorContext` selects the correct strategy at runtime based on file format.

### Adapter Pattern — DUA Output Formatting (`src/services/duaService.ts`)
The `WordDUAAdapter` transforms raw extracted data into the structure required by the Word template (paragraphs, table cells, labels, monetary values).

### Observer Pattern — UI State Updates (`src/stores/`)
Zustand stores and TanStack Query act as observable state containers. Components subscribe to relevant slices and re-render automatically when state changes — no manual event wiring required.

---

## Authentication & Authorization

- **Provider:** Azure Entra ID via NextAuth.js 5
- **Flow:** OAuth 2.0 / OpenID Connect with SSO + MFA enforced by Azure
- **Sessions:** JWT stored in HttpOnly, Secure, SameSite=Strict cookies
- **Route protection:** `src/middleware/authMiddleware.ts` intercepts every request

### RBAC Roles & Permissions

| Permission | Manager | Customs Agent |
|---|:---:|:---:|
| `MANAGE_USERS` | ✅ | ❌ |
| `VIEW_REPORTS` | ✅ | ❌ |
| `EDIT_TEMPLATES` | ✅ | ❌ |
| `UPLOAD_FILES` | ❌ | ✅ |
| `PROCESS_DOCUMENTS` | ❌ | ✅ |
| `REVIEW_DUA` | ❌ | ✅ |
| `GENERATE_FINAL_DUA` | ❌ | ✅ |
| `DOWNLOAD_DUA` | ❌ | ✅ |

Use the `usePermissions()` hook in components:

```tsx
const { can } = usePermissions();
if (can(PERMISSIONS.GENERATE_FINAL_DUA)) { /* render button */ }
```

---

## Testing

### Unit & Component Tests (Jest + React Testing Library)

```bash
npm run test            # run all unit tests
npm run test:watch      # watch mode
npm run test:coverage   # with coverage report
```

Coverage threshold: **70%** across branches, functions, lines, statements.

### E2E Tests (Playwright)

```bash
npm run test:e2e        # run Playwright tests
```

E2E tests that require an authenticated session use `storageState` — configure `E2E_AUTH_STORAGE` in the environment for CI runs.

---

## CI/CD

Pipeline defined in `azure-pipelines.yml` with three environments:

| Branch | Environment | Steps |
|---|---|---|
| `develop` | Development | Install → Lint → Test → Build → Deploy |
| `staging` | Staging | + E2E Tests |
| `main` | Production | Requires staging success |

Deployments target **Azure App Service** via the `AzureWebApp@1` task.

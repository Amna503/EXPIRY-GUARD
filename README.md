# 🛡️ ExpiryGuard

### AI-Powered Expiry Management & Inventory Intelligence Platform

<p align="center">
  <strong>Track Smarter. Reduce Waste. Make Better Decisions.</strong>
</p>

<p align="center">
  A multi-business inventory intelligence platform for batch-level stock tracking, expiry monitoring,
  AI-assisted risk analysis and waste reduction.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Project-Academic%20%7C%20Innovation-blueviolet" />
  <img src="https://img.shields.io/badge/Platform-Web%20Application-blue" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-2ea44f" />
  <img src="https://img.shields.io/badge/Tests-45%20passing-brightgreen" />
  <img src="https://img.shields.io/badge/Status-Active%20Development-yellow" />
</p>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Key Features](#4-key-features)
5. [Application Pages](#5-application-pages)
6. [Technology Stack](#6-technology-stack)
7. [System Architecture](#7-system-architecture)
8. [Core Database Design](#8-core-database-design)
9. [Repository Structure](#9-repository-structure)
10. [Getting Started](#10-getting-started)
11. [Demo Modes](#11-demo-modes)
12. [Testing & Quality](#12-testing--quality)
13. [Security & Data Integrity](#13-security--data-integrity)
14. [Team Structure](#14-team-structure)
15. [Development Roadmap](#15-development-roadmap)
16. [Expected Impact](#16-expected-impact)
17. [Future Scope](#17-future-scope)
18. [Academic Project Information](#18-academic-project-information)

---

## 1. Project Overview

ExpiryGuard addresses a significant operational problem faced by businesses: **financial losses, product waste and safety risks caused by poor expiry-date monitoring.**

Traditional inventory systems focus on quantities and stock movements. ExpiryGuard adds the missing dimension — **batches, expiry dates, stock rotation and expiry-related loss** — through:

- Batch-level inventory tracking
- Barcode identification and QR-based batch lookup
- Automated expiry monitoring and prioritised alerts
- AI-assisted expiry-risk analysis
- Predictive inventory analytics
- Smart discount and transfer recommendations
- Multi-branch stock visibility

The goal is to move inventory management from a reactive process to a proactive, data-driven operation.

## 2. Problem Statement

Businesses such as supermarkets, pharmacies, restaurants, grocery stores and warehouses regularly face:

- Products expiring before they are sold or consumed
- Financial losses from unsold or unused inventory
- Manual, time-consuming expiry-date checks
- No batch-level stock visibility
- Inefficient stock rotation (no FEFO discipline)
- Limited predictive insight for purchasing decisions
- Difficulty spotting what needs action *today*

These issues lead to avoidable waste, reduced profitability and operational inefficiency.

## 3. Proposed Solution

ExpiryGuard provides one centralised platform to register products, record receiving, monitor every batch, receive expiry alerts and analyse inventory risk.

### Core workflow

1. Register products and receive stock deliveries.
2. Each delivery becomes a batch with quantities and an expiry date.
3. Barcode scanning identifies products instantly.
4. The system continuously evaluates batch expiry status.
5. Alerts highlight what needs attention now.
6. AI-assisted analysis provides risk insights and recommendations.
7. Owners monitor performance through analytics dashboards.

## 4. Key Features

### 📦 Smart Inventory Management
- Product registration with SKU, barcode, category and stock thresholds
- Batch-level records: manufacturing, purchase and expiry dates
- Supplier and branch attribution per batch
- Stock-in (receive) and stock-out (deduct) transactions
- Low-stock and out-of-stock detection

### 📷 Barcode & QR Integration
- Live camera barcode scanning (ZXing)
- QR-code generation for batch records
- Instant product lookup from the scanner page

> **Technical note:** retail barcodes identify a product, not its expiry date. Expiry therefore is recorded at stock receiving or via data integration; QR codes link to the specific batch record.

### ⏰ Expiry Intelligence
- Near-expiry and expired stock detection
- Configurable monitor / expiring-soon windows
- Colour-coded status: Expired → Expires today → 0-7 days → 8-30 days → Safe
- Value-at-risk calculation across expiry bands
- FEFO-first picking guidance

### 🤖 AI-Powered Inventory Analysis
- Demand estimates per batch (moving average / baseline)
- Potential surplus identification with reliability scoring
- Suggested actions: discount, transfer or monitor
- Every estimate is labelled with its method and explanation

AI output is an **estimate for human approval** — prices and transfers are never changed automatically.

### 📊 Business Analytics
- Units on hand and inventory value
- Average days to expiry (unit-weighted)
- Stock distribution by expiry window
- Waste trend: recorded vs estimated prevention
- Breakdown by category and by supplier

### 💰 Smart Discount Recommendations
- Flags near-expiry stock eligible for markdown
- Ranks suggestions by surplus value and reliability
- Approve / dismiss workflow with a full audit trail

### 🔄 Stock Optimization
- FEFO (First Expired, First Out) stock deduction
- Deduct stock from a specific batch
- Inter-branch transfers and disposal readiness
- Batch-level history preserved

### 🏢 Multi-Business Architecture

| Business Type | Primary Use Case |
|---|---|
| Supermarkets | Grocery and packaged-product expiry |
| Pharmacies | Medicine batch and expiry tracking |
| Restaurants | Food inventory and ingredient monitoring |
| Retail Stores | Product stock and expiry management |
| Warehouses | Large-scale batch monitoring |
| Distributors | Multi-location stock visibility |

## 5. Application Pages

The frontend is fully implemented. Every route below renders real content with loading, empty and error states.

| Route | Page | What it does |
|---|---|---|
| `/` | Landing | Product marketing page and CTAs |
| `/login`, `/register` | Auth | Sign in / create account |
| `/onboarding` | Onboarding | First-run setup wizard |
| `/dashboard` | Dashboard | Expiry KPIs, charts, alerts, AI recommendations |
| `/products` | Products | Product master data with search, filters, CRUD |
| `/batches` | Batches | Batch records with filters, details, stock deduction |
| `/receive` | Receive Stock | Delivery form that creates batches + recent receipts |
| `/scanner` | Scanner | Camera barcode scanning and product lookup |
| `/expiry` | Expiry Monitor | All batches ranked by days left + action guide |
| `/insights` | AI Insights | Recommendation cards with approve/dismiss |
| `/analytics` | Analytics | KPIs, expiry/waste charts, category & supplier tables |
| `/branches` | Branches | Per-location stock, risk status, add-branch flow |
| `/team` | Team & Roles | Members, role changes, invites, permission matrix |
| `/settings` | Settings | Store profile, expiry rules, notifications, theme |
| `*` | 404 | Not-found page |

## 6. Technology Stack

### Implemented — Frontend (`client/`)

| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Data fetching | TanStack Query 5 (mock/API switchable) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | lucide-react |
| Scanning / QR | @zxing/browser, @zxing/library, qrcode |
| State | Zustand (lightweight stores) |
| Testing | Vitest + Testing Library (45 tests) |
| Linting | oxlint |

### Planned — Backend, Database, AI

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| AI Service | Python, FastAPI, Pandas, Scikit-learn |
| Validation | Zod (shared contracts) |
| End-to-end tests | Playwright |
| Deployment | Vercel, Render / Railway, Docker |

*The backend and AI service are not part of this repository yet — the client runs fully on seeded demo data until those services exist.*

## 7. System Architecture

```text
                    EXPIRYGUARD
                         |
                  Web Application
                         |
                 React + TypeScript   ← implemented (this repo)
                         |
                     API Layer
                         |
                Node.js + Express      ← planned
                         |
          +--------------+--------------+
          |              |              |
       Auth API     Inventory API   Analytics API
          |              |              |
          +--------------+--------------+
                         |
                    PostgreSQL          ← planned
                         |
                  Python AI Service    ← planned
                      FastAPI
                         |
              +----------+----------+
              |          |          |
           Risk      Forecasting  Insights
          Analysis       Model
              |          |          |
              +----------+----------+
                         |
                 Business Dashboard
```

### Architectural principles

- Frontend, backend and AI responsibilities stay separated
- RESTful API communication with a single response envelope
- Role-based access control and business-level data isolation
- Reusable, modular UI components with pure list helpers
- Demo/real backend switch through one environment flag

## 8. Core Database Design

| Entity | Purpose |
|---|---|
| Users | User accounts and authentication |
| Businesses | Business-level information |
| Business Members | User–business relationships and roles |
| Branches | Business locations |
| Categories | Product classification |
| Products | Product master records |
| Suppliers | Supplier information |
| Batches | Expiry dates and batch quantities |
| Stock Transactions | Inventory movements |
| Sales / Sale Items | Sales records |
| Alerts | Expiry and inventory alerts |
| Notifications | User notifications |
| Forecast Results | AI-generated forecasts |
| Discount Suggestions | Recommended stock actions |
| Stock Transfers | Inter-branch transfers |
| Audit Logs | Important system activities |

**Data integrity principle:** quantities change only through validated transactions; batch records always preserve their expiry dates and history.

### Expected API contract (client already coded against it)

```text
GET    /products                 POST   /products
GET    /products/:id             PUT    /products/:id
GET    /products/lookup?barcode= DELETE /products/:id
GET    /batches                  POST   /batches
GET    /batches/:id              PUT    /batches/:id
DELETE /batches/:id              POST   /batches/:id/deduct   (FEFO)
GET    /analytics/waste          GET    /ai/recommendations
```

Response envelope: `{ success: true, data } | { success: false, error }` — see `client/src/services/http.ts` and `client/src/services/inventoryApi.ts`.

## 9. Repository Structure

```text
EXPIRY-GUARD/
│
├── README.md
│
└── client/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig*.json
    ├── public/                  # favicon, icon sprite
    │
    └── src/
        ├── main.tsx
        ├── App.tsx              # route table
        ├── index.css / App.css
        ├── assets/              # images
        ├── components/
        │   ├── ui/              # Button, Card, Modal, Table helpers, Toast…
        │   ├── charts/          # Expiry + waste charts
        │   ├── inventory/       # Stock/batch badges, QR image
        │   └── DemoBanner.tsx
        ├── layouts/AppLayout.tsx
        ├── pages/
        │   ├── landing/  auth/  onboarding/  dashboard/
        │   ├── products/  batches/  receive/  scanner/
        │   ├── expiry/  insights/  analytics/
        │   ├── branches/  team/  settings/
        │   └── NotFoundPage.tsx
        ├── hooks/               # useInventory, useDashboardData
        ├── services/            # api, inventoryApi, http, mock store
        ├── data/                # seeded demo data
        ├── schemas/             # Zod forms
        ├── types/               # Product, Batch…
        ├── utils/               # expiry, FEFO, list helpers
        └── test/setup.ts
```

## 10. Getting Started

### Prerequisites

- Node.js (LTS) and npm
- Git

### Clone

```bash
git clone https://github.com/Amna503/EXPIRY-GUARD.git
cd EXPIRY-GUARD/client
```

### Install & run

```bash
npm install
npm run dev        # http://localhost:5173
```

### Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run oxlint |
| `npm test` | Run the Vitest suite |

### Environment variables

Create `client/.env` if needed (see `client/.env.example`):

```bash
VITE_USE_MOCK=true          # true = demo data (default), false = call the API
VITE_API_URL=http://localhost:4000/api/v1
```

> **Backend & AI service:** planned as separate `server/` and `ai-service/` directories. Until they exist, leave `VITE_USE_MOCK=true` to run the entire frontend on seeded demo data.

## 11. Demo Modes

Append query flags to any URL while in mock mode:

| URL flag | Effect |
|---|---|
| `?empty=1` | Preview empty states |
| `?fail=1` | Preview error/retry states |

Example: `http://localhost:5173/products?empty=1`

Theme (light/dark) can be toggled from the header moon button and is persisted per device.

## 12. Testing & Quality

```bash
npm test        # Vitest — 45 tests across 8 files
npm run lint    # oxlint
npm run build   # tsc -b + vite build
```

Coverage includes:

- Product and batch list filtering, sorting and stats
- Expiry status and FEFO helpers
- Form validation (login, products, batches)
- Status badge rendering
- Scanner page behaviour
- Smoke tests for all seven module pages (Receive, Expiry, Insights, Analytics, Branches, Team, Settings)

Planned additions: API integration tests (Supertest), end-to-end flows (Playwright) and AI-service contracts (Pytest).

## 13. Security & Data Integrity

Security is a core requirement, not an afterthought.

**Implemented in the client**

- Zod validation on every form before submission
- No secrets in the repository; configuration via environment variables
- Consistent API response envelope with centralised error handling
- Business scope resolved server-side (client never sends `business_id`)

**Planned on the backend**

- Secure authentication with password hashing (cookie sessions)
- Role-based permissions (Owner / Manager / Staff / Viewer)
- Business-level data isolation
- Server-side input validation and protected endpoints
- Database constraints and transactions
- Audit logging and structured error responses

## 14. Team Structure

A five-member team with clearly separated ownership.

| Member | Role | Primary Responsibility |
|---|---|---|
| Member 1 | Project Lead & Frontend Architect | Coordination, frontend architecture, dashboard and integration |
| Member 2 | Frontend & Scanning Developer | Inventory UI, product workflows, barcode and QR |
| Member 3 | Backend & Security Developer | API architecture, authentication, authorisation |
| Member 4 | Database & Inventory Developer | PostgreSQL, Prisma, batch and stock operations |
| Member 5 | AI & Analytics Developer | AI service, expiry-risk analysis, forecasting |

Work happens on feature branches (`feature/*`) with pull requests into `main`.

## 15. Development Roadmap

- [x] Phase 1 — Requirements, planning and system design
- [x] Phase 2 — Frontend foundation, design system and routing
- [x] Phase 3 — Landing, authentication and onboarding
- [x] Phase 4 — Product, batch and inventory modules
- [x] Phase 5 — Barcode scanning and QR generation
- [x] Phase 6 — Expiry monitor and alert states
- [x] Phase 7 — AI insights page (approve/dismiss workflow)
- [x] Phase 8 — Analytics, branches, team and settings pages
- [ ] Phase 9 — Backend API, authentication and database
- [ ] Phase 10 — AI service integration (forecasting endpoints)
- [ ] Phase 11 — End-to-end testing and security review
- [ ] Phase 12 — Deployment and final demonstration

## 16. Expected Impact

ExpiryGuard aims to help businesses:

- Reduce avoidable inventory waste
- Improve expiry-date visibility across branches
- Minimise expiry-related financial losses
- Improve stock rotation through FEFO
- Make informed, evidence-based purchasing decisions
- Save hours spent on manual expiry checks
- Improve operational efficiency

## 17. Future Scope

- Mobile inventory application
- Advanced demand forecasting models
- Supplier integrations and automated PO suggestions
- IoT-enabled cold-storage monitoring
- Multi-language support
- Automated markdown scheduling
- Point-of-sale system integration
- Business intelligence exports (CSV / PDF)

## 18. Academic Project Information

| Field | Details |
|---|---|
| Project | ExpiryGuard |
| Category | Web Programming / AI-Powered Solution |
| Platform | Multi-Business Web Application |
| Team Size | 5 Members |
| Development Approach | Modular Full-Stack Architecture |
| Current Milestone | Complete, tested frontend with demo data |
| Primary Goal | Intelligent Expiry & Inventory Management |

---

<p align="center">
  <strong>ExpiryGuard</strong>
  <br/>
  Track Smarter. Reduce Waste. Make Better Decisions.
  <br/><br/>
  <em>Building a smarter approach to inventory management.</em>
</p>

# 🛡️ ExpiryGuard
### AI-Powered Expiry Management & Inventory Intelligence Platform

<p align="center">
  <strong>Track Smarter. Reduce Waste. Make Better Decisions.</strong>
</p>

<p align="center">
  A multi-business inventory intelligence platform designed to monitor product expiry, manage stock batches, identify expiry risks, and help businesses minimize avoidable inventory losses.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Project-Academic%20%7C%20Innovation-blueviolet" />
  <img src="https://img.shields.io/badge/Platform-Web%20Application-blue" />
  <img src="https://img.shields.io/badge/Team-5%20Members-orange" />
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow" />
</p>

---

## 1. Project Overview

ExpiryGuard is a smart inventory management and expiry intelligence platform that addresses a significant operational problem faced by businesses: **financial losses, product waste, and safety risks caused by poor expiry-date monitoring.**

Traditional inventory management systems primarily focus on product quantities and stock movements. However, businesses also need visibility into product batches, expiry dates, stock rotation, and potential expiry-related losses.

ExpiryGuard introduces an intelligent approach by combining:

- Batch-level inventory tracking
- Barcode identification and QR-based tracking
- Automated expiry monitoring
- AI-assisted expiry-risk analysis
- Predictive inventory analytics
- Smart stock-management recommendations
- Multi-business and multi-branch management

Our objective is to transform inventory management from a reactive process into a proactive, data-driven operation.

## 2. Problem Statement

Businesses such as supermarkets, pharmacies, restaurants, grocery stores, and warehouses often encounter:

- Products expiring before they are sold or consumed.
- Financial losses caused by unsold or unused inventory.
- Manual and time-consuming expiry-date monitoring.
- Lack of batch-level stock visibility.
- Inefficient stock rotation.
- Limited predictive insights for inventory decisions.
- Difficulty identifying products requiring immediate action.

These problems can lead to unnecessary waste, reduced profitability, and operational inefficiency.

## 3. Proposed Solution

ExpiryGuard provides a centralized platform that allows businesses to manage products, monitor individual batches, receive expiry alerts, and analyze inventory risks.

Instead of waiting until products expire, the platform helps businesses identify potential problems early and take preventive action.

### Core workflow

1. A business registers products and receives stock.
2. Product batches are recorded with quantities and expiry dates.
3. Barcode scanning helps identify products.
4. The system continuously evaluates batch expiry status.
5. Automated alerts highlight products requiring attention.
6. AI-assisted analysis provides risk insights and recommendations.
7. Business owners monitor performance through analytics dashboards.

## 4. Key Features

### 📦 Smart Inventory Management
- Product registration and categorization.
- Stock quantity management.
- Batch-level inventory records.
- Supplier and branch management.
- Stock-in and stock-out transactions.
- Inventory history and audit tracking.

### 📷 Barcode & QR Integration
- Barcode-based product identification.
- QR-code generation for batch tracking.
- Quick access to product and batch information.
- Simplified inventory operations.

**Important technical consideration:** Standard retail barcodes generally identify a product, not its expiry date. ExpiryGuard therefore records expiry information during stock receiving or through supported data integrations. QR codes can provide a link to batch-specific records.

### ⏰ Expiry Intelligence
- Near-expiry product detection.
- Expired stock identification.
- Configurable expiry-alert thresholds.
- Batch-level expiry monitoring.
- Priority-based risk indicators.
- Automated notifications.

### 🤖 AI-Powered Inventory Analysis
- Expiry-risk analysis.
- Historical inventory trend analysis.
- Stock-demand forecasting.
- Identification of potentially wasted inventory.
- Data-driven stock recommendations.

AI recommendations will be supported by available inventory data and clearly identified assumptions rather than treated as guaranteed predictions.

### 📊 Business Analytics
- Total stock overview.
- Expired and near-expiry inventory.
- Inventory value and potential losses.
- Stock movement trends.
- Branch-level performance.
- Forecasting and reporting.

### 💰 Smart Discount Recommendations
- Identification of eligible near-expiry products.
- Suggested discount opportunities.
- Prioritization of stock requiring action.
- Support for better stock turnover.

Discount suggestions are recommendations; businesses remain responsible for pricing and applicable product-safety rules.

### 🔄 Stock Optimization
- FEFO (First Expired, First Out) inventory strategy.
- Batch-level stock tracking.
- Stock transfers between branches.
- Eligible donation workflows.
- Inventory audit logs.

### 🏢 Multi-Business Architecture

ExpiryGuard is designed to support different business categories:

| Business Type | Primary Use Case |
|---|---|
| Supermarkets | Grocery and packaged-product expiry |
| Pharmacies | Medicine batch and expiry tracking |
| Restaurants | Food inventory and ingredient monitoring |
| Retail Stores | Product stock and expiry management |
| Warehouses | Large-scale batch monitoring |
| Distributors | Multi-location stock visibility |

## 5. Technology Stack

The proposed architecture uses technologies selected for maintainability, scalability, and integration.

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| UI Styling | Tailwind CSS |
| Routing | React Router |
| Data Fetching | TanStack Query |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| AI Service | Python, FastAPI |
| Data Processing | Pandas |
| Machine Learning | Scikit-learn |
| Barcode / QR | ZXing-compatible libraries |
| Data Visualization | Recharts |
| Validation | Zod |
| Testing | Vitest, Supertest, Playwright, Pytest |
| Deployment | Vercel, Render / Railway, Docker |

*The final stack may be adjusted according to implementation requirements.*

## 6. System Architecture

```text
                    EXPIRYGUARD
                         |
                  Web Application
                         |
                 React + TypeScript
                         |
                    API Layer
                         |
                  Node.js + Express
                         |
          +--------------+--------------+
          |              |              |
       Auth API      Inventory API   Analytics API
          |              |              |
          +--------------+--------------+
                         |
                    PostgreSQL
                         |
                  Inventory Data
                         |
                  Python AI Service
                      FastAPI
                         |
              +----------+----------+
              |          |          |
           Risk       Forecasting  Insights
          Analysis       Model
              |          |          |
              +----------+----------+
                         |
                 Business Dashboard
```

### Architectural Principles

- Separation of frontend, backend, and AI responsibilities.
- RESTful API communication.
- Centralized database management.
- Role-based access control.
- Business-level data isolation.
- Reusable and modular components.
- Maintainable service architecture.

## 7. Core Database Design

The proposed relational database includes the following entities:

| Entity | Purpose |
|---|---|
| Users | User accounts and authentication |
| Businesses | Business-level information |
| Business Members | User-business relationships and roles |
| Branches | Business locations |
| Categories | Product classification |
| Products | Product master records |
| Suppliers | Supplier information |
| Batches | Expiry dates and batch quantities |
| Stock Transactions | Inventory movements |
| Sales | Sales records |
| Sale Items | Individual sold products |
| Alerts | Expiry and inventory alerts |
| Notifications | User notifications |
| Forecast Results | AI-generated forecasts |
| Discount Suggestions | Recommended stock actions |
| Stock Transfers | Inter-branch transfers |
| Audit Logs | Important system activities |

**Data integrity principle:** Product quantities should be managed through validated inventory transactions. Batch records must preserve their expiry dates and stock history.

## 8. Main System Modules

| Module | Responsibility |
|---|---|
| Authentication | Secure login and account management |
| Business Management | Business and branch configuration |
| Product Management | Product registration and categorization |
| Batch Management | Batch-level expiry and quantity tracking |
| Barcode / QR | Product identification and batch lookup |
| Inventory Engine | Stock movements and FEFO logic |
| Expiry Engine | Expiry status and alert generation |
| AI Engine | Risk analysis and forecasting |
| Analytics Engine | Reports, metrics, and visualizations |
| Notification Engine | Alert delivery and notification history |

## 9. Security & Data Integrity

Security is a core requirement rather than an optional enhancement.

Planned safeguards include:

- Secure authentication.
- Role-based permissions.
- Business-level data isolation.
- Server-side input validation.
- Protected API endpoints.
- Password hashing.
- Secure environment-variable management.
- Database constraints and transactions.
- Audit logging.
- Error handling and request validation.

## 10. Repository Structure

Proposed monorepo structure:

```text
expiryguard/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       ├── context/
│       ├── utils/
│       └── types/
│
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── validators/
│       └── utils/
│
├── ai-service/
│   ├── app/
│   ├── models/
│   ├── services/
│   └── requirements.txt
│
├── docs/
│   ├── architecture/
│   ├── database/
│   └── api/
│
├── tests/
├── .gitignore
├── README.md
└── package.json
```

## 11. Team Structure

A five-member development team with clearly separated ownership areas.

| Member | Role | Primary Responsibility |
|---|---|---|
| Member 1 | Project Lead & Frontend Architect | Project coordination, frontend architecture, dashboard and integration |
| Member 2 | Frontend & Scanning Developer | Inventory interface, product workflows, barcode and QR integration |
| Member 3 | Backend & Security Developer | API architecture, authentication, authorization and backend services |
| Member 4 | Database & Inventory Developer | PostgreSQL, Prisma, batch management and stock operations |
| Member 5 | AI & Analytics Developer | AI service, expiry-risk analysis, forecasting and analytics |

Team members should work through separate feature branches and submit changes through pull requests.

## 12. Development Roadmap

- [ ] Phase 1 — Requirements, planning, and system design
- [ ] Phase 2 — Database schema and API foundation
- [ ] Phase 3 — Authentication and business management
- [ ] Phase 4 — Product, batch, and inventory modules
- [ ] Phase 5 — Barcode and QR integration
- [ ] Phase 6 — Expiry engine and automated alerts
- [ ] Phase 7 — AI analysis and forecasting
- [ ] Phase 8 — Analytics dashboard and reporting
- [ ] Phase 9 — Integration, testing, and security review
- [ ] Phase 10 — Deployment and final demonstration

## 13. Getting Started

### Prerequisites

Install the following tools before starting development:

- Node.js (LTS)
- npm
- Python 3
- PostgreSQL
- Git

### Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/ExpiryGuard.git

cd ExpiryGuard
```

### Frontend Setup

```bash
cd client

npm install

npm run dev
```

### Backend Setup

```bash
cd server

npm install
```

Configure the required environment variables before starting the server.

```bash
npm run dev
```

### AI Service Setup

```bash
cd ai-service

python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the AI service using the project's configured FastAPI entry point.

*Note: These commands describe the planned development setup. Exact scripts, environment variables, and service entry points must match the actual repository implementation.*

## 14. Testing Strategy

Testing will cover:

- Authentication and authorization.
- Product creation and updates.
- Batch and expiry-date validation.
- Stock-in and stock-out operations.
- FEFO stock selection.
- Expiry alert generation.
- Business data isolation.
- Barcode and QR workflows.
- AI service responses.
- Dashboard calculations.
- API integration and error handling.

## 15. Expected Impact

ExpiryGuard aims to help businesses:

- Reduce avoidable inventory waste.
- Improve expiry-date visibility.
- Minimize expiry-related financial losses.
- Improve stock rotation.
- Make informed inventory decisions.
- Save time spent on manual monitoring.
- Improve operational efficiency.

## 16. Future Scope

Potential future enhancements include:

- Mobile inventory application.
- Advanced demand forecasting.
- Supplier integrations.
- IoT-enabled storage monitoring.
- Multi-language support.
- Automated stock optimization.
- Advanced business intelligence.
- Integration with existing point-of-sale systems.

## 17. Academic Project Information

| Field | Details |
|---|---|
| Project | ExpiryGuard |
| Category | Web Programming / AI-Powered Solution |
| Platform | Multi-Business Web Application |
| Team Size | 5 Members |
| Development Approach | Modular Full-Stack Architecture |
| Primary Goal | Intelligent Expiry & Inventory Management |

---

<p align="center">
  <strong>ExpiryGuard</strong>
  <br/>
  Track Smarter. Reduce Waste. Make Better Decisions.
  <br/><br/>
  <em>Building a smarter approach to inventory management.</em>
</p>

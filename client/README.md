# ExpiryGuard - Frontend (client)

React + TypeScript + Vite + Tailwind CSS. Owner: Member 1 (Frontend Lead and UX).

## Run locally

    npm install
    npm run dev        # http://localhost:5173
    npm test           # unit and component tests
    npm run build      # type-check and production build

## Demo mode and real backend

Copy `.env.example` to `.env.local`.

- `VITE_USE_MOCK=true` (default): uses sample data from `src/data`.
- `VITE_USE_MOCK=false`: calls the real API at `VITE_API_URL`.

Demo switches (add to the address bar): `?fail=1` shows the error state, `?empty=1` shows the empty state.

## Structure

    src/components/ui       shared components (Button, Card, KpiCard, StatusBadge, Input, Select, Skeleton, EmptyState, ErrorState)
    src/components/charts   Recharts charts
    src/layouts             app shell (sidebar and top bar)
    src/pages               landing, auth, onboarding, dashboard
    src/services            api.ts (mock or real), http.ts (fetch wrapper)
    src/hooks               TanStack Query hooks
    src/utils               expiry rules (thresholds from the PRD), theme

## Rules

- Status is always shown with a label and an icon, never by color alone.
- The client never sends a business_id. The server resolves the business from the session.
- Actual recorded waste and estimated prevention are always shown separately.
- Sample data is labeled as demo.

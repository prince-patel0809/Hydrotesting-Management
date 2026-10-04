# FuelFlux Hydrotesting System — Frontend Client

The frontend client for the **FuelFlux Hydrotesting Management & Inspection Workflow** is a modern Single Page Application (SPA) built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 🎨 UI Design & Theme

- **Industrial Theme:** Clean white and deep fuel blue palette (`#1e40af`, `#2563eb`, `#0f172a`, `#f8fafc`).
- **Responsive Layout:** Optimized for desktop monitors, control room displays, tablets, and mobile devices.
- **Visual Status Badges:**
  - Test Results: `Pass` (emerald green), `Fail` (rose red), `Pending` (amber yellow).
  - Due-Date Validity: `Valid` (blue/green), `Due Soon` (amber with days countdown), `Overdue` (crimson alert with days past).
  - Equipment Status: `Active`, `Maintenance`, `Inactive`, `Decommissioned`.
- **Accessible & Functional:** Modal dialogs with ESC-key trapping, loading spinners, empty states, and dismissible notification toasts.

---

## 🏗 Frontend Folder Structure

```text
frontend/
├── public/                        # Static assets (favicons, icons)
├── src/
│   ├── api/
│   │   └── client.ts              # Fetch API wrapper with error parsing
│   ├── components/
│   │   ├── AssetManagementView.tsx # Asset table, search, filter, sort, Add/Edit modals
│   │   ├── Badges.tsx             # Result, Validity, and Status visual badges
│   │   ├── DashboardView.tsx      # 6 KPI cards, upcoming/overdue/failed/pending lists
│   │   ├── HydrotestRecordsView.tsx # Records table, Add/Edit modals, detail view
│   │   ├── Modal.tsx              # Reusable accessible dialog wrapper
│   │   └── Navbar.tsx             # Header, navigation tabs, live DB indicator
│   ├── test/
│   │   ├── setup.ts               # Testing Library DOM setup
│   │   ├── AssetManagementView.test.tsx # Asset list & filter unit tests
│   │   ├── Badges.test.tsx        # Visual badge unit tests
│   │   └── DashboardView.test.tsx # KPI summary & card interaction tests
│   ├── types/
│   │   └── index.ts               # TypeScript data models and interfaces
│   ├── App.tsx                    # Root state management & tab routing
│   ├── index.css                  # Tailwind CSS directives & global scrollbars
│   ├── main.tsx                   # React root entry point
│   └── vite-env.d.ts              # Vite environment typings
├── Dockerfile                     # Multi-stage production Nginx container
├── .dockerignore                  # Docker build exclusions
├── nginx.conf                     # Nginx reverse proxy configuration
├── package.json                   # Dependencies & npm scripts
├── tsconfig.json                  # TypeScript project references
├── tsconfig.app.json              # App compiler options
├── tsconfig.node.json             # Vite config compiler options
├── tailwind.config.js             # Tailwind CSS theme configuration
├── postcss.config.js              # PostCSS plugins
├── vite.config.ts                 # Vite bundler & API proxy configuration
├── .env.example                   # Environment configuration template
└── README.md                      # Frontend documentation
```

---

## ⚙️ Environment Variables

Create `frontend/.env` from `.env.example`:

| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `""` (empty) | API base URL. Leave empty to use Vite's proxy (`/api -> http://127.0.0.1:8000`) or Nginx proxy in Docker. Set to `http://localhost:8000` if connecting cross-origin. |

---

## 🚀 How to Run

### Method 1: Via Docker Compose (Recommended)
From the project root:
```bash
docker compose up -d frontend
```
Opens on [http://localhost:5173](http://localhost:5173).

### Method 2: Local Development Server
```bash
cd frontend
npm install
npm run dev
```
Development server starts at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Testing & Production Build

### Run Unit Tests (Vitest)
```bash
npm test
```
Runs 11 automated component tests covering badges, dashboard metrics, search/filter controls, and modals.

### Build Production Bundle
```bash
npm run build
```
Compiles TypeScript and bundles static assets into `dist/` with 0 compilation errors.

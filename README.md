# FuelFlux Hydrotesting Management System

Candidate technical assessment submission for **FuelFlux Technology Private Limited**.

---

## 📌 Submission Details
- **Candidate Name:** Candidate Submission
- **Project:** Hydrotesting Management & Inspection Workflow
- **Date:** October 2026
- **Repository / ZIP:** `fuelflux-hydrotesting`
- **Tech Stack:** Python (FastAPI), MongoDB (Motor Async), React 19 (TypeScript + Vite), Tailwind CSS

---

## 🎯 Project Overview
This application tracks equipment inspection and hydrostatic testing workflows for fuel stations, pipelines, tanks, and vessels.

### Core Features:
- **Asset Register:** Create, view, list, and update equipment assets with unique IDs and strict date validation.
- **Hydrotest Logging:** Record hydrostatic pressure tests (`Pass`, `Fail`, `Pending`) linked to assets, with inspector details, hold notes, and safe document references.
- **Compliance Dashboard:** 6 real-time metrics calculated from the database:
  1. `Total Assets`
  2. `Valid Tests`
  3. `Due within 30 Days`
  4. `Overdue Tests`
  5. `Failed Records`
  6. `Pending Records`
- **Search, Filter & Sort:** Query by station, asset type, status, validity, and due-date range; sort by next-due date ascending or descending.
- **Zero-Setup Execution:** Automatically falls back to an embedded in-memory MongoDB mock if a local MongoDB service is not running. Works 100% out of the box with zero external configuration.

---

## ⚡ Quick Start (One Command with Docker)

```bash
docker compose up --build -d
```

- **Frontend App:** http://localhost:5173
- **Backend API & Swagger UI:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health
- **MongoDB:** `localhost:27017`

To stop:
```bash
docker compose down
```

---

## 💻 Local Manual Start (Without Docker)

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
*Backend runs on `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.*

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Running Automated Tests

### Backend Tests (13/13 Passing)
```bash
# From project root:
.\backend\venv\Scripts\pytest.exe backend\tests -v
```

### Frontend Tests (11/11 Passing)
```bash
cd frontend
npm test
```

### Frontend Build Check
```bash
cd frontend
npm run build
```

---

## 📑 Documentation Index

For detailed, human-readable documentation, see:

1. **[SETUP.md](SETUP.md)** — Step-by-step setup guide for Docker and local environments.
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** — Data models, collections, indexes, and due-date calculation rules.
3. **[API_DOCS.md](API_DOCS.md)** — Complete API contract, endpoints, and curl examples.
4. **[TESTING.md](TESTING.md)** — Test suite details, test matrix, and verification commands.
5. **[ASSUMPTIONS.md](ASSUMPTIONS.md)** — Business rules, duplicate handling, and security decisions.

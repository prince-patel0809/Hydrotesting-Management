# Setup & Installation Guide

Clear, step-by-step instructions to run the FuelFlux Hydrotesting Management System.

---

## 📋 Prerequisites

- **Option A (Docker - Recommended):**
  - Docker Desktop installed and running.
- **Option B (Local Manual Run):**
  - Python 3.10+ (tested on Python 3.12 and 3.14)
  - Node.js 18+ and npm
  - MongoDB (optional — the app automatically falls back to an embedded in-memory MongoDB mock if local MongoDB is not running).

---

## 🐳 Method 1: Run with Docker Compose (One Command)

From the project root directory, run:

```bash
docker compose up --build -d
```

### Access Services:
- **Frontend App:** http://localhost:5173
- **Backend API & Swagger Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health
- **MongoDB:** `localhost:27017`

### Stop Docker Containers:
```bash
docker compose down
```

---

## 💻 Method 2: Run Locally (Without Docker)

### Step 1: Configure Environment Variables

Create `.env` inside the `backend/` directory (or copy from `.env.example`):
```env
PROJECT_NAME="FuelFlux Hydrotesting Management System"
ENVIRONMENT="development"
HOST="0.0.0.0"
PORT=8000
MONGODB_URI="mongodb://localhost:27017"
DATABASE_NAME="fuelflux_hydrotesting"
USE_IN_MEMORY_DB=false
CORS_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
```

### Step 2: Start the Backend

```bash
cd backend

# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# (If PowerShell blocks script execution, run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser)
# Linux / macOS:
# source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start backend server
uvicorn app.main:app --reload
```
*The server will start at `http://127.0.0.1:8000`. If MongoDB is not running locally, it automatically initializes the in-memory mock engine with demo data.*

### Step 3: Start the Frontend

Open a new terminal window:
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🌱 Seeding Demo Data

The backend auto-seeds demo data upon initial startup if the database is empty.

To manually re-seed the 10 fictional assets and 14 hydrotest records:
```bash
# Windows
.\backend\venv\Scripts\python.exe backend/scripts/seed_data.py

# Linux / macOS
python backend/scripts/seed_data.py
```

---

## 🔗 MongoDB Connection Strings

- **Inside Docker Compose:** `mongodb://mongodb:27017`
- **Local MongoDB Daemon:** `mongodb://localhost:27017`
- **MongoDB Atlas Cloud:** `mongodb+srv://<username>:<password>@cluster.mongodb.net/fuelflux_hydrotesting`
- **Zero-Setup In-Memory Mode:** Set `USE_IN_MEMORY_DB=true` or simply leave MongoDB turned off (the system falls back automatically).

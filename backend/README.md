# FuelFlux Hydrotesting System — Backend Service

The backend service for the **FuelFlux Hydrotesting Management & Inspection Workflow** is a high-performance asynchronous REST API built with **Python 3.12+ / FastAPI**, **Pydantic v2**, and **Motor (Async MongoDB Driver)**.

---

## 🏗 Backend Architecture & Folder Structure

```text
backend/
├── app/
│   ├── models/                    # Domain enums & data structures
│   │   ├── __init__.py
│   │   ├── asset.py               # AssetStatus, AssetType enumerations
│   │   └── record.py              # TestResult enum (Pass, Fail, Pending)
│   ├── schemas/                   # Pydantic v2 data models with validators
│   │   ├── __init__.py
│   │   ├── asset.py               # AssetCreate, AssetUpdate, AssetResponse
│   │   ├── dashboard.py           # SummaryStats, SummaryResponse (6 KPI metrics)
│   │   └── record.py              # RecordCreate, RecordUpdate, RecordResponse
│   ├── routes/                    # API Route Controllers
│   │   ├── __init__.py
│   │   ├── assets.py              # /api/hydrotests/assets endpoints
│   │   ├── dashboard.py           # /api/hydrotests/summary endpoint
│   │   └── records.py             # /api/hydrotests/records endpoints
│   ├── services/                  # Business logic layer & database operations
│   │   ├── __init__.py
│   │   ├── asset_service.py       # Asset CRUD, uniqueness check, filtering, sorting
│   │   ├── record_service.py      # Record CRUD, FK validation, safe filenames
│   │   └── summary_service.py     # 6 KPI calculations & due lists
│   ├── config.py                  # Pydantic Settings & environment config
│   ├── database.py                # MongoDB connection pool & MongoMock fallback
│   └── main.py                    # FastAPI application, lifespan, exception handlers
├── scripts/
│   ├── __init__.py
│   └── seed_data.py               # Repeatable seed script (10 assets, 14 records)
├── tests/                         # Pytest automated test suite
│   ├── __init__.py
│   ├── conftest.py                # Mock DB & AsyncClient test fixtures
│   ├── test_assets.py             # Asset creation, uniqueness, validation tests
│   ├── test_dashboard.py          # Dashboard counts & validity calculations
│   ├── test_records.py            # Record creation, FK checks, traversal tests
│   └── test_search_filter_sort.py # Multi-filter & due-date sorting tests
├── Dockerfile                     # Docker container specification
├── .dockerignore                  # Docker build exclusions
├── requirements.txt               # Python package dependencies
├── .env.example                   # Environment configuration template
└── README.md                      # Backend documentation
```

---

## ⚙️ Environment Variables & MongoDB Connection String

The backend reads configuration from environment variables or a local `.env` file:

| Variable | Default Value | Description |
|---|---|---|
| `PROJECT_NAME` | `"FuelFlux Hydrotesting Management System"` | Service title displayed in OpenAPI Swagger docs |
| `ENVIRONMENT` | `"development"` | Environment indicator (`development`, `production`, `test`) |
| `HOST` | `"0.0.0.0"` | Host binding interface |
| `PORT` | `8000` | HTTP port for the FastAPI server |
| `MONGODB_URI` | `"mongodb://localhost:27017"` | MongoDB connection URI (`mongodb://mongodb:27017` in Docker) |
| `DATABASE_NAME` | `"fuelflux_hydrotesting"` | Target MongoDB database name |
| `USE_IN_MEMORY_DB` | `false` | Set to `true` to force in-memory mock MongoDB |
| `CORS_ORIGINS` | `"http://localhost:5173,http://localhost:3000"` | Comma-separated allowed frontend origins |

### MongoDB Connection String Formats:
- **Local MongoDB daemon:** `mongodb://localhost:27017`
- **Docker Compose network:** `mongodb://mongodb:27017`
- **MongoDB Atlas Cloud:** `mongodb+srv://<username>:<password>@cluster.mongodb.net/fuelflux_hydrotesting?retryWrites=true&w=majority`
- **Zero-Setup Fallback:** If the connection to `MONGODB_URI` times out (e.g. no local daemon), the server automatically activates `mongomock-motor` in-memory mock engine with zero setup required.

---

## 🚀 How to Run

### Method 1: Via Docker Compose (Recommended)
From the project root:
```bash
docker compose up -d backend
```

### Method 2: Local Python Execution
```bash
# 1. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# source venv/bin/activate    # Linux / macOS

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🌱 Database Seeding

Run the seed script to populate 10 fictional equipment assets and 14 hydrotest records:
```bash
python scripts/seed_data.py
```
*(Note: The server also auto-seeds demo data upon initial startup if the database is empty).*

---

## 🧪 Running Automated Tests

Run the complete 13-test Pytest suite:
```bash
pytest tests -v
```
All tests use an isolated in-memory test database and do not modify production data.

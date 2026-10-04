import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.database import connect_to_database, close_database_connection
from app.routes.assets import router as assets_router
from app.routes.records import router as records_router
from app.routes.dashboard import router as dashboard_router

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("fuelflux.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and indexes
    logger.info("Starting up FuelFlux Hydrotesting Management System...")
    await connect_to_database()
    
    # Auto-seed demo data if database is empty for seamless zero-setup demo
    try:
        from app.database import get_database
        db = await get_database()
        count = await db.assets.count_documents({})
        if count == 0:
            logger.info("Database is empty. Automatically initializing seed demo data...")
            from scripts.seed_data import seed_initial_data
            await seed_initial_data(db)
            logger.info("Seed demo data initialized successfully.")
    except Exception as exc:
        logger.warning("Auto-seed notice: %s", exc)

    yield
    # Shutdown: close db pool
    logger.info("Shutting down FuelFlux Hydrotesting Management System...")
    await close_database_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="FuelFlux Hydrotesting Management & Inspection Workflow API for asset certification and regulatory compliance.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Clean, readable error response for validation errors."""
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        msg = err.get("msg", "Invalid value")
        errors.append({"field": field or "body", "message": msg})
    logger.warning("Validation error on %s %s: %s", request.method, request.url.path, errors)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Request validation failed", "errors": errors}
    )


@app.exception_handler(DuplicateKeyError)
async def duplicate_key_exception_handler(request: Request, exc: DuplicateKeyError):
    logger.warning("Duplicate key error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "A record with this identifier already exists in the database."}
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log securely without exposing stack trace or secrets in API response
    logger.error("Internal Server Error on %s %s: %s", request.method, request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact the administrator."}
    )


# Health check
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


# Include required API endpoints
# - /api/hydrotests/assets
# - /api/hydrotests/records
# - /api/hydrotests/summary
app.include_router(dashboard_router, prefix="/api/hydrotests")
app.include_router(assets_router, prefix="/api/hydrotests")
app.include_router(records_router, prefix="/api/hydrotests")

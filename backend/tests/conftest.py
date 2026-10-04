import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from mongomock_motor import AsyncMongoMockClient

from app.config import settings
from app.main import app
import app.database as database_module

# Force in-memory mock for tests
settings.USE_IN_MEMORY_DB = True
settings.DATABASE_NAME = "fuelflux_test_db"


@pytest_asyncio.fixture(autouse=True)
async def test_db():
    """Create isolated mock MongoDB client and collection for each test."""
    mock_client = AsyncMongoMockClient()
    mock_db = mock_client[settings.DATABASE_NAME]
    database_module.db_instance.client = mock_client
    database_module.db_instance.db = mock_db
    database_module.db_instance.is_mock = True
    await database_module.init_indexes()

    yield mock_db

    # Clean up
    await mock_db.assets.delete_many({})
    await mock_db.records.delete_many({})
    mock_client.close()


@pytest_asyncio.fixture
async def client():
    """Async HTTP test client bound to FastAPI application."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

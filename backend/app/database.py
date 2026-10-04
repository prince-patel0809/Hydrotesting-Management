import logging
import asyncio
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from mongomock_motor import AsyncMongoMockClient

from app.config import settings

logger = logging.getLogger("fuelflux.database")


class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    is_mock: bool = False


db_instance = Database()


async def get_database() -> AsyncIOMotorDatabase:
    if db_instance.db is None:
        await connect_to_database()
    return db_instance.db


async def connect_to_database() -> None:
    """Connect to MongoDB or fallback to AsyncMongoMockClient for demo/test environments."""
    if settings.USE_IN_MEMORY_DB:
        logger.info("USE_IN_MEMORY_DB is set to True. Initializing in-memory AsyncMongoMockClient...")
        db_instance.client = AsyncMongoMockClient()
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        db_instance.is_mock = True
    else:
        try:
            logger.info("Connecting to MongoDB at %s...", settings.MONGODB_URI)
            client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000
            )
            # Test ping
            await client.admin.command('ping')
            db_instance.client = client
            db_instance.db = client[settings.DATABASE_NAME]
            db_instance.is_mock = False
            logger.info("Successfully connected to live MongoDB instance: %s", settings.DATABASE_NAME)
        except Exception as exc:
            logger.warning(
                "Could not connect to live MongoDB (%s). Falling back to in-memory AsyncMongoMockClient for zero-setup execution. Error: %s",
                settings.MONGODB_URI,
                exc
            )
            db_instance.client = AsyncMongoMockClient()
            db_instance.db = db_instance.client[settings.DATABASE_NAME]
            db_instance.is_mock = True

    await init_indexes()


async def init_indexes() -> None:
    """Initialize necessary indexes for performance and unique constraints."""
    if db_instance.db is None:
        return
    try:
        # Asset indexes
        await db_instance.db.assets.create_index([("asset_id", 1)], unique=True)
        await db_instance.db.assets.create_index([("next_due_date", 1)])
        await db_instance.db.assets.create_index([("station", 1)])
        await db_instance.db.assets.create_index([("asset_type", 1)])
        await db_instance.db.assets.create_index([("status", 1)])

        # Hydrotest record indexes
        await db_instance.db.records.create_index([("record_id", 1)], unique=True)
        await db_instance.db.records.create_index([("asset_id", 1)])
        await db_instance.db.records.create_index([("test_date", -1)])
        await db_instance.db.records.create_index([("result", 1)])
        logger.info("Database indexes initialized successfully.")
    except Exception as exc:
        logger.warning("Index creation notice: %s", exc)


async def close_database_connection() -> None:
    """Close MongoDB connection pool."""
    if db_instance.client:
        db_instance.client.close()
        logger.info("Database connection closed.")
        db_instance.client = None
        db_instance.db = None

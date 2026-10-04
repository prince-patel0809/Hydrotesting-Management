from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Query, status

from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse
from app.services.asset_service import AssetService

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED, summary="Create an asset")
async def create_asset(payload: AssetCreate):
    """
    Register a new equipment / asset in the FuelFlux system.
    - Asset ID must be unique.
    - Next-due date cannot be earlier than test date.
    """
    return await AssetService.create_asset(payload)


@router.get("", response_model=List[AssetResponse], summary="List and search assets")
async def list_assets(
    search: Optional[str] = Query(None, description="Free text search by Asset ID, Serial, Station, or Type"),
    station: Optional[str] = Query(None, description="Filter by station or site"),
    asset_type: Optional[str] = Query(None, description="Filter by asset type"),
    status: Optional[str] = Query(None, description="Filter by asset operational status"),
    validity: Optional[str] = Query(None, description="Filter by validity category ('Valid', 'Due Soon', 'Overdue')"),
    due_from: Optional[date] = Query(None, description="Next-due date range start (YYYY-MM-DD)"),
    due_to: Optional[date] = Query(None, description="Next-due date range end (YYYY-MM-DD)"),
    sort_by: str = Query("next_due_date", description="Field to sort by: next_due_date, test_date, asset_id, station"),
    sort_order: str = Query("asc", description="Sort order: 'asc' or 'desc'")
):
    """
    Retrieve equipment assets with multi-parameter filtering, search, and due-date sorting.
    """
    return await AssetService.list_assets(
        search=search,
        station=station,
        asset_type=asset_type,
        status_val=status,
        validity=validity,
        due_from=due_from,
        due_to=due_to,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.get("/{asset_id}", response_model=AssetResponse, summary="Retrieve one asset")
async def get_asset(asset_id: str):
    """Retrieve detailed information for a single asset by its unique Asset ID."""
    return await AssetService.get_asset(asset_id)


@router.patch("/{asset_id}", response_model=AssetResponse, summary="Partially update an asset")
async def update_asset(asset_id: str, payload: AssetUpdate):
    """
    Partially update asset details while preserving `created_at` and refreshing `updated_at`.
    Validates next-due date against test date.
    """
    return await AssetService.update_asset(asset_id, payload)

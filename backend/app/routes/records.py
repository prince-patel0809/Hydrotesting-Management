from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Query, status

from app.schemas.record import RecordCreate, RecordUpdate, RecordResponse
from app.services.record_service import RecordService

router = APIRouter(prefix="/records", tags=["Hydrotest Records"])


@router.post("", response_model=RecordResponse, status_code=status.HTTP_201_CREATED, summary="Create a hydrotest record")
async def create_record(payload: RecordCreate):
    """
    Record a new hydrotest inspection linked to an existing asset.
    - References existing asset ID.
    - Result must be Pass, Fail, or Pending.
    - Report filename is sanitized to prevent directory traversal.
    """
    return await RecordService.create_record(payload)


@router.get("", response_model=List[RecordResponse], summary="List and filter hydrotest records")
async def list_records(
    asset_id: Optional[str] = Query(None, description="Filter records for a specific asset ID"),
    result: Optional[str] = Query(None, description="Filter by test result ('Pass', 'Fail', 'Pending')"),
    date_from: Optional[date] = Query(None, description="Date range start (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Date range end (YYYY-MM-DD)"),
    sort_order: str = Query("desc", description="Sort order by test date: 'desc' or 'asc'")
):
    """List hydrotest inspection records with optional asset and result filters."""
    return await RecordService.list_records(
        asset_id=asset_id,
        result=result,
        date_from=date_from,
        date_to=date_to,
        sort_order=sort_order
    )


@router.get("/{record_id}", response_model=RecordResponse, summary="Retrieve one hydrotest record")
async def get_record(record_id: str):
    """Retrieve details for a single hydrotest record by its Record ID."""
    return await RecordService.get_record(record_id)


@router.patch("/{record_id}", response_model=RecordResponse, summary="Partially update a hydrotest record")
async def update_record(record_id: str, payload: RecordUpdate):
    """
    Partially update a hydrotest record while preserving `created_at` and refreshing `updated_at`.
    """
    return await RecordService.update_record(record_id, payload)

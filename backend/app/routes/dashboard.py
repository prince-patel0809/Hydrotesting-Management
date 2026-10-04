from datetime import date
from typing import Optional
from fastapi import APIRouter, Query

from app.schemas.dashboard import SummaryResponse
from app.services.summary_service import SummaryService

router = APIRouter(prefix="", tags=["Dashboard & Analytics"])


@router.get("/summary", response_model=SummaryResponse, summary="Return dashboard counts and due items")
async def get_summary(
    reference_date: Optional[date] = Query(
        None,
        description="Optional custom reference date (defaults to today) for auditing and validation"
    )
):
    """
    Returns dashboard statistics (6 key metrics) and categorized due items:
    1. Total assets
    2. Valid tests (active, unexpired, non-failed)
    3. Tests due within next 30 days
    4. Overdue tests
    5. Failed records
    6. Pending records
    
    Also provides lists of upcoming tests, overdue tests, failed records, and pending records.
    """
    return await SummaryService.get_dashboard_summary(reference_date=reference_date)

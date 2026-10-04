from datetime import date, datetime
from typing import List
from pydantic import BaseModel, Field
from app.schemas.asset import AssetResponse
from app.schemas.record import RecordResponse


class SummaryStats(BaseModel):
    total_assets: int = Field(..., description="Total equipment/assets registered")
    valid_tests: int = Field(..., description="Active assets with current valid test status (not expired)")
    tests_due_30_days: int = Field(..., description="Tests due within the next 30 days (inclusive)")
    overdue_tests: int = Field(..., description="Tests overdue for recertification (next-due date < today)")
    failed_records: int = Field(..., description="Total hydrotest records resulting in Fail")
    pending_records: int = Field(..., description="Total hydrotest records pending results/completion")


class SummaryResponse(BaseModel):
    stats: SummaryStats
    upcoming_tests: List[AssetResponse] = Field(default_factory=list, description="Assets due within next 30 days")
    overdue_tests: List[AssetResponse] = Field(default_factory=list, description="Assets with overdue test dates")
    failed_records: List[RecordResponse] = Field(default_factory=list, description="Recent records with Fail result")
    pending_records: List[RecordResponse] = Field(default_factory=list, description="Recent records with Pending result")
    reference_date: date
    generated_at: datetime

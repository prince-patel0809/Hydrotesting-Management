from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict


class AssetBase(BaseModel):
    asset_id: str = Field(..., min_length=2, max_length=50, description="Unique equipment / asset identifier")
    station: str = Field(..., min_length=2, max_length=100, description="Station or site location")
    asset_type: str = Field(..., min_length=2, max_length=50, description="Type of asset (e.g. Storage Tank, Pipeline)")
    serial_number: str = Field(..., min_length=1, max_length=100, description="Serial / reference number")
    test_date: date = Field(..., description="Date of last hydrotest")
    next_due_date: date = Field(..., description="Next due date for hydrotest validity")
    status: str = Field(default="Active", description="Asset operational status (Active, Maintenance, Inactive, etc.)")

    @field_validator("asset_id")
    @classmethod
    def validate_asset_id(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("Asset ID cannot be empty or whitespace only")
        return cleaned

    @field_validator("station", "asset_type", "serial_number", "status")
    @classmethod
    def strip_strings(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Field cannot be empty or whitespace only")
        return cleaned

    @model_validator(mode="after")
    def validate_dates(self) -> "AssetBase":
        if self.next_due_date < self.test_date:
            raise ValueError("Next-due date cannot be earlier than test date")
        return self


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    station: Optional[str] = Field(None, min_length=2, max_length=100)
    asset_type: Optional[str] = Field(None, min_length=2, max_length=50)
    serial_number: Optional[str] = Field(None, min_length=1, max_length=100)
    test_date: Optional[date] = None
    next_due_date: Optional[date] = None
    status: Optional[str] = Field(None, min_length=2, max_length=50)

    @field_validator("station", "asset_type", "serial_number", "status")
    @classmethod
    def strip_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Field cannot be empty or whitespace only")
            return cleaned
        return v

    @model_validator(mode="after")
    def validate_dates_if_both_present(self) -> "AssetUpdate":
        if self.test_date and self.next_due_date:
            if self.next_due_date < self.test_date:
                raise ValueError("Next-due date cannot be earlier than test date")
        return self


class AssetResponse(BaseModel):
    id: Optional[str] = None
    asset_id: str
    station: str
    asset_type: str
    serial_number: str
    test_date: date
    next_due_date: date
    status: str
    created_at: datetime
    updated_at: datetime
    # Computed metrics
    days_until_due: int = 0
    validity_category: str = "Valid"  # "Valid", "Due Soon", "Overdue"
    latest_test_result: Optional[str] = None
    hydrotest_count: int = 0

    model_config = ConfigDict(from_attributes=True)

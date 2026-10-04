import re
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.models.record import TestResult


SAFE_FILENAME_REGEX = re.compile(r"^[A-Za-z0-9_\-]+(\.[A-Za-z0-9]+)?$")


class RecordBase(BaseModel):
    asset_id: str = Field(..., min_length=2, max_length=50, description="Referenced asset ID")
    test_date: date = Field(..., description="Date hydrotest was conducted")
    performed_by: str = Field(..., min_length=2, max_length=120, description="Provider / inspector name")
    result: TestResult = Field(..., description="Test result: Pass, Fail, or Pending")
    notes: Optional[str] = Field(default="", max_length=1000, description="Inspection remarks and observation notes")
    report_filename: Optional[str] = Field(
        default=None,
        description="Fictional safe document reference (e.g. HT-REP-2026-TK01.pdf)"
    )

    @field_validator("asset_id")
    @classmethod
    def validate_asset_id(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("Asset ID cannot be empty or whitespace only")
        return cleaned

    @field_validator("performed_by")
    @classmethod
    def validate_performed_by(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Performed-by / provider cannot be empty")
        return cleaned

    @field_validator("report_filename")
    @classmethod
    def sanitize_report_filename(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        cleaned = v.strip()
        # Security check: disallow paths, backslashes, directory traversal, absolute paths
        if "/" in cleaned or "\\" in cleaned or ".." in cleaned or cleaned.startswith("."):
            raise ValueError("Invalid report filename: path traversal and directory separators are not permitted")
        if not SAFE_FILENAME_REGEX.match(cleaned):
            raise ValueError("Invalid report filename: must contain only alphanumeric characters, dashes, underscores, and safe extensions")
        return cleaned


class RecordCreate(RecordBase):
    record_id: Optional[str] = Field(None, max_length=50, description="Optional custom record ID (auto-generated if omitted)")


class RecordUpdate(BaseModel):
    test_date: Optional[date] = None
    performed_by: Optional[str] = Field(None, min_length=2, max_length=120)
    result: Optional[TestResult] = None
    notes: Optional[str] = Field(None, max_length=1000)
    report_filename: Optional[str] = None

    @field_validator("performed_by")
    @classmethod
    def validate_performed_by(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Performed-by / provider cannot be empty")
            return cleaned
        return v

    @field_validator("report_filename")
    @classmethod
    def sanitize_report_filename(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        cleaned = v.strip()
        if "/" in cleaned or "\\" in cleaned or ".." in cleaned or cleaned.startswith("."):
            raise ValueError("Invalid report filename: path traversal and directory separators are not permitted")
        if not SAFE_FILENAME_REGEX.match(cleaned):
            raise ValueError("Invalid report filename: must contain only alphanumeric characters, dashes, underscores, and safe extensions")
        return cleaned


class RecordResponse(BaseModel):
    id: Optional[str] = None
    record_id: str
    asset_id: str
    test_date: date
    performed_by: str
    result: TestResult
    notes: Optional[str] = ""
    report_filename: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

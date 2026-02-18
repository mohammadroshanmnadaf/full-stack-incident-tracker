from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from app.models import SeverityEnum, StatusEnum


class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    service: str = Field(..., min_length=1, max_length=100)
    severity: SeverityEnum
    status: StatusEnum = StatusEnum.OPEN
    owner: Optional[str] = Field(default=None, max_length=100)
    summary: Optional[str] = None

    @field_validator("title", "service")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()


class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    service: Optional[str] = Field(None, min_length=1, max_length=100)
    severity: Optional[SeverityEnum] = None
    status: Optional[StatusEnum] = None
    owner: Optional[str] = Field(None, max_length=100)
    summary: Optional[str] = None

    @field_validator("title", "service")
    @classmethod
    def strip_whitespace(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else v


class IncidentResponse(BaseModel):
    id: int
    title: str
    service: str
    severity: SeverityEnum
    status: StatusEnum
    owner: Optional[str]
    summary: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedIncidentsResponse(BaseModel):
    data: List[IncidentResponse]
    total: int
    page: int
    limit: int
    total_pages: int

import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Enum as SAEnum, DateTime, Index
from app.database import Base


class SeverityEnum(str, enum.Enum):
    SEV1 = "SEV1"
    SEV2 = "SEV2"
    SEV3 = "SEV3"
    SEV4 = "SEV4"


class StatusEnum(str, enum.Enum):
    OPEN = "OPEN"
    MITIGATED = "MITIGATED"
    RESOLVED = "RESOLVED"


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    service = Column(String(100), nullable=False)
    severity = Column(SAEnum(SeverityEnum), nullable=False)
    status = Column(SAEnum(StatusEnum), nullable=False, default=StatusEnum.OPEN)
    owner = Column(String(100), nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_incidents_severity", "severity"),
        Index("ix_incidents_status", "status"),
        Index("ix_incidents_created_at", "created_at"),
        Index("ix_incidents_severity_status", "severity", "status"),
    )

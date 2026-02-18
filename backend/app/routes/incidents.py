import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc

from app.database import get_db
from app.models import Incident, SeverityEnum, StatusEnum
from app.schemas import IncidentCreate, IncidentUpdate, IncidentResponse, PaginatedIncidentsResponse

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    incident = Incident(**payload.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/", response_model=PaginatedIncidentsResponse)
def list_incidents(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    severity: Optional[SeverityEnum] = Query(default=None),
    status_filter: Optional[StatusEnum] = Query(default=None, alias="status"),
    sort_by: str = Query(default="created_at"),
    sort_order: str = Query(default="desc"),
    db: Session = Depends(get_db),
):
    query = db.query(Incident)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(Incident.title.ilike(term), Incident.service.ilike(term)))

    if severity:
        query = query.filter(Incident.severity == severity)

    if status_filter:
        query = query.filter(Incident.status == status_filter)

    SORTABLE = {
        "created_at": Incident.created_at,
        "updated_at": Incident.updated_at,
        "title": Incident.title,
        "service": Incident.service,
        "severity": Incident.severity,
        "status": Incident.status,
    }
    col = SORTABLE.get(sort_by, Incident.created_at)
    query = query.order_by(desc(col) if sort_order.lower() == "desc" else asc(col))

    total = query.count()
    incidents = query.offset((page - 1) * limit).limit(limit).all()

    return PaginatedIncidentsResponse(
        data=incidents,
        total=total,
        page=page,
        limit=limit,
        total_pages=math.ceil(total / limit) if total > 0 else 1,
    )


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")
    return inc


@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: int, payload: IncidentUpdate, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields provided for update.")

    for field, value in data.items():
        setattr(inc, field, value)

    db.commit()
    db.refresh(inc)
    return inc

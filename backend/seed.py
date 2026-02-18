import random
import sys
import os
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models import Incident, SeverityEnum, StatusEnum

SERVICES = [
    "payments-api", "auth-service", "user-service", "notification-service",
    "billing-service", "search-service", "recommendation-engine", "data-pipeline",
    "cdn-proxy", "api-gateway", "inventory-service", "shipping-service",
    "fraud-detection", "reporting-service", "websocket-server",
]

TITLE_TEMPLATES = [
    "{service} — high error rate on /checkout",
    "{service} — database connection pool exhausted",
    "{service} — latency spike above 5s p99",
    "{service} — pod crash loop detected",
    "{service} — memory leak causing OOM kills",
    "{service} — SSL certificate expiring in 48h",
    "{service} — queue backlog exceeding 100k messages",
    "{service} — dependency timeout from downstream",
    "{service} — disk usage at 95% on prod-db-01",
    "{service} — deployment rollback required",
    "{service} — elevated 5xx rate from load balancer",
    "{service} — Redis cache miss rate spiked to 80%",
    "{service} — Kafka consumer group lag increasing",
    "{service} — health check failing intermittently",
    "{service} — race condition in payment reconciliation",
    "{service} — rate limiter blocking legitimate traffic",
    "{service} — cold start latency regression after deploy",
    "{service} — third-party webhook delivery failures",
    "{service} — incorrect data written to audit log",
    "{service} — feature flag rollout causing null pointer",
]

OWNERS = [
    "platform-team", "backend-squad", "infra-sre", "security-team",
    "data-eng", "frontend-guild", "api-team", "devops-oncall",
    "alice@example.com", "bob@example.com", "carol@example.com",
    "dave@example.com", None, None,
]

SUMMARIES = [
    "Customers seeing intermittent 503 errors. Rollback initiated, monitoring recovery.",
    "Root cause: misconfigured autoscaling policy. Fix deployed.",
    "On-call engineer paged. Investigation ongoing. No customer impact confirmed yet.",
    "Caused by a bad config push at 14:32 UTC. Reverted. Post-mortem scheduled.",
    "Third-party dependency degraded. Failover to backup provider in progress.",
    "Memory leak introduced in v2.4.1. Hotfix branch cut, ETA 30 min.",
    "Disk cleanup script ran late due to cron misconfiguration. Remediated.",
    "Upstream CDN provider reporting partial outage. Escalated to vendor.",
    "Load test in staging leaked traffic to prod. Load test terminated.",
    "Certificate auto-renewal failed. Manual renewal applied as emergency fix.",
    None, None,
]

SEVERITIES = [
    SeverityEnum.SEV1, SeverityEnum.SEV1,
    SeverityEnum.SEV2, SeverityEnum.SEV2, SeverityEnum.SEV2,
    SeverityEnum.SEV3, SeverityEnum.SEV3, SeverityEnum.SEV3, SeverityEnum.SEV3,
    SeverityEnum.SEV4,
]

STATUSES = [
    StatusEnum.OPEN, StatusEnum.OPEN, StatusEnum.OPEN,
    StatusEnum.MITIGATED, StatusEnum.MITIGATED,
    StatusEnum.RESOLVED, StatusEnum.RESOLVED, StatusEnum.RESOLVED,
]


def seed(count: int = 200):
    print(f"Seeding {count} incidents...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Incident).count()
        if existing > 0:
            print(f"Clearing {existing} existing records...")
            db.query(Incident).delete()
            db.commit()

        incidents = []
        for _ in range(count):
            service = random.choice(SERVICES)
            title = random.choice(TITLE_TEMPLATES).format(service=service)
            created_at = datetime.now(timezone.utc) - timedelta(
                days=random.randint(0, 90), hours=random.randint(0, 23)
            )
            updated_at = created_at + timedelta(hours=random.randint(0, 48))
            incidents.append(Incident(
                title=title,
                service=service,
                severity=random.choice(SEVERITIES),
                status=random.choice(STATUSES),
                owner=random.choice(OWNERS),
                summary=random.choice(SUMMARIES),
                created_at=created_at,
                updated_at=updated_at,
            ))

        db.bulk_save_objects(incidents)
        db.commit()
        print(f"Done! {count} incidents seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed(200)

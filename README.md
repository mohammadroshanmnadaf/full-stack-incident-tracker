# 🚨 Incident Tracker Mini App

A full-stack web application to create, view, filter and manage production incidents.

## Tech Stack
- **Backend**: Python, FastAPI, SQLAlchemy ORM, Pydantic 
- **Database**: MySQL 
- **Frontend**: HTML5, CSS, Vanilla JavaScript, Bootstrap 

## Project Structure
```
incident-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── database.py     # DB engine & session
│   │   ├── models.py       # SQLAlchemy models + indexes
│   │   ├── schemas.py      # Pydantic schemas
│   │   └── routes/
│   │       └── incidents.py  # All API endpoints
│   ├── seed.py             # Seed 200 dummy records
│   |── requirements.txt
│   
├── frontend/
│   ├── index.html          # Incident list
│   ├── create.html         # Create form
│   ├── detail.html         # Detail + update
│   ├── js/
│   │   ├── api.js          # Fetch client
│   │   ├── index.js        # List page logic
│   │   ├── create.js       # Create form logic
│   │   └── detail.js       # Detail page logic
│   └── css/
│       └── styles.css
|
└── README.md
```

## Setup & Run

### 1. Create MySQL database
```sql
CREATE DATABASE incident_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure environment
```bash
cd backend
cp .env
# Edit .env with your MySQL credentials
```

### 3. Install dependencies
```bash
cd backend
python -m venv venv
source venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Start the backend
```bash
uvicorn app.main:app --reload --port 8000
```
- API: http://localhost:8000


### 5. Seed the database
```bash
python seed.py
```

### 6. Open the frontend
```bash
cd ../frontend
python -m http.server 5500
```
Open http://localhost:5500 in your browser.

> **Note**: If your backend is not at `http://127.0.0.1:8000`, update `API_BASE_URL` in `frontend/js/api.js`.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/incidents/` | Create incident |
| GET | `/api/incidents/` | List with pagination/filter/sort/search |
| GET | `/api/incidents/{id}` | Get single incident |
| PATCH | `/api/incidents/{id}` | Update incident fields |

### GET /api/incidents/ Query Params
| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 20 | Records per page (max 100) |
| `search` | — | Search in title or service |
| `severity` | — | SEV1, SEV2, SEV3, SEV4 |
| `status` | — | OPEN, MITIGATED, RESOLVED |
| `sort_by` | created_at | Column to sort by |
| `sort_order` | desc | asc or desc |

## Design Decisions
- **SQLAlchemy ORM** used exclusively — no raw SQL, all queries are parameterized automatically.
- **Whitelist-based sorting** — `sort_by` is validated against known columns to prevent injection.
- **Composite index** on `(severity, status)` for efficient combined filtering.
- **Debounced search** (350ms) prevents excessive API requests while typing.
- **CORS set to `*`** for local development — restrict to your frontend domain in production.
- **`escapeHtml()`** on all user data rendered into the DOM to prevent XSS.

## Potential Improvements
- JWT authentication for protected endpoints
- Docker Compose for one-command local setup
- Pytest suite for route and schema testing
- Audit log table tracking every incident change
- WebSocket for real-time list updates
- Soft-delete / archive support
- CSV export of filtered results
- Role based access control

# College Student Portal

A full-stack college student portal with a Django REST Framework backend and a React (CRA + Craco + Tailwind + shadcn/ui) frontend.

## Stack

- **Backend:** Django 5.1, Django REST Framework, SimpleJWT, SQLite
- **Frontend:** React 18, React Router 7, Tailwind CSS, shadcn/ui, Axios

## Apps / Features

- Authentication (JWT, login by username or email)
- Students, profile, dashboard stats
- Notices, attendance, timetable
- Assignments and submissions
- Marks / results
- Fees and queries
- AI chatbot (optional, requires `emergentintegrations`)

## Quick start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit values as needed
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend reads `REACT_APP_BACKEND_URL` from `frontend/.env` (defaults to `http://127.0.0.1:8000`).

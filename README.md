# ApplyVault - Resume Tracker

ApplyVault is a full-stack recruitment portal where candidates can apply for jobs with PDF resumes and track hiring status, while recruiters/admins can manage jobs, review applicants, parse resume data, and update application workflows.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js (MVC)
- Database: MySQL or SQLite
- Auth: JWT
- File Upload: Multer
- Resume Parsing: pdf-parse
- Charts: Recharts

## Project Structure

```text
ApplyVault-Resume-Tracker/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
    uploads/resumes/
    package.json
    .env.example
  frontend/
    src/
      components/
      context/
      layouts/
      pages/
      services/
    package.json
    .env.example
  sql/
    schema.sql
  README.md
```

## Features Implemented

- Authentication
- Candidate signup/login
- Recruiter/Admin login
- JWT auth + role-based access (candidate/recruiter/admin)

- Candidate Dashboard
- Browse and search jobs
- Apply to jobs with PDF resume upload
- Resume parsing (name/email/phone/skills/education)
- View profile and application statuses

- Recruiter/Admin Dashboard
- Create and delete jobs
- View all applicants and parsed details
- Search/filter by name, email, skills, status, and job
- Update application status
- Download uploaded resumes
- Pipeline chart and summary cards

- UI/UX
- Responsive layout
- ATS-style dashboard panels
- Status badges
- Dark mode toggle

## Database Setup

1. Open MySQL and run:

```sql
SOURCE /absolute/path/to/ApplyVault-Resume-Tracker/sql/schema.sql;
```

Or copy and execute the SQL from `sql/schema.sql`.

## Backend Setup

1. Go to backend:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
cp .env.example .env
```

4. Update `.env` with your local MySQL credentials.

SQLite option (no MySQL setup required):

- Set `DB_CLIENT=sqlite` in `backend/.env`.
- Optional: set `SQLITE_FILE=data/applyvault.sqlite` (default).
- On first run, schema and seed data are created automatically.

5. Start backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

## Frontend Setup

1. In a new terminal:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
cp .env.example .env
```

4. Start frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Demo Credentials

- Recruiter: `recruiter@applyvault.com` / `password`
- Admin: `admin@applyvault.com` / `password`

Register candidate accounts from the UI.

## Core API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Jobs
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs` (recruiter/admin)
- `DELETE /api/jobs/:id` (recruiter/admin)

### Candidate
- `GET /api/candidate/profile`
- `GET /api/candidate/applications`
- `POST /api/candidate/apply/:jobId` (multipart PDF resume)

### Recruiter/Admin
- `GET /api/recruiter/applicants`
- `GET /api/recruiter/applicants/:applicationId`
- `PATCH /api/recruiter/applications/:applicationId/status`
- `GET /api/recruiter/dashboard-stats`

## Future AWS Deployment Readiness

- `.env`-based config management
- Stateless JWT auth for API tier
- Structured MVC backend
- Static resume path strategy can be moved to S3 in future
- MySQL schema ready for RDS migration

## AWS Deployment

Use the step-by-step AWS commands in `DEPLOY_AWS.md`.

If you deploy the frontend to S3 Website Hosting, make sure the bucket is configured with `index.html` as
both the **index** and **error** document so React Router deep links like `/login` work.

## Smart LMS (MongoDB, React, Node)

This is a **Smart Learning Management System** with:

- **Express + MongoDB** backend (JWT auth, RBAC, analytics, ML-based recommendations)
- **React + Vite** frontend with role-based dashboards for **Learner**, **Instructor**, and **Admin**
- Behavioural analytics, K-Means clustering, and a cosine-similarity recommendation engine, aligned with `requirements.md`.

### 1. Prerequisites

- Node.js (v18+ recommended)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # On Windows, copy the file manually
# Edit .env to set a strong JWT_SECRET and correct Mongo URL if needed
npm run dev            # Starts API on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev            # Starts UI on http://localhost:5173
```

### 4. Seeding demo data

A seed script (users, courses, resources, interactions) will be added under `backend/` so you can quickly demo:

- 1 Admin
- 1 Instructor
- 2 Learners
- Sample courses/resources/quizzes

You will run it with:

```bash
cd backend
node seed.js
```

### 5. High-level architecture

- `backend/`: Express API, MongoDB models, ML services, analytics, batch jobs
- `frontend/`: React SPA (Vite), dashboards and visual analytics
- `requirements.md`: Design document describing goals, ML pipeline, and modules

Refer to the design doc plus the code for more specific endpoints and screens once implementation is complete.


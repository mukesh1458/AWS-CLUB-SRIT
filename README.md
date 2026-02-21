# ☁️ AWS Cloud Club — SRIT Chapter

Official web platform for the **AWS Cloud Club at SRIT Anantapur, Andhra Pradesh** (Est. 2025).
The central hub for students to discover events, access cloud learning resources, and manage club membership.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 19 (Standalone Components) |
| **Backend** | Node.js + Express.js |
| **Database & Auth** | Supabase (PostgreSQL + Row Level Security) |
| **File Storage** | Cloudinary (PDFs & Avatars) |
| **Styling** | Pure CSS — CSS Variables, Flexbox, Grid, Glassmorphism |

---

## � User Roles

| Role | Access |
|---|---|
| **Super Admin** | Full dashboard: approve/reject students, view live stats (events, students, resources) |
| **Team Admin** | Post events, upload resources, approve/reject pending students |
| **Student** | View & register for events, download resources after approval |
| **Guest** | View public events list only |

---

## 🎨 Design Features
- Custom animated cursor (glowing dot)
- Glassmorphic dark UI with CSS variables
- 3D tilt card hover effects (`appTilt` directive)
- Scroll-reveal entrance animations (`appReveal` directive)
- Responsive across all breakpoints

---

## ⚙️ Local Setup

### Prerequisites
- Node.js ≥ 18, npm ≥ 9
- Angular CLI: `npm install -g @angular/cli`
- A Supabase project + Cloudinary account

### 1. Backend

```bash
cd backend
cp .env.example .env      # Fill in your keys
npm install
node index.js             # Runs on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
ng serve                  # Runs on http://localhost:4200
```

---

## � Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description |
|---|---|
| `PORT` | Backend port (default: 3001) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret!) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (keep secret!) |

> ⚠️ **Never commit `.env` to version control.**

---

## 📁 Project Structure

```
aws-club-srit-angular/
├── backend/
│   ├── routes/           # auth, admin, team, student, public
│   ├── middleware/        # JWT auth middleware
│   ├── .env.example       # Safe credentials template
│   └── index.js
└── frontend/
    └── src/app/
        ├── components/    # navbar, footer
        ├── pages/         # home, events, resources, login, join, about, team, dashboards
        ├── services/      # auth, admin, team, student
        ├── guards/        # auth, guest, role
        └── directives/    # reveal, tilt
```

---

## 🔒 Security Notes
- All admin & student routes require a valid JWT (via `requireAuth` middleware)
- `.env` is excluded from git via `.gitignore`
- Supabase Row Level Security (RLS) is enabled as a second layer of defence
- Cloudinary uploads use server-signed requests (no secret on the client)

---

*Built with ❤️ for the AWS Cloud Club community at SRIT Anantapur.*

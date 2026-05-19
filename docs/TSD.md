<h1 align="center">Project Specification – Features & Software Requirements</h1>

## 1. Tech Stack

### 1.1 Frontend

- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Key points:**
  - SPA architecture.
  - Component-based UI, reusable layout components.
  - Integration with backend via REST APIs (JSON).

### 1.2 Backend

- **Framework:** ASP.NET (C#)
- **Architecture:** RESTful API
- **Responsibilities:**
  - Authentication & authorization.
  - User management (firms, candidates).
  - Profile management.
  - Matching engine (flags/attributes + vector similarity search).
  - Chat service (conversations, messages).
  - Notifications / inbox events.
  - Optional scraping / enrichment endpoint (e.g., GitHub/profile URLs).

### 1.3 Database

- **DBMS:** PostgreSQL
- **Usage:**
  - Relational tables for:
    - Users, firms, candidates.
    - Profiles (candidate profiles, recruiting profiles).
    - Likes / matches.
    - Chat (conversations, messages).
    - Notifications / inbox items.
  - Vector search support (e.g., via `pgvector`) for embedding-based similarity searches.

### 1.4 Deployment / Infrastructure

- **Cloud:** Google Cloud Platform (GCP)
- **Containerization:** Docker images for frontend and backend.
- **Possible services:**
  - Cloud Run / GKE for running containers.
  - Cloud SQL for Postgres.
  - Cloud Storage for static assets (if needed).
- **CI/CD:** (To be defined) – pipeline to build Docker images and deploy to GCP.

---

## 2. High-Level Features

1. User Authentication:
   - Registration (firms and candidates).
   - Login / logout.
2. Initial Setup Walkthrough:
   - Guided onboarding for firms.
   - Guided onboarding for candidates.
3. Candidate Profile Management.
4. Firm Profile & Recruiting Profile Management.
5. Matching & Search:
   - Recruiter search page (candidate discovery).
   - Hybrid matching (flags/attributes + vector similarity).
6. Interest & Matching:
   - “Interested” action.
   - Mutual “Match” when both sides like each other.
7. Chat:
   - Conversation creation on match.
   - Messaging interface.
8. Inbox / Notifications:
   - Alerts for interest, matches, and new messages.
9. Settings:
   - Basic account information (name, company, address, headquarters).
10. Optional Enrichment:
    - Manual trigger for scraping external URLs (e.g., GitHub) for candidate insight.

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

**Requirements:**

- Users can:
  - Register as **Candidate** or **Firm**.
  - Login using email + password.
- Basic flows:
  - Registration form with role selection.
  - Login form.
  - Token-based session management (e.g., JWT).
- Role-based access:
  - Candidate-only pages (candidate profile, candidate settings).
  - Firm-only pages (recruiting search, firm profile).

---

### 3.2 Onboarding / Initialization Setup

#### 3.2.1 Candidate Onboarding

**Flow:**

- After first login, candidate is guided through steps:
  1. Basic info (name, location, contact preferences).
  2. Professional summary and headline.
  3. Experience and education (optional for MVP can be simplified).
  4. Skills / attributes / traits (flags).
  5. Job preferences (roles, industries, remote vs. onsite).
  6. Links to external resources (e.g., GitHub, portfolio).

**Outcome:**

- Candidate profile created and stored.
- Vector representation of the profile computed in backend (for matching).

#### 3.2.2 Firm Onboarding

**Flow:**

- After first login, firm is guided through steps:
  1. Company info (name, headquarters, address, industry).
  2. Basic company profile (description, culture highlights).
  3. Creation of at least one recruiting profile:
     - Role title.
     - Required skills / attributes.
     - Desired traits / soft skills.
     - Location / remote constraints.
     - Seniority level / job type.

**Outcome:**

- Firm profile created.
- Recruiting profile(s) stored.
- Vector representation of recruiting profiles computed in backend.

---

### 3.3 Profiles

#### 3.3.1 Candidate Profile Page

**Features:**

- View and edit:
  - Basic info.
  - Skills, traits, experience.
  - Job preferences.
  - External links (GitHub, portfolio, etc.).
- Specify which information is used for matching/search.
- Trigger manual enrichment (if available to the candidate as a preview, optional).

#### 3.3.2 Firm Profile & Recruiting Profiles Page

**Features:**

- Firm:
  - Edit company name, headquarters, address, public description.
- Recruiting profiles:
  - Create, edit, archive role-specific recruiting profiles.
  - Define required attributes (skills, experience, traits).
  - Define constraints (location, remote, seniority).

---

### 3.4 Search & Matching (Recruiter View)

**Search Page:**

- List of candidate profiles with:
  - Summary information (name, title, location, top skills, match %).
  - Match percentage or score based on hybrid matching logic.
- Filters:
  - Location, seniority, availability, key skills, etc.
- Sorting:
  - By match score (default), recency, or other criteria.

**Candidate Detail View:**

- Accessible on click from search list.
- Shows:
  - Full candidate profile.
  - Selected matching attributes/traits.
  - Job preferences summary.
- Optional buttons:
  - “Trigger GitHub/portfolio insight” (scraping + summary).
  - “Interested” button to express interest in the candidate.

**Matching Logic:**

- Hybrid:
  - Exact/attribute-based matching (skills, location, etc.).
  - Vector similarity search on candidate profile text vs. recruiting profile text.

---

### 3.5 Interest, Match, and Chat

#### 3.5.1 Interest & Match

- Firms can mark a candidate as **Interested**.
- Candidates can:
  - View firms that expressed interest.
  - Mark a firm as interested back (e.g., “I’m interested”).
- When both sides express interest:
  - A **Match** is created.
  - A chat thread is initialized.

#### 3.5.2 Chat Feature

**Chat Page:**

- List of ongoing conversations (matches).
- For each conversation:
  - Firm side: candidate name, role (from recruiting profile), last message.
  - Candidate side: company name, role, last message.
- Conversation view:
  - Real-time or near-real-time messaging.
  - Basic text messages.
  - Timestamps.

**Requirements:**

- Store conversations and messages in PostgreSQL.
- Ensure messages are scoped to the matched pair only.
- Basic unread message indicator.

---

### 3.6 Inbox / Notifications

**Inbox Page:**

- Shows:
  - New interest received (candidate or firm).
  - New match created.
  - New message notifications.
- Basic actions:
  - Open related profile or chat from the notification.
  - Mark notifications as read.

**Backend Responsibilities:**

- Create notification records on:
  - Interest received.
  - Match created.
  - New chat message (if recipient is not on chat page).

---

### 3.7 Settings

**Settings Page:**

- For candidates:
  - Name, surname.
  - Email (and possibly password change).
  - Location and basic contact settings.

- For firms:
  - Company name.
  - Headquarters.
  - Address and basic contact details.
  - Possibly notification preferences.

---

### 3.8 Optional Scraping / Enrichment

**Scope (MVP-level):**

- Backend endpoint to:
  - Accept a candidate ID and a URL (e.g., GitHub).
  - Validate and queue scraping job.
- Enrichment process:
  - Scrape permitted pages (e.g., public GitHub).
  - Generate a short summary of projects and skills (using external AI service).
  - Store summary as a separate enrichment entity linked to candidate profile.

**Frontend:**

- On candidate detail view (recruiter side):
  - Button: “Generate project summary” (only if enrichment not already available or refresh needed).
  - Display summary when available.

**Note:** This is optional and can be implemented in a later iteration.

---

## 4. Non-Functional Requirements (High-Level)

- **Security:**
  - Authentication and authorization for all protected endpoints.
  - Separate visibility for candidate vs. firm data where appropriate.
- **Performance:**
  - Responsive UI; acceptable latency for search and profile loading.
- **Scalability:**
  - Dockerized services deployable on GCP.
- **Maintainability:**
  - Clear separation of frontend and backend code.
  - Standardized naming conventions and project structure.

---

## 5. Initial Deliverables (MVP Scope)

1. Basic frontend and backend skeleton (React + Vite, ASP.NET, Postgres integration).
2. Authentication flows (register/login) for candidates and firms.
3. Onboarding flows for:
   - Candidate profile creation.
   - Firm and recruiting profile creation.
4. Candidate search page for firms with simple hybrid matching (starting with attributes; vector search can be added incrementally).
5. Interest → Match flow and chat functionality.
6. Inbox for basic notifications (interests, matches, messages).
7. Settings pages for basic account info.
8. Docker setup and deployment to GCP for both frontend and backend.

---

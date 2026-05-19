# Repository Naming Conventions

This document defines naming conventions for branches, files, folders, and other artifacts in this GitHub project to keep the codebase clean, predictable, and easy to navigate.

---

## 1. General Principles

- Use **lowercase** where possible.
- Use **hyphens (`-`)** to separate words (except where a language/framework dictates otherwise).
- Names should be **short, descriptive, and consistent**.
- Avoid special characters, spaces, and non-ASCII characters.

---

## 2. Branch Naming

### 2.1 General Rules

- Format:  
  `<type>/<short-description>`  
- Use lowercase and hyphens for description.
- Types (examples):
  - `feature/` – new features
  - `bugfix/` – bug fixes
  - `hotfix/` – urgent production fixes
  - `chore/` – maintenance, refactoring, non-functional changes
  - `docs/` – documentation updates
  - `release/` – release preparation

### 2.2 Examples

- `feature/employee-profile-page`  
- `feature/employer-search-api`  
- `bugfix/chat-notification-badge`  
- `docs/update-readme`  
- `release/v1.0.0`

### 2.3 Issue / Ticket Integration (Optional)

If you use an issue tracker (e.g., JIRA, GitHub Issues):

- `feature/123-employee-signup-flow`  
- `bugfix/456-fix-auth-timeout`

---

## 3. Folders (Directories)

### 3.1 General Rules

- Use **lowercase** with **hyphens**: `employee-api`, `web-client`, `infra-config`.
- Group by function or layer (e.g., `api`, `web`, `scripts`, `docs`, `infra`).

### 3.2 Examples

Top-level:

- `backend/`
- `frontend/`
- `infra/`
- `scripts/`
- `docs/`

Backend subfolders (example):

- `backend/src/`
  - `controllers/`
  - `services/`
  - `repositories/`
  - `models/`
  - `config/`
  - `utils/`

Frontend subfolders (example):

- `frontend/src/`
  - `components/`
  - `pages/`
  - `hooks/`
  - `services/`
  - `styles/`
  - `assets/`

---

## 4. File Naming

### 4.1 General Code Files

- Use **lowercase** with **hyphens** for non-language-specific files

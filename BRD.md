<h1 align="center"> Project Business Specification</h1>

**Author: Zlámal Jakub, Sobíšek Vít**  
**Version 1.0**  
**Date: 19/05/2026**  

## 1. Overview

This project is a web application that connects potential employees with firms by simplifying the very first step of the job search and recruitment process. The search is reversed: HR and hiring managers actively browse and filter candidate profiles, while potential employees mainly maintain their profile and let companies discover them.

The core purpose is **initial contact and interest validation**, not full assessment or end-to-end recruitment. Deeper evaluation (e.g., detailed interviews, technical screenings, assessment centers) is explicitly expected to happen outside the platform.

---

## 2. Target Users

### 2.1 Potential Employees (Candidates)
- Individuals looking for new job opportunities.
- Across various roles and industries (not limited to IT).
- Interested in maintaining a single, up-to-date professional profile.

### 2.2 Firms (Employers)
- Companies of different sizes and sectors.
- HR departments, recruiters, and hiring managers.
- Seeking a faster and more interactive way to discover suitable candidates.

---

## 3. Core Value Proposition

- **For candidates:**  
  Maintain one rich professional profile and be discovered by relevant firms without needing to constantly search and apply manually.

- **For firms:**  
  Quickly browse and filter curated candidate profiles based on structured data and optional enriched insights, then initiate conversations directly via in-app chat.

- **For both sides:**  
  Focus on efficient **first contact** and mutual interest verification, keeping deeper evaluation steps for later, outside the platform.

---

## 4. Key Features (Business-Level)

### 4.1 Candidate Profile

Candidates can create and maintain a profile including:

- Basic information (name, location, contact preferences).
- Professional summary and headline.
- Work experience and education.
- Skills and competencies.
- Traits / soft skills / work style (e.g., team-oriented, analytical).
- Job preferences (roles, industries, remote/on-site, availability).
- Links to external resources (e.g., GitHub, personal website, portfolio).

**Goal:** Provide sufficient information for employers to decide whether to initiate a conversation, not to fully evaluate the candidate.

---

### 4.2 Firm / Employer Accounts

Firms can:

- Create a company profile (name, description, industry, size, culture highlights).
- Create one or more “search profiles” or “role profiles” defining:
  - Required skills and experience.
  - Desired traits and work style.
  - Location / remote constraints.
  - Other basic filters (e.g., seniority, availability).

**Goal:** Allow HR to define what they are looking for in a structured way to receive relevant candidate suggestions.

---

### 4.3 Discovery & Matching

- Employers can browse candidates via:
  - Filtered lists (e.g., by skills, location, seniority).
  - A feed of recommended candidates based on their defined search/role profiles.
- Matching logic can include:
  - Skill and experience alignment.
  - Traits and preferences alignment.
  - Basic constraints (location, job type, etc.).

**Goal:** Enable employers to quickly identify promising candidates similar to a “Tinder-like” discovery pattern, but with professional data and filters.

---

### 4.4 Contact & Chat

- When an employer finds a candidate of interest, they can:
  - Initiate contact via in-app chat.
- Candidates receive a notification and can:
  - Accept and engage in conversation.
  - Ignore or decline contact if not interested.

**Goal:** Provide a direct, lightweight communication channel for the initial conversation, replacing cold outreach across multiple channels.

---

### 4.5 Optional Scraping & Enrichment

- Employers can optionally trigger a **manual enrichment step** for a candidate, which:
  - Scrapes publicly accessible resources such as GitHub or personal portfolio sites (where available and permissible).
  - Produces a short, AI-generated summary of the candidate’s projects and demonstrated skills, based on the scraped content.

Business rules:

- This feature is **not automatic**; it must be explicitly triggered by an employer for a specific candidate.
- The intent is to:
  - Provide a quick, high-level sense of the candidate’s practical work or portfolio.
  - Control resource usage and respect privacy and consent.
- This enrichment is **supporting information only** and does not replace later, more thorough evaluation.

**Goal:** Give employers a slightly deeper, but still lightweight, view of a candidate’s work output before deciding whether to proceed to more time-intensive steps.

---

## 5. Non-Goals / Out-of-Scope

The application explicitly does **not** aim to:

- Replace full recruitment processes, ATS systems, or detailed assessment tools.
- Conduct in-depth technical or behavioral evaluations.
- Handle contract signing, onboarding, or HR operations beyond initial contact.
- Provide video interviews, coding tests, or complex assessment workflows.

The primary purpose is to facilitate **initial discovery and first contact**.  
Subsequent steps (1‑to‑1 meetings, interviews, technical tests, assessment centers, etc.) are expected to happen outside the platform using existing company processes and tools.

---

## 6. Business Success Criteria (High-Level)

- **Employer adoption:** Number of firms actively using the platform to search for candidates.
- **Candidate pool quality:** Number and diversity of completed candidate profiles.
- **Match initiation rate:** Frequency of employers initiating chats with candidates.
- **Conversation engagement:** Percentage of initiated chats that result in meaningful exchanges (e.g., at least X messages).
- **Conversion beyond platform (qualitative):** Feedback that platform introductions led to interviews or hiring processes, even if completed off-platform.

---

## 7. Positioning

- A focused **“first touch” talent platform**:
  - More interactive and targeted than traditional job boards.
  - Simpler and more immediate than full-featured professional networks.
- Designed for speed and clarity:
  - Quick initial screening and outreach.
  - Lightweight enrichment (scraping/summary) when needed.
  - Clear separation between “discover & contact” (on the platform) and “deep evaluation” (off the platform).

---

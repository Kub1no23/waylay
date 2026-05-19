-- =========================================================
--  Database Schema for Talent Matching Platform (PostgreSQL)
-- =========================================================
-- This file defines the initial schema:
--   - candidates        : candidate accounts and personal profiles
--   - company           : company accounts and company profiles
--   - profile           : generic matchable profiles (candidate or company)
--   - flag              : structured attributes (skills, traits, etc.)
--   - profile_flag      : mapping between profiles and flags
--   - status            : interest / match state between candidate & company
--   - chat              : chat threads, one per status (match/interest)
--   - messages          : individual chat messages
--
-- We use pgvector for vector embeddings:
--   - profile.embedding : semantic representation of a profile
--   - flag.embedding    : optional semantic representation of a flag
-- =========================================================


-- 1) Enable pgvector extension (run once per database)
-------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;


-- 2) Table: candidates
-- --------------------
-- Represents individual users (potential employees).
-- Includes login credentials and basic profile fields.
CREATE TABLE candidates (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    location        VARCHAR(255),
    headline        VARCHAR(255),
    summary         TEXT,
    github_url      VARCHAR(500),
    portfolio_url   VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 3) Table: company
-- -----------------
-- Represents employer accounts and basic company profile.
CREATE TABLE company (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    headquarters    VARCHAR(255),
    address         VARCHAR(255),
    industry        VARCHAR(255),
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 4) Table: profile
-- -----------------
-- Generic matchable profiles, shared between candidates and companies.
-- owner_type: 'candidate' or 'company'
-- owner_id  : id from candidates or company, depending on owner_type.
-- embedding : vector representation (e.g., of summary + other text).
CREATE TABLE profile (
    id                  SERIAL PRIMARY KEY,
    owner_type          VARCHAR(20) NOT NULL CHECK (owner_type IN ('candidate', 'company')),
    owner_id            INT NOT NULL,
    title               VARCHAR(255),          -- e.g. "Backend Developer", "Recruiting Profile A"
    summary             TEXT,
    location            VARCHAR(255),
    remote_preference   VARCHAR(50),           -- e.g. 'remote', 'onsite', 'hybrid'
    years_experience    INT,
    embedding           VECTOR(1536),          -- Adjust dimension to chosen embedding model
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on owner_type + owner_id for quick lookups of profiles for a given owner
CREATE INDEX idx_profile_owner ON profile (owner_type, owner_id);

-- Vector index for fast similarity search on profile embeddings
CREATE INDEX idx_profile_embedding ON profile
USING hnsw (embedding vector_cosine_ops);


-- 5) Table: flag
-- --------------
-- Flags represent structured attributes used for matching:
--   - skills (e.g., 'python')
--   - traits (e.g., 'team-player')
--   - industries, etc.
-- embedding is optional and can be used for semantic operations on flags.
CREATE TABLE flag (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,  -- e.g. 'python', 'team-player'
    category    VARCHAR(50),                   -- e.g. 'skill', 'trait', 'industry'
    embedding   VECTOR(1536),                  -- Optional semantic representation of the flag
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flag_embedding ON flag
USING hnsw (embedding vector_cosine_ops);


-- 6) Table: profile_flag
-- ----------------------
-- Many-to-many mapping between profiles and flags.
-- Optional 'weight' can express importance or proficiency.
CREATE TABLE profile_flag (
    profile_id  INT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
    flag_id     INT NOT NULL REFERENCES flag(id) ON DELETE CASCADE,
    weight      NUMERIC,
    PRIMARY KEY (profile_id, flag_id)
);


-- 7) Table: status
-- ----------------
-- Represents interest / match status between a candidate and a company.
-- One row per candidate–company pair where at least one side has expressed interest.
--
-- company_interested   = TRUE when company liked the candidate
-- candidate_interested = TRUE when candidate liked the company
--
-- Mutual match is when both booleans are TRUE.
CREATE TABLE status (
    id                   SERIAL PRIMARY KEY,
    candidate_id         INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    company_id           INT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    company_interested   BOOLEAN NOT NULL DEFAULT FALSE,
    candidate_interested BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_candidate_company UNIQUE (candidate_id, company_id)
);


-- 8) Table: chat
-- --------------
-- One chat thread per status row (per candidate–company relationship).
-- status_id acts as both primary key and foreign key.
CREATE TABLE chat (
    status_id   INT PRIMARY KEY
                REFERENCES status(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 9) Table: messages
-- ------------------
-- Individual messages inside a chat.
-- chat_id  : references chat(status_id).
-- sender   : ID of the sender (either candidates.id or company.id).
-- The side (candidate or company) is resolved in the application layer
-- via the related status record.
CREATE TABLE messages (
    id          SERIAL PRIMARY KEY,
    chat_id     INT NOT NULL REFERENCES chat(status_id) ON DELETE CASCADE,
    sender      INT NOT NULL,                 -- candidate.id or company.id (app-resolved)
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read     BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes to speed up retrieval of messages by chat and by time
CREATE INDEX idx_messages_chat_id ON messages (chat_id);
CREATE INDEX idx_messages_created_at ON messages (created_at);


-- =========================================================
-- End of schema
-- =========================================================

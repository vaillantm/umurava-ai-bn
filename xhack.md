# XHack Flow Guide

This document matches the current backend and Swagger contract.
It describes the recruiter flow end to end:

- create a job
- upload candidates or resumes for that job
- create application records automatically
- run screening on that job
- update the job shortlist
- review results in the dashboard

## What is working now

- `POST /api/jobs` creates a job.
- `GET /api/jobs` returns the recruiter’s jobs.
- `POST /api/uploads/json?jobId=...` uploads candidate JSON and creates both candidates and application records.
- `POST /api/uploads/csv?jobId=...` uploads CSV candidates and creates both candidates and application records.
- `POST /api/uploads/pdf?jobId=...` uploads one resume PDF, parses it, creates/updates a candidate, and creates an application record.
- `POST /api/uploads/bulk-pdf?jobId=...` uploads multiple PDFs and creates candidates, applications, and screening results in one flow.
- `POST /api/screenings/run` can screen either:
  - a specific `jobId + candidateIds`, or
  - `jobId` alone to screen all applications for that job.
- The screening flow updates:
  - `Screening` records
  - `Application.status`
  - `Job.shortlistedCandidates`

## Core Data Flow

```text
Recruiter logs in
    ↓
Recruiter creates a Job
    ↓
Recruiter uploads CVs for that Job
    ↓
System creates Candidate records
    ↓
System creates Application records
  - jobId
  - candidateId
  - cvUrl
  - cvText
  - status: submitted
    ↓
Recruiter runs screening
    ↓
System loads Applications for the Job
    ↓
System screens candidates with Gemini
    ↓
System creates Screening record
    ↓
System updates Application.status
    ↓
System updates Job.shortlistedCandidates
```

## Important Rules

- Every uploaded CV must belong to a `jobId`.
- A CV upload without `jobId` is rejected.
- Duplicate uploads for the same `jobId + candidate` are handled by upsert logic.
- Incomplete profiles are separated for manual review.
- If Gemini fails, the backend falls back to deterministic scoring.
- Screening responses include reasoning, strengths, gaps, and decisions.

## API Sequence

### 1. Login

Use:

- `POST /api/auth/register`
- `POST /api/auth/login`

The recruiter account is created with settings that default to `gemini-1.5-flash`.

### 2. Create a Job

Use `POST /api/jobs`.

Example:

```json
{
  "title": "Senior Backend Engineer",
  "company": "Umurava",
  "department": "Engineering",
  "location": "Kigali, Rwanda",
  "shortlistSize": 10,
  "description": "Build and maintain backend services.",
  "requiredSkills": ["Node.js", "TypeScript", "MongoDB"],
  "aiWeights": {
    "skills": 40,
    "experience": 30,
    "education": 15,
    "projects": 10,
    "certifications": 5
  },
  "status": "active"
}
```

The created job becomes the source of truth for all uploaded candidates and screening.

### 3. Upload Candidates or CVs for That Job

Every upload must include `jobId`.

#### JSON Upload

`POST /api/uploads/json?jobId=JOB_ID`

Creates:

- `Candidate`
- `Application`

#### CSV Upload

`POST /api/uploads/csv?jobId=JOB_ID`

Creates:

- `Candidate`
- `Application`

#### Single PDF Upload

`POST /api/uploads/pdf?jobId=JOB_ID`

Creates:

- parsed `Candidate`
- `Application`

#### Bulk PDF Upload

`POST /api/uploads/bulk-pdf?jobId=JOB_ID`

Creates:

- multiple `Candidate` records
- multiple `Application` records
- can feed directly into screening

### 4. Run Screening

Use `POST /api/screenings/run`.

Supported request shapes:

```json
{
  "jobId": "JOB_ID",
  "candidateIds": ["CANDIDATE_ID_1", "CANDIDATE_ID_2"],
  "shortlistSize": 10
}
```

or:

```json
{
  "jobId": "JOB_ID",
  "shortlistSize": 10
}
```

If `candidateIds` are omitted, the backend screens all applications for that job.

### 5. Review Results

The screening response includes:

- `jobId`
- `jobTitle`
- `screeningId`
- `totalCandidates`
- `shortlistedCount`
- `averageScore`
- `usedFallback`
- `results`
- `incompleteCandidates`

The job is also updated with `shortlistedCandidates`.

## Swagger Contract Notes

The Swagger docs now reflect:

- `Job` schema with `shortlistedCandidates`
- `Candidate` schema with `resumeText` and `resumeUrl`
- `Application` schema
- upload responses that include `jobId` and `jobTitle`
- screening responses that show shortlist and manual-review information

Use the Swagger UI as the source of truth for request and response shapes.

## Demo Path

For the cleanest demo:

1. Create a job.
2. Upload 5 to 30 candidates using JSON, CSV, or PDF with that `jobId`.
3. Run `POST /api/screenings/run` with only the `jobId`.
4. Show:
   - shortlisted candidates
   - incomplete candidates
   - reasoning and score breakdown
   - updated job shortlist


# API Test Guide — Full Flow

Base URL: `http://localhost:4000`
Docs:     `http://localhost:4000/api-docs`

--

---

## Step 2 — Login

**POST** `/api/auth/login`

```json
{
  "email": "test@gmail.com",
  "password": "Password@123"
}
```

> Copy the `token` from the response. Add it to all requests below as:
> `Authorization: Bearer <token>`

---

## Step 3 — Create a Job

**POST** `/api/jobs`
`Authorization: Bearer <token>`

```json
{
  "title": "Senior Backend Engineer",
  "company": "Umurava",
  "department": "Engineering",
  "location": "Kigali, Rwanda",
  "salary": 2500000,
  "jobType": "full-time",
  "employmentType": "On-site",
  "experienceLevel": "Mid-Senior",
  "shortlistSize": 5,
  "description": "Build and maintain backend services.",
  "requiredSkills": ["Node.js", "TypeScript", "MongoDB"],
  "idealCandidateProfile": "Strong API and systems experience.",
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

> Copy the `job._id` from the response. You will need it for screening.

---

## Step 4 — Upload Candidates via CSV

**POST** `/api/uploads/csv`
`Authorization: Bearer <token>`
`Content-Type: multipart/form-data`

| Field | Value              |
|-------|--------------------|
| file  | your `.csv` file   |

### CSV Format

```csv
firstName,lastName,email,headline,location,skills
John,Doe,john@email.com,Backend Engineer,Kigali Rwanda,"Node.js|TypeScript|MongoDB"
Jane,Smith,jane@email.com,Full-Stack Dev,Nairobi Kenya,"React|Node.js|PostgreSQL"
Bob,Mugisha,bob@email.com,DevOps Engineer,Kigali Rwanda,"Docker|Kubernetes|AWS"
```

> Response will include `count` and list of created candidate IDs.
> Copy the candidate `_id` values for the next step.

---

## Step 4b — (Alternative) Upload PDF Resumes

### Single PDF
**POST** `/api/uploads/pdf`
`Authorization: Bearer <token>`
`Content-Type: multipart/form-data`

| Field | Value           |
|-------|-----------------|
| file  | resume.pdf      |

### Multiple PDFs at once
**POST** `/api/uploads/bulk-pdf`
`Authorization: Bearer <token>`
`Content-Type: multipart/form-data`

| Field | Value                        |
|-------|------------------------------|
| files | resume1.pdf, resume2.pdf ... |

> Gemini will parse each PDF and create candidates automatically.
> Copy the returned candidate IDs.

---

## Step 5 — Run AI Screening

**POST** `/api/screenings/run`
`Authorization: Bearer <token>`

```json
{
  "jobId": "<job._id from Step 3>",
  "candidateIds": [
    "<candidate _id 1>",
    "<candidate _id 2>",
    "<candidate _id 3>"
  ],
  "shortlistSize": 5
}
```

> Response includes ranked results with scores, strengths, gaps, and reasoning.
> Copy the `screening._id` for the next step.

---

## Step 5b — (Alternative) Bulk Upload PDFs + Screen in One Shot

**POST** `/api/screenings/bulk-run`
`Authorization: Bearer <token>`
`Content-Type: multipart/form-data`

| Field         | Value                        |
|---------------|------------------------------|
| jobId         | `<job._id>`                  |
| shortlistSize | 5                            |
| files         | resume1.pdf, resume2.pdf ... |

---

## Step 6 — Get Screening Results

### Latest screening for a job
**GET** `/api/screenings/jobs/<jobId>/latest`
`Authorization: Bearer <token>`

### Specific screening by ID
**GET** `/api/screenings/<screeningId>`
`Authorization: Bearer <token>`

### Export screening as JSON
**GET** `/api/screenings/<screeningId>/export`
`Authorization: Bearer <token>`

---

## Other Useful Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/auth/me`                  | Get current user         |
| GET    | `/api/candidates`               | List all candidates      |
| GET    | `/api/candidates/<id>`          | Get single candidate     |
| DELETE | `/api/candidates/<id>`          | Delete candidate         |
| GET    | `/api/jobs`                     | List all jobs            |
| DELETE | `/api/jobs/<id>`                | Delete job               |
| GET    | `/health`                       | Server health check      |

---

## Recommended Test Order

```
1. Register
2. Login          → save token
3. Create Job     → save jobId
4. Upload CSV     → save candidateIds
5. Run Screening  → save screeningId
6. Get Results
```

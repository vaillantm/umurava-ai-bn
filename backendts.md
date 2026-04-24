# Backend API Test Data
> Matches the frontend `umurava-store` seed data exactly.
> Base URL: `http://localhost:4000`

---

## 1. Register

**POST** `/api/auth/register`
```json
{
  "fullName": "Alice Uwimana",
  "email": "alice@umurava.com",
  "password": "StrongPass123!",
  "companyName": "Umurava"
}
```

---

## 2. Login

**POST** `/api/auth/login`
```json
{
  "email": "alice@umurava.com",
  "password": "StrongPass123!"
}
```
> Save the `token` — add it as `Authorization: Bearer <token>` on all requests below.

---

## 3. Create Job

**POST** `/api/jobs`

```json
{
  "title": "Senior Backend Engineer",
  "company": "Umurava",
  "department": "Engineering",
  "location": "Kigali, Rwanda / Remote",
  "salary": 2500000,
  "jobType": "full-time",
  "employmentType": "Full-time",
  "experienceLevel": "Mid-level (3-5 yrs)",
  "shortlistSize": 5,
  "description": "We are looking for a Senior Backend Engineer to design and maintain scalable APIs.",
  "requiredSkills": ["Node.js", "TypeScript", "MongoDB", "REST APIs", "Docker", "PostgreSQL"],
  "idealCandidateProfile": "Ideal candidate has 5+ years of Node.js experience, strong distributed systems knowledge, and comfort working in an agile startup environment.",
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
> Save the returned `job._id`.

---

## 4. Upload Candidates via CSV

**POST** `/api/uploads/csv`
`Content-Type: multipart/form-data` | field name: `file`

Save this as `candidates.csv`:

```csv
firstName,lastName,email,headline,location,skills,yearsExperience,company,role,degree,availability
Alice,Uwimana,alice.uwimana@andela.com,Senior Backend Engineer,Kigali Rwanda,Node.js;TypeScript;MongoDB;Docker;Redis,6,Andela,Senior Backend Engineer,Bachelor's,Available
Eric,Nkurunziza,eric.nku@cloudtech.co.ke,Full Stack Engineer,Nairobi Kenya,TypeScript;Node.js;PostgreSQL;AWS,5,CloudTech Ltd,Full Stack Engineer,BSc,Open to Opportunities
David,Hakizimana,david.haki@infra.dev,DevOps Engineer,Remote,Docker;Kubernetes;AWS;Terraform,6,InfraWorks,DevOps Engineer,BSc,Open to Opportunities
Michael,Okonkwo,michael.okonkwo@umurava.ai,Backend Engineer,Accra Ghana,Node.js;TypeScript;MongoDB,4,TechCorp,Backend Engineer,Bachelor's,Available
Amara,Diallo,amara.diallo@umurava.ai,Full Stack Engineer,Dakar Senegal,TypeScript;Node.js;PostgreSQL,4,StartupX,Full Stack Engineer,BSc,Available
Paul,Mugabo,paul.mugabo@umurava.ai,Backend Engineer,Kampala Uganda,Node.js;MongoDB;Docker,3,DevHouse,Backend Engineer,Bachelor's,Available
Aisha,Kabore,aisha.kabore@umurava.ai,Cloud Engineer,Addis Ababa Ethiopia,AWS;Terraform;Docker,4,CloudBase,Cloud Engineer,BSc,Available
Kwame,Asante,kwame.asante@umurava.ai,DevOps Engineer,Dar es Salaam Tanzania,Kubernetes;Docker;AWS,5,InfraNet,DevOps Engineer,BSc,Open to Opportunities
```

> Save the returned candidate `_id` values.

---

## 5. Upload Candidates via JSON (alternative to CSV)

**POST** `/api/uploads/json`
`Content-Type: multipart/form-data` | field name: `file`

Save this as `candidates.json`:

```json
[
  {
    "source": "json",
    "personalInfo": {
      "firstName": "Alice",
      "lastName": "Uwimana",
      "email": "alice.uwimana@andela.com",
      "headline": "Senior Backend Engineer · Node.js & AI Systems",
      "bio": "Experienced backend leader with expertise in scalable microservices and AI integrations.",
      "location": "Kigali, Rwanda"
    },
    "skills": [
      { "name": "Node.js", "level": "Expert", "yearsOfExperience": 6 },
      { "name": "TypeScript", "level": "Advanced", "yearsOfExperience": 5 },
      { "name": "MongoDB", "level": "Advanced", "yearsOfExperience": 4 },
      { "name": "Docker", "level": "Advanced", "yearsOfExperience": 3 },
      { "name": "Redis", "level": "Intermediate", "yearsOfExperience": 2 }
    ],
    "languages": [
      { "name": "English", "proficiency": "Fluent" },
      { "name": "Kinyarwanda", "proficiency": "Native" }
    ],
    "experience": [
      {
        "company": "Andela",
        "role": "Senior Backend Engineer",
        "startDate": "2022-01",
        "endDate": "Present",
        "description": "Led microservices migration for talent marketplace. Reduced latency 40%.",
        "technologies": ["Node.js", "Express", "MongoDB"],
        "isCurrent": true
      },
      {
        "company": "Kasha Rwanda",
        "role": "Backend Engineer",
        "startDate": "2019-06",
        "endDate": "2021-12",
        "description": "Built e-commerce APIs and payment integrations.",
        "technologies": ["Node.js", "MongoDB"],
        "isCurrent": false
      }
    ],
    "education": [
      {
        "institution": "University of Rwanda",
        "degree": "Bachelor's",
        "fieldOfStudy": "Computer Science",
        "startYear": 2016,
        "endYear": 2020
      }
    ],
    "certifications": [
      { "name": "AWS Certified Developer", "issuer": "Amazon", "issueDate": "2023-03" }
    ],
    "projects": [
      {
        "name": "Talent Marketplace API",
        "description": "Scalable backend for 50k+ users",
        "technologies": ["Node.js", "MongoDB"],
        "role": "Tech Lead",
        "link": "https://github.com/alice/talent-api",
        "startDate": "2022-01",
        "endDate": "Present"
      }
    ],
    "availability": { "status": "Available", "type": "Full-time", "startDate": "2024-05-01" },
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/aliceuwimana",
      "github": "https://github.com/aliceuwimana",
      "portfolio": "https://alice.dev"
    }
  },
  {
    "source": "json",
    "personalInfo": {
      "firstName": "Eric",
      "lastName": "Nkurunziza",
      "email": "eric.nku@cloudtech.co.ke",
      "headline": "Full Stack Engineer · TypeScript & Cloud",
      "bio": "Cloud-native developer specializing in AWS and scalable applications.",
      "location": "Nairobi, Kenya"
    },
    "skills": [
      { "name": "TypeScript", "level": "Advanced", "yearsOfExperience": 5 },
      { "name": "Node.js", "level": "Advanced", "yearsOfExperience": 4 },
      { "name": "PostgreSQL", "level": "Advanced", "yearsOfExperience": 4 },
      { "name": "AWS", "level": "Advanced", "yearsOfExperience": 3 }
    ],
    "languages": [
      { "name": "English", "proficiency": "Fluent" },
      { "name": "Swahili", "proficiency": "Native" }
    ],
    "experience": [
      {
        "company": "CloudTech Ltd",
        "role": "Full Stack Engineer",
        "startDate": "2021-03",
        "endDate": "Present",
        "description": "AWS migrations and Kubernetes deployments.",
        "technologies": ["TypeScript", "Node.js"],
        "isCurrent": true
      }
    ],
    "education": [
      {
        "institution": "Strathmore University",
        "degree": "BSc",
        "fieldOfStudy": "Computer Science",
        "startYear": 2017,
        "endYear": 2021
      }
    ],
    "certifications": [
      { "name": "AWS Certified Developer Associate", "issuer": "Amazon", "issueDate": "2023-08" }
    ],
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Serverless AWS app with Lambda.",
        "technologies": ["AWS Lambda", "TypeScript"],
        "role": "Full Stack",
        "startDate": "2022-06",
        "endDate": "2023-02"
      }
    ],
    "availability": { "status": "Open to Opportunities", "type": "Full-time", "startDate": "2024-06-01" },
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/ericnku",
      "github": "https://github.com/ericnku"
    }
  },
  {
    "source": "json",
    "personalInfo": {
      "firstName": "David",
      "lastName": "Hakizimana",
      "email": "david.haki@infra.dev",
      "headline": "DevOps Engineer · Cloud Automation",
      "bio": "DevOps specialist focused on CI/CD, infrastructure as code, and observability.",
      "location": "Remote"
    },
    "skills": [
      { "name": "Docker", "level": "Expert", "yearsOfExperience": 6 },
      { "name": "Kubernetes", "level": "Advanced", "yearsOfExperience": 5 },
      { "name": "AWS", "level": "Advanced", "yearsOfExperience": 5 },
      { "name": "Terraform", "level": "Advanced", "yearsOfExperience": 4 }
    ],
    "languages": [{ "name": "English", "proficiency": "Fluent" }],
    "experience": [
      {
        "company": "InfraWorks",
        "role": "DevOps Engineer",
        "startDate": "2019-05",
        "endDate": "Present",
        "description": "Managed cloud infrastructure, deployments, and monitoring.",
        "technologies": ["AWS", "Kubernetes", "Terraform"],
        "isCurrent": true
      }
    ],
    "education": [
      {
        "institution": "University of Kigali",
        "degree": "BSc",
        "fieldOfStudy": "Computer Engineering",
        "startYear": 2014,
        "endYear": 2018
      }
    ],
    "certifications": [
      { "name": "AWS Solutions Architect", "issuer": "Amazon", "issueDate": "2022-11" },
      { "name": "CKA", "issuer": "CNCF", "issueDate": "2023-05" }
    ],
    "projects": [
      {
        "name": "Deployment Platform",
        "description": "Built self-service deployment workflows for engineering teams.",
        "technologies": ["Terraform", "Kubernetes"],
        "role": "Owner",
        "startDate": "2021-04",
        "endDate": "Present"
      }
    ],
    "availability": { "status": "Open to Opportunities", "type": "Full-time", "startDate": "2024-06-01" },
    "socialLinks": { "github": "https://github.com/dhakizimana" }
  }
]
```

---

## 6. Run AI Screening

**POST** `/api/screenings/run`

```json
{
  "jobId": "<job._id from Step 3>",
  "candidateIds": [
    "<candidate _id 1>",
    "<candidate _id 2>",
    "<candidate _id 3>",
    "<candidate _id 4>",
    "<candidate _id 5>"
  ],
  "shortlistSize": 5
}
```

> Save the returned `screening._id`.

---

## 7. Get Results

### Latest screening for the job
**GET** `/api/screenings/jobs/<jobId>/latest`

### Specific screening
**GET** `/api/screenings/<screeningId>`

### Export as JSON
**GET** `/api/screenings/<screeningId>/export`

---

## Expected Screening Result Shape

```json
{
  "jobId": "...",
  "totalCandidates": 5,
  "shortlistedCount": 5,
  "averageScore": 84,
  "usedFallback": false,
  "summary": "Top candidates shortlisted based on Node.js, TypeScript, and MongoDB skill overlap.",
  "results": [
    {
      "candidateId": "...",
      "rank": 1,
      "score": 92,
      "scoreBreakdown": {
        "skills": 38,
        "experience": 28,
        "education": 12,
        "projects": 9,
        "certifications": 5
      },
      "strengths": ["Node.js proficiency", "Relevant industry experience"],
      "gaps": [],
      "reasoning": "Strong match due to Node.js, TypeScript, MongoDB expertise and 6 years of experience.",
      "decision": "shortlisted"
    }
  ],
  "incompleteCandidates": []
}
```

---

## Quick Reference

| Step | Method | Endpoint                              |
|------|--------|---------------------------------------|
| 1    | POST   | `/api/auth/register`                  |
| 2    | POST   | `/api/auth/login`                     |
| 3    | POST   | `/api/jobs`                           |
| 4    | POST   | `/api/uploads/csv`                    |
| 4b   | POST   | `/api/uploads/json`                   |
| 4c   | POST   | `/api/uploads/bulk-pdf`               |
| 5    | POST   | `/api/screenings/run`                 |
| 6    | GET    | `/api/screenings/jobs/:jobId/latest`  |
| 7    | GET    | `/api/screenings/:screeningId/export` |

# Instructions: Fix CV Upload Logic to Link with Job ID

## **Problem:**
Currently, CV uploads don't know which job they're for. When you upload a CV, the system doesn't track:
- ❌ Which job is this CV for?
- ❌ Which candidates applied to which jobs?
- ❌ Is this a duplicate application?

---

## **Solution: Link CVs to Jobs**

### **Step 1: Update CSV Upload Endpoint**
When recruiter uploads CSV candidates:
1. **Require `jobId` in the request** (as form field or in URL)
2. **For each candidate created**, automatically create an `Application` record that links:
   - Candidate ID
   - Job ID
   - CSV upload timestamp
3. **Check for duplicates** - if candidate already applied to this job, skip or update
4. **Return list of created applications** (not just candidates)

---

### **Step 2: Update PDF Resume Upload Endpoint**
When recruiter uploads individual PDF resumes:
1. **Require `jobId` in the request** (must know which job these CVs are for)
2. **For each PDF uploaded**:
   - Extract candidate info from PDF
   - Create/find candidate in database
   - Create `Application` record linking candidate → job → CV
3. **Don't allow orphaned CVs** - every CV must be tied to a specific job
4. **Return applications list** with job info included

---

### **Step 3: Update Bulk PDF Upload Endpoint** (`/api/screenings/bulk-run`)
This is your **most important endpoint** for recruiters. Update it:
1. **Require `jobId` in the request** (already doing this - good!)
2. **For each PDF uploaded**:
   - Extract candidate info
   - Create candidate if needed
   - Create `Application` record (jobId + candidateId + cvUrl)
3. **Automatically run screening** on all uploaded CVs
4. **Return screening results** with:
   - Job ID
   - Number of CVs processed
   - Number shortlisted
   - Shortlisted candidate list

---

### **Step 4: Update Screening Endpoint**
When running `/api/screenings/run`:
1. **Accept either**:
   - `jobId + candidateIds` (current method), OR
   - `jobId` only (new method - screen ALL applications for this job)
2. **Look up applications** where jobId matches
3. **Extract CV text** from application's cvUrl
4. **Run AI screening** on extracted text
5. **Link screening results** to the application record
6. **Auto-update job's shortlist** with results

---

### **Step 5: Database Flow**
Ensure this flow happens automatically:

```
Recruiter selects Job
        ↓
Recruiter uploads CVs (PDF or CSV)
        ↓
System creates Application records:
  - candidateId
  - jobId
  - cvUrl (file path)
  - cvText (extracted text)
  - status: "submitted"
        ↓
Recruiter clicks "Screen"
        ↓
System finds all Applications for this jobId
        ↓
For each Application:
  - Get cvText
  - Run Claude/Gemini AI
  - Create Screening record
  - Update Application.status → "screened"
        ↓
Job's shortlistedCandidates updated automatically
        ↓
Return results with job title, candidates, scores
```

---

## **Smooth UX Flow for Recruiter**

1. **Pick Job** → Dropdown of available jobs
2. **Upload CVs** → Automatically knows which job (selected in Step 1)
3. **See uploaded count** → "5 CVs uploaded for Senior Backend Engineer"
4. **Click Screen** → AI runs immediately, no more setup needed
5. **See results** → Shortlist automatically saved to job

---

## **Key Validation Rules**

### **When uploading CVs:**
- ✅ Check that jobId is provided
- ✅ Check that job exists
- ✅ Check for duplicate candidates in same job
- ✅ Create Application record for each candidate
- ✅ Extract CV text immediately

### **When screening:**
- ✅ Check that all Applications have cvText extracted
- ✅ Only screen Applications for the selected job
- ✅ If cvText missing, extract it first
- ✅ Create Screening record for each Application
- ✅ Add passed candidates to Job.shortlistedCandidates

### **When viewing results:**
- ✅ Show job title & info
- ✅ Show which candidates are shortlisted
- ✅ Show AI scores and feedback
- ✅ Allow exporting shortlist as CSV

---

## **API Response Examples**

### **Upload CVs Response (should include jobId)**
```
POST /api/uploads/csv?jobId=69ea8c31654eb5b04f324f03

Response:
{
  "jobId": "69ea8c31654eb5b04f324f03",
  "jobTitle": "Senior Backend Engineer",
  "candidatesCreated": 5,
  "applicationsCreated": [
    { "candidateId": "...", "applicationId": "..." },
    { "candidateId": "...", "applicationId": "..." }
  ],
  "message": "5 CVs uploaded for Senior Backend Engineer"
}
```

### **Screening Response (should show job context)**
```
POST /api/screenings/run

Response:
{
  "jobId": "69ea8c31654eb5b04f324f03",
  "jobTitle": "Senior Backend Engineer",
  "totalProcessed": 5,
  "shortlistedCount": 3,
  "shortlistedCandidates": [
    { "name": "John Doe", "score": 92, "feedback": "..." },
    { "name": "Jane Smith", "score": 88, "feedback": "..." },
    { "name": "Bob Mugisha", "score": 85, "feedback": "..." }
  ]
}
```

---

## **Summary**

✅ **Every CV must have a jobId**
✅ **Every Application links candidate → job → CV**
✅ **Screening works on Applications (not orphaned CVs)**
✅ **Results show which job, which candidates, which scores**
✅ **Shortlist auto-updates job record**

This way, you'll **never lose track** of which CVs are for which jobs! 🎯 Testing the Whole Flow for Hackathon in xhack.md

  Since I do not have the content of xhack.md, I will provide a general end-to-end
  testing strategy for the screening flow. You can adapt these steps based on any
  specific instructions or tools mentioned in your xhack.md.

  Assumptions:
   * You have a running backend server with the updated screening.controller.ts.
   * You have your GEMINI_API_KEY set in your .env file and have restarted the
     server.
   * You have a way to make API requests (e.g., curl, Postman, Insomnia, or a
     script).
   * There is an endpoint to create jobs (e.g., POST /jobs).
   * There is an endpoint to create candidates from JSON data (e.g., POST
     /candidates). If not, you might need to adapt the runBulkScreening function or
     simulate it.

  End-to-End Testing Steps:

   1. Create the Job:
       * Action: Send a POST request to your job creation endpoint (e.g., POST /jobs)         with the Job JSON Sample provided above.
       * Example Request (using curl):

    1         curl -X POST http://localhost:4000/jobs \
    2         -H "Content-Type: application/json" \
    3         -d '{
    4             "title": "Senior Full Stack Engineer",
    5             "company": "Innovatech Solutions",
    6             "description": "We are looking for a Senior Full Stack Engineer
      with expertise in JavaScript, Node.js, React, and AWS. The ideal candidate will      have 5+ years of experience and a strong understanding of modern web
      development practices.",
    7             "requiredSkills": ["JavaScript", "Node.js", "React", "AWS"],
    8             "shortlistSize": 2,
    9             "aiWeights": { "skills": 50, "experience": 40, "education": 5,
      "projects": 5, "certifications": 0 }
   10         }'
       * Expected Result: You should receive a JSON response with the details of the
         created job, including a unique jobId. Note down this jobId.

   2. Create Candidates from JSON:
       * Action: For each of the 5 candidate JSON samples, send a POST request to
         your candidate creation endpoint (e.g., POST /candidates).
       * Example Request (using curl for one candidate):

   1         curl -X POST http://localhost:4000/candidates \
   2         -H "Content-Type: application/json" \
   3         -d '{
   4             "personalInfo": { "firstName": "Alice", "lastName": "Smith",
     "email": "alice.smith@example.com", "headline": "Senior Software Engineer",
     "location": "San Francisco, CA" },
   5             "skills": [{"name": "JavaScript", "level": "Expert",
     "yearsOfExperience": 8}, {"name": "React", "level": "Expert",
     "yearsOfExperience": 6}, {"name": "Node.js", "level": "Expert",
     "yearsOfExperience": 5}, {"name": "TypeScript", "level": "Advanced",
     "yearsOfExperience": 4}],
   6             "experience": [ { "company": "TechCorp", "role": "Senior Software
     Engineer", "startDate": "2020-01-01", "endDate": "", "description": "Led
     development of critical features for a large-scale web application using React
     and Node.js.", "yearsOfExperience": 4, "isCurrent": true }, { "company":
     "Innovate Solutions", "role": "Software Engineer", "startDate": "2018-06-01",
     "endDate": "2019-12-31", "description": "Developed backend services and APIs.",
     "yearsOfExperience": 1.5 } ],
   7             "resumeText": "Alice Smith is a Senior Software Engineer based in
     San Francisco, CA. With 8 years of experience in JavaScript, 6 years in React, 5     years in Node.js, and 4 years in TypeScript. Currently works at TechCorp as a
     Senior Software Engineer, leading development on a large-scale web application.
     Previously worked at Innovate Solutions as a Software Engineer developing
     backend services. Highly skilled in JavaScript, React, Node.js, and
     TypeScript.",
   8             "source": "json"
   9         }'
       * Expected Result: For each request, you should receive a response with the
         created candidate's details, including a unique candidateId. Collect all 5
         candidateIds.

   3. Run the Screening:
       * Action: Send a POST request to the /api/screenings/run endpoint. The jobId
         should be the one you noted in Step 1, and candidateIds should be an array
         of the 5 candidateIds you collected in Step 2.
       * Example Request (using curl):

   1         # Replace YOUR_JOB_ID and the candidate IDs with actual values
   2         curl -X POST http://localhost:4000/api/screenings/run \
   3         -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
   4         -H "Content-Type: application/json" \
   5         -d '{
   6           "jobId": "YOUR_JOB_ID",
   7           "candidateIds": ["CANDIDATE_ID_1", "CANDIDATE_ID_2", "CANDIDATE_ID_3",     "CANDIDATE_ID_4", "CANDIDATE_ID_5"],
   8           "shortlistSize": 2
   9         }'
          (Note: You might need an Authorization token depending on your setup.)
       * Expected Result: A JSON response containing the screening results.

   4. Verify the Screening Results:
       * Check usedFallback: See if it's true or false. If false, Gemini was used. If         true, the fallback scoring was used.
       * Examine results: This array contains the shortlisted candidates (up to
         shortlistSize).
           * Check score and decision for each candidate.
           * Look at reasoning to understand why a candidate was scored or
             shortlisted/rejected.
           * Check strengths and gaps if provided by Gemini.
       * Review summary: This should give an overview of the screening process,
  These steps should allow you to test the full flow from creating job/candidate data  to running the screening and reviewing Gemini's (or fallback's) output.
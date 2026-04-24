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

This way, you'll **never lose track** of which CVs are for which jobs! 🎯
Umurava AI Recruiter API
 1.0.0 
OAS 3.0
AI-powered talent screening backend for Umurava Hackathon 2026

Contact Umurava AI Team
Servers

http://localhost:4000 - Local Development Server

Authorize
Auth
Authentication & User Management



POST
/api/auth/register
Register a new recruiter

Parameters
Cancel
Reset
No parameters

Request body

application/json
Edit Value
Schema
{
  "fullName": "John Test",
  "email": "test@gmail.com",
  "password": "Password@123",
  "companyName": "Umurava"
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'http://localhost:4000/api/auth/register' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "fullName": "John Test",
  "email": "test@gmail.com",
  "password": "Password@123",
  "companyName": "Umurava"
}'
Request URL
http://localhost:4000/api/auth/register
Server response
Code	Details
201	
Response body
Download
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5Nzg1OTAsImV4cCI6MTc3NzU4MzM5MH0.Cm7abseawqUe62RSdw786xyUO1uKhy_3GC5eAzBei14",
  "user": {
    "id": "69ea8a9d654eb5b04f324efb",
    "fullName": "John Test",
    "email": "test@gmail.com",
    "role": "recruiter",
    "companyName": "Umurava",
    "status": "active",
    "settings": {
      "primaryModel": "gemini-2.5-pro",
      "batchOutput": true,
      "explainableStructuring": true,
      "biasDetection": true,
      "promptContext": ""
    },
    "createdAt": "2026-04-23T21:09:49.873Z",
    "updatedAt": "2026-04-23T21:09:49.873Z"
  }
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: http://localhost:4000 
 connection: keep-alive 
 content-length: 611 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 21:09:48 GMT 
 etag: W/"263-F8q1MU7wALf72TikdWeb02CwNE4" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 93 
 x-ratelimit-reset: 1776979431 
 x-xss-protection: 0 
Responses
Code	Description	Links
201	
User registered successfully

No links
409	
User already exists

No links

POST
/api/auth/login
Login user and receive JWT token

Parameters
Cancel
Reset
No parameters

Request body

application/json
Edit Value
Schema
{
  "email": "test@gmail.com",
  "password": "Password@123"
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'http://localhost:4000/api/auth/login' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "test@gmail.com",
  "password": "Password@123"
}'
Request URL
http://localhost:4000/api/auth/login
Server response
Code	Details
200	
Response body
Download
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5Nzg2ODgsImV4cCI6MTc3NzU4MzQ4OH0.WEoJmU0QeF1gyZB-U1N3bDzOxCV67N8MhN3iW0XVRx8",
  "user": {
    "id": "69ea8a9d654eb5b04f324efb",
    "fullName": "John Test",
    "email": "test@gmail.com",
    "role": "recruiter",
    "companyName": "Umurava",
    "status": "active",
    "settings": {
      "primaryModel": "gemini-2.5-pro",
      "batchOutput": true,
      "explainableStructuring": true,
      "biasDetection": true,
      "promptContext": ""
    },
    "createdAt": "2026-04-23T21:09:49.873Z",
    "updatedAt": "2026-04-23T21:09:49.873Z"
  }
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: http://localhost:4000 
 connection: keep-alive 
 content-length: 599 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 21:11:27 GMT 
 etag: W/"257-pMSu2jHUJXA4cjbD2hF7oi6qdeE" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 92 
 x-ratelimit-reset: 1776979431 
 x-xss-protection: 0 
Responses
Code	Description	Links
200	
Login successful

No links
401	
Invalid credentials

No links

GET
/api/auth/me
Get current logged-in user profile


Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'http://localhost:4000/api/auth/me' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5Nzg2ODgsImV4cCI6MTc3NzU4MzQ4OH0.WEoJmU0QeF1gyZB-U1N3bDzOxCV67N8MhN3iW0XVRx8'
Request URL
http://localhost:4000/api/auth/me
Server response
Code	Details
200	
Response body
Download
{
  "id": "69ea8a9d654eb5b04f324efb",
  "fullName": "John Test",
  "email": "test@gmail.com",
  "role": "recruiter",
  "companyName": "Umurava",
  "status": "active",
  "settings": {
    "primaryModel": "gemini-2.5-pro",
    "batchOutput": true,
    "explainableStructuring": true,
    "biasDetection": true,
    "promptContext": ""
  },
  "createdAt": "2026-04-23T21:09:49.873Z",
  "updatedAt": "2026-04-23T21:09:49.873Z"
}
Response headers
 access-control-allow-credentials: true 
 connection: keep-alive 
 content-length: 354 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 21:11:53 GMT 
 etag: W/"162-57QtsIx+3rEnUP+z9Jgp/CT4e+0" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 90 
 x-ratelimit-reset: 1776979431 
 x-xss-protection: 0 
Responses
Code	Description	Links
200	
Current user profile

No links
401	
Not authorized

No links

POST
/api/auth/logout
Logout user (client-side token removal)



PATCH
/api/auth/profile
Update user profile (avatar upload is optional)


Parameters
Cancel
Reset
No parameters

Request body

multipart/form-data
fullName
string
John
Send empty value
companyName
string
Test
Send empty value
avatar
string($binary)
Profile picture (optional - saved on Cloudinary if provided)

85306600964e68b36c7e1252b0f35d30.jpg
Send empty value
Execute
Clear
Responses
Curl

curl -X 'PATCH' \
  'http://localhost:4000/api/auth/profile' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5Nzg2ODgsImV4cCI6MTc3NzU4MzQ4OH0.WEoJmU0QeF1gyZB-U1N3bDzOxCV67N8MhN3iW0XVRx8' \
  -H 'Content-Type: multipart/form-data' \
  -F 'fullName=John' \
  -F 'companyName=Test' \
  -F 'avatar=@85306600964e68b36c7e1252b0f35d30.jpg;type=image/jpeg'
Request URL
http://localhost:4000/api/auth/profile
Server response
Code	Details
200	
Response body
Download
{
  "message": "Profile updated successfully",
  "user": {
    "id": "69ea8a9d654eb5b04f324efb",
    "fullName": "John",
    "email": "test@gmail.com",
    "role": "recruiter",
    "companyName": "Test",
    "avatarUrl": "https://res.cloudinary.com/djyhrc0di/image/upload/v1776978797/umurava-avatars/ntz4hhadwzvpfbnrtous.jpg",
    "status": "active",
    "settings": {
      "primaryModel": "gemini-2.5-pro",
      "batchOutput": true,
      "explainableStructuring": true,
      "biasDetection": true,
      "promptContext": ""
    },
    "createdAt": "2026-04-23T21:09:49.873Z",
    "updatedAt": "2026-04-23T21:13:17.295Z"
  }
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: http://localhost:4000 
 connection: keep-alive 
 content-length: 513 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 21:13:14 GMT 
 etag: W/"201-M2B0hi1xPwywletrhYmvGk2EA/8" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 89 
 x-ratelimit-reset: 1776979431 
 x-xss-protection: 0 
Responses
Code	Description	Links
200	
Profile updated successfully

No links
400	
Avatar file is required

No links
Candidates
Manage candidates (recruiter only)



POST
/api/candidates
Create a new candidate (Manual Entry)


Create a candidate manually. You MUST upload an avatar image file. Personal info can be sent as flat fields or nested under "personalInfo".

Parameters
Cancel
Reset
No parameters

Request body

multipart/form-data
avatar *
string($binary)
Candidate profile photo (REQUIRED - will be saved on Cloudinary)

Generated Image April 17, 2026 - 4_59PM (1).png
firstName
string
Kalisa
Send empty value
lastName
string
Aime
Send empty value
email
string
kalisa.aime@umurava.com
Send empty value
headline
string
Senior Backend Engineer
Send empty value
bio
string
Experienced developer with passion for AI
Send empty value
location
string
Kigali, Rwanda
Send empty value
skills
array<object>
Edit Value
Schema
{
  "name": "Node.js",
  "level": "Expert",
  "yearsOfExperience": 5
}
-
Add object item
Send empty value
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'http://localhost:4000/api/candidates' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5Nzg2ODgsImV4cCI6MTc3NzU4MzQ4OH0.WEoJmU0QeF1gyZB-U1N3bDzOxCV67N8MhN3iW0XVRx8' \
  -H 'Content-Type: multipart/form-data' \
  -F 'avatar=@Generated Image April 17, 2026 - 4_59PM (1).png;type=image/png' \
  -F 'firstName=Kalisa' \
  -F 'lastName=Aime' \
  -F 'email=kalisa.aime@umurava.com' \
  -F 'headline=Senior Backend Engineer' \
  -F 'bio=Experienced developer with passion for AI' \
  -F 'location=Kigali, Rwanda' \
  -F 'skills=[{"name":"Node.js","level":"Expert","yearsOfExperience":5}]'
Request URL
http://localhost:4000/api/candidates
Server response
Code	Details
201	
Response body
Download
{
  "message": "Candidate created successfully",
  "candidate": {
    "source": "manual",
    "avatar": {
      "url": "https://res.cloudinary.com/djyhrc0di/image/upload/v1776978913/umurava-candidates/obpzoqmyovkuo1mutdi5.png",
      "publicId": "umurava-candidates/obpzoqmyovkuo1mutdi5"
    },
    "personalInfo": {
      "firstName": "Kalisa",
      "lastName": "Aime",
      "email": "kalisa.aime@umurava.com",
      "headline": "Senior Backend Engineer",
      "bio": "Experienced developer with passion for AI",
      "location": "Kigali, Rwanda"
    },
    "skills": [
      {
        "name": "Node.js",
        "level": "Expert",
        "yearsOfExperience": 5
      }
    ],
    "languages": [],
    "experience": [],
    "education": [],
    "certifications": [],
    "projects": [],
    "strengths": [],
    "gaps": [],
    "_id": "69ea8be3654eb5b04f324f00",
    "createdAt": "2026-04-23T21:15:15.090Z",
    "updatedAt": "2026-04-23T21:15:15.090Z",
    "__v": 0
  }
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: http://localhost:4000 
 connection: keep-alive 
 content-length: 752 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 21:14:59 GMT 
 etag: W/"2f0-mSNszbEvHdVVbtZKdGQdoSiv22A" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 88 
 x-ratelimit-reset: 1776979431 
 x-xss-protection: 0 
Responses
Code	Description	Links
201	
Candidate created successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "Candidate created successfully",
  "candidate": {
    "source": "manual",
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com",
      "headline": "Full-Stack Engineer",
      "bio": "Backend-focused engineer with 5 years experience.",
      "location": "Kigali, Rwanda"
    },
    "skills": [
      {
        "name": "Node.js",
        "level": "Expert",
        "yearsOfExperience": 5
      }
    ]
  }
}
No links
400	
Avatar file is required or validation error

No links

GET
/api/candidates
Get all candidates


Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'http://localhost:4000/api/candidates' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5Nzg2ODgsImV4cCI6MTc3NzU4MzQ4OH0.WEoJmU0QeF1gyZB-U1N3bDzOxCV67N8MhN3iW0XVRx8'
Request URL
http://localhost:4000/api/candidates
Server response
Code	Details
200	
Response body
Download
[
  {
    "avatar": {
      "url": "https://res.cloudinary.com/djyhrc0di/image/upload/v1776978913/umurava-candidates/obpzoqmyovkuo1mutdi5.png",
      "publicId": "umurava-candidates/obpzoqmyovkuo1mutdi5"
    },
    "personalInfo": {
      "firstName": "Kalisa",
      "lastName": "Aime",
      "email": "kalisa.aime@umurava.com",
      "headline": "Senior Backend Engineer",
      "bio": "Experienced developer with passion for AI",
      "location": "Kigali, Rwanda"
    },
    "_id": "69ea8be3654eb5b04f324f00",
    "source": "manual",
    "skills": [
      {
        "name": "Node.js",
        "level": "Expert",
        "yearsOfExperience": 5
      }
    ],
    "languages": [],
    "experience": [],
    "education": [],
    "certifications": [],
    "projects": [],
    "strengths": [],
    "gaps": [],
    "createdAt": "2026-04-23T21:15:15.090Z",
    "updatedAt": "2026-04-23T21:15:15.090Z",
    "__v": 0
  }
]
Response headers
 access-control-allow-credentials: true 
 connection: keep-alive 
 content-length: 697 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 21:15:25 GMT 
 etag: W/"2b9-m2Vmzoe0gZYgMfZc0SFih3Qupew" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 87 
 x-ratelimit-reset: 1776979431 
 x-xss-protection: 0 
Responses
Code	Description	Links
200	
List of all candidates

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
[
  {
    "source": "pdf",
    "sourceFileName": "john-doe-resume.pdf",
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com",
      "headline": "Full-Stack Engineer",
      "location": "Kigali, Rwanda"
    }
  }
]
No links

GET
/api/candidates/{candidateId}
Get a single candidate by ID



PATCH
/api/candidates/{candidateId}
Update an existing candidate



DELETE
/api/candidates/{candidateId}
Delete a candidate



POST
/api/candidates/bulk
Bulk create candidates from JSON array


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
[
  {}
]
Responses
Code	Description	Links
201	
Bulk candidates created

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "2 candidates created",
  "count": 2
}
No links
Dashboard
Dashboard snapshot and summary endpoints



GET
/api/dashboard/snapshot
Get dashboard snapshot


Jobs
Job management endpoints



POST
/api/jobs
Create a new job


Parameters
Cancel
No parameters

Request body

application/json
Examples: 
sample
Edit Value
Schema
{
  "title": "Senior Backend Engineer",
  "company": "Umurava",
  "department": "Engineering",
  "location": "Kigali, Rwanda",
  "salary": 2500000,
  "jobType": "full-time",
  "employmentType": "On-site",
  "experienceLevel": "Mid-Senior",
  "shortlistSize": 10,
  "description": "Build and maintain backend services.",
  "requiredSkills": [
    "Node.js",
    "TypeScript",
    "MongoDB"
  ],
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
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'http://localhost:4000/api/jobs' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5Nzg2ODgsImV4cCI6MTc3NzU4MzQ4OH0.WEoJmU0QeF1gyZB-U1N3bDzOxCV67N8MhN3iW0XVRx8' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Senior Backend Engineer",
  "company": "Umurava",
  "department": "Engineering",
  "location": "Kigali, Rwanda",
  "salary": 2500000,
  "jobType": "full-time",
  "employmentType": "On-site",
  "experienceLevel": "Mid-Senior",
  "shortlistSize": 10,
  "description": "Build and maintain backend services.",
  "requiredSkills": [
    "Node.js",
    "TypeScript",
    "MongoDB"
  ],
  "idealCandidateProfile": "Strong API and systems experience.",
  "aiWeights": {
    "skills": 40,
    "experience": 30,
    "education": 15,
    "projects": 10,
    "certifications": 5
  },
  "status": "active"
}'
Request URL
http://localhost:4000/api/jobs
Server response
Code	Details
201	
Response body
Download
{
  "title": "Senior Backend Engineer",
  "company": "Umurava",
  "department": "Engineering",
  "location": "Kigali, Rwanda",
  "salary": 2500000,
  "jobType": "full-time",
  "employmentType": "On-site",
  "experienceLevel": "Mid-Senior",
  "shortlistSize": 10,
  "description": "Build and maintain backend services.",
  "requiredSkills": [
    "Node.js",
    "TypeScript",
    "MongoDB"
  ],
  "idealCandidateProfile": "Strong API and systems experience.",
  "aiWeights": {
    "skills": 40,
    "experience": 30,
    "education": 15,
    "projects": 10,
    "certifications": 5
  },
  "status": "active",
  "createdBy": "69ea8a9d654eb5b04f324efb",
  "_id": "69ea8c31654eb5b04f324f03",
  "createdAt": "2026-04-23T21:16:33.212Z",
  "updatedAt": "2026-04-23T21:16:33.212Z",
  "__v": 0
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: http://localhost:4000 
 connection: keep-alive 
 content-length: 658 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 21:16:33 GMT 
 etag: W/"292-DGMaMPlJ4GiRjfYOXA1mK8co3oU" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 86 
 x-ratelimit-reset: 1776979431 
 x-xss-protection: 0 
Responses
Code	Description	Links
201	
Job created successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "Job created successfully",
  "job": {
    "title": "Senior Backend Engineer",
    "company": "Umurava",
    "department": "Engineering",
    "location": "Kigali, Rwanda",
    "shortlistSize": 10,
    "description": "Build and maintain backend services.",
    "requiredSkills": [
      "Node.js",
      "TypeScript",
      "MongoDB"
    ],
    "aiWeights": {
      "skills": 40,
      "experience": 30,
      "education": 15,
      "projects": 10,
      "certifications": 5
    },
    "status": "active"
  }
}
No links
400	
Bad request

No links

GET
/api/jobs
Get all jobs created by the authenticated user


Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'http://localhost:4000/api/jobs' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5Nzg2ODgsImV4cCI6MTc3NzU4MzQ4OH0.WEoJmU0QeF1gyZB-U1N3bDzOxCV67N8MhN3iW0XVRx8'
Request URL
http://localhost:4000/api/jobs
Server response
Code	Details
200	
Response body
Download
[
  {
    "_id": "69ea8c31654eb5b04f324f03",
    "title": "Senior Backend Engineer",
    "company": "Umurava",
    "department": "Engineering",
    "location": "Kigali, Rwanda",
    "salary": 2500000,
    "jobType": "full-time",
    "employmentType": "On-site",
    "experienceLevel": "Mid-Senior",
    "shortlistSize": 10,
    "description": "Build and maintain backend services.",
    "requiredSkills": [
      "Node.js",
      "TypeScript",
      "MongoDB"
    ],
    "idealCandidateProfile": "Strong API and systems experience.",
    "aiWeights": {
      "skills": 40,
      "experience": 30,
      "education": 15,
      "projects": 10,
      "certifications": 5
    },
    "status": "active",
    "createdBy": "69ea8a9d654eb5b04f324efb",
    "createdAt": "2026-04-23T21:16:33.212Z",
    "updatedAt": "2026-04-23T21:16:33.212Z",
    "__v": 0
  }
]
Response headers
 access-control-allow-credentials: true 
 connection: keep-alive 
 content-length: 660 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 21:16:49 GMT 
 etag: W/"294-/dZpCknNvTH9mWRXpo17S32UN3Q" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 85 
 x-ratelimit-reset: 1776979431 
 x-xss-protection: 0 
Responses
Code	Description	Links
200	
List of user's jobs

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
[
  {
    "title": "Senior Backend Engineer",
    "company": "Umurava",
    "department": "Engineering",
    "location": "Kigali, Rwanda",
    "shortlistSize": 10,
    "description": "Build and maintain backend services.",
    "requiredSkills": [
      "Node.js",
      "TypeScript",
      "MongoDB"
    ],
    "aiWeights": {
      "skills": 40,
      "experience": 30,
      "education": 15,
      "projects": 10,
      "certifications": 5
    },
    "status": "active"
  }
]
No links
500	
Server error

No links

GET
/api/jobs/{jobId}
Get a specific job by ID



PATCH
/api/jobs/{jobId}
Update a job



DELETE
/api/jobs/{jobId}
Delete a job


Screenings
AI-powered candidate screening and shortlisting



POST
/api/screenings/run
Run AI screening on candidates for a specific job


Parameters
Cancel
No parameters

Request body

application/json
Edit Value
Schema
{
  "jobId": "67f8a1b2c3d4e5f6g7h8i9j0",
  "candidateIds": [
    "67f8a1b2c3d4e5f6g7h8i9j1",
    "67f8a1b2c3d4e5f6g7h8i9j2"
  ],
  "shortlistSize": 20
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'http://localhost:4000/api/screenings/run' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5Nzg2ODgsImV4cCI6MTc3NzU4MzQ4OH0.WEoJmU0QeF1gyZB-U1N3bDzOxCV67N8MhN3iW0XVRx8' \
  -H 'Content-Type: application/json' \
  -d '{
  "jobId": "67f8a1b2c3d4e5f6g7h8i9j0",
  "candidateIds": [
    "67f8a1b2c3d4e5f6g7h8i9j1",
    "67f8a1b2c3d4e5f6g7h8i9j2"
  ],
  "shortlistSize": 20
}'
Request URL
http://localhost:4000/api/screenings/run
Server response
Code	Details
500	
Error: Internal Server Error

Response body
Download
{
  "message": "Failed to run screening. Please try again.",
  "error": "Cast to ObjectId failed for value \"67f8a1b2c3d4e5f6g7h8i9j0\" (type string) at path \"_id\" for model \"Job\""
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: http://localhost:4000 
 connection: keep-alive 
 content-length: 177 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 21:17:07 GMT 
 etag: W/"b1-wrylCmSaeGrHH4rwHmAtTKW4/S0" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 84 
 x-ratelimit-reset: 1776979431 
 x-xss-protection: 0 
Responses
Code	Description	Links
200	
Screening completed successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "jobId": "66f1a1b2c3d4e5f6a7b8c9d0",
  "totalCandidates": 14,
  "shortlistedCount": 10,
  "averageScore": 83.4,
  "usedFallback": false,
  "summary": "Top candidates were shortlisted based on skill overlap and experience.",
  "results": [
    {
      "candidateId": "66f1a1b2c3d4e5f6a7b8c9e1",
      "rank": 1,
      "score": 92,
      "scoreBreakdown": {
        "skills": 38,
        "experience": 28,
        "education": 12,
        "projects": 9,
        "certifications": 5
      },
      "strengths": [
        "Strong Node.js",
        "Good API design"
      ],
      "gaps": [
        "Limited cloud experience"
      ],
      "reasoning": "High skill match and strong delivery history.",
      "decision": "shortlisted"
    }
  ],
  "incompleteCandidates": [
    {
      "candidateId": "66f1a1b2c3d4e5f6a7b8c9e2",
      "reason": "Missing required personal information or resume fields."
    }
  ]
}
No links
400	
Invalid input data

No links
404	
Job not found

No links
500	
Server error

No links

GET
/api/screenings/jobs/{jobId}/latest
Get the most recent screening for a job



GET
/api/screenings/{screeningId}
Get a specific screening by ID



GET
/api/screenings/{screeningId}/export
Export screening results as JSON


Uploads
File upload endpoints (JSON, CSV, PDF resumes, and Avatars)



POST
/api/uploads/json
Upload candidates from JSON file



POST
/api/uploads/csv
Upload candidates from CSV file



POST
/api/uploads/pdf
Upload resume PDF and parse with Gemini



POST
/api/uploads/avatar
Upload candidate avatar (profile picture)



Schemas
ApiMessage
AuthResponse
AuthProfileUpdateResponse
Settings
DashboardSnapshot
AuthUser
Job
Candidate
ScreeningResult
Screening
UploadJsonResponse
UploadCsvResponse
UploadPdfResponse
UploadAvatarResponse
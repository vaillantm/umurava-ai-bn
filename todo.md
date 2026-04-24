make sure screenign works well POST
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
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5Nzk1NjQsImV4cCI6MTc3NzU4NDM2NH0.YK2rXHp4OAuCkaz37myWloYkT3YKKobByluMZ-T-6C4' \
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
400	
Error: Bad Request

Response body
Download
{
  "message": "Invalid jobId format"
} firs the flow
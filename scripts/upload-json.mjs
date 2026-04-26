import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [,, jobIdArg, fileArg, tokenArg] = process.argv;

if (!jobIdArg || !fileArg) {
  console.error('Usage: node scripts/upload-json.mjs <jobId> <candidate-json-file> [token]');
  process.exit(1);
}

const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
const token = tokenArg || process.env.API_TOKEN;

if (!token) {
  console.error('Missing token. Pass it as the third argument or set API_TOKEN.');
  process.exit(1);
}

const filePath = resolve(fileArg);
const fileContent = await readFile(filePath, 'utf8');
let parsed;

try {
  parsed = JSON.parse(fileContent);
} catch (error) {
  console.error(`Invalid JSON in file: ${filePath}`);
  process.exit(1);
}

const payload = {
  jobId: jobIdArg,
  candidates: Array.isArray(parsed) ? parsed : [parsed],
};

const response = await fetch(`${baseUrl}/api/uploads/json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
});

const text = await response.text();
let output;
try {
  output = JSON.parse(text);
} catch {
  output = text;
}

if (!response.ok) {
  console.error('Upload failed');
  console.error(JSON.stringify(output, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(output, null, 2));

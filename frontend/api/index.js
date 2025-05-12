// frontend/api/index.js
import fs from 'node:fs';
import path from 'node:path';

export default function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Bitrix-Csrf-Token, X-Bitrix-Auth-Token, Placement, Placement_options, Pragma, Cache-Control');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method === 'POST' || request.method === 'GET') {
    const basePath = path.join(process.cwd(), 'frontend'); // /var/task/frontend
    console.log(`Base path for frontend content: ${basePath}`);
    try {
      const filesInFrontendDir = fs.readdirSync(basePath);
      console.log(`Files in ${basePath}:`, filesInFrontendDir);
    } catch (e) {
      console.error(`Error reading directory ${basePath}:`, e);
    }

    const distPath = path.join(basePath, 'dist'); // /var/task/frontend/dist
    console.log(`Path to dist directory: ${distPath}`);
    try {
      const filesInDistDir = fs.readdirSync(distPath);
      console.log(`Files in ${distPath}:`, filesInDistDir);
    } catch (e) {
      console.error(`Error reading directory ${distPath}:`, e);
    }
    
    const filePath = path.join(distPath, 'index.html'); // /var/task/frontend/dist/index.html
    console.log(`Attempting to read: ${filePath}`);

    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.status(200).send(fileContents);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      response.status(500).send('Error loading application content. Check Vercel function logs for path issues (dist check).');
    }
  } else {
    response.status(405).send('Method Not Allowed by Function');
  }
}
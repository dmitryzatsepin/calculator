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
    const currentDir = process.cwd(); // Это /var/task
    // Правильный путь к index.html, учитывая, что /var/task содержит папку 'frontend'
    const filePath = path.join(currentDir, 'frontend', 'dist', 'index.html');
    
    console.log(`Attempting to read: ${filePath}`);

    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.status(200).send(fileContents);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      response.status(500).send('Error loading application content. Check Vercel function logs for path issues.');
    }
  } else {
    response.status(405).send('Method Not Allowed by Function');
  }
}
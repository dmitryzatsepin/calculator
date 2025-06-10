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
    // Если includeFiles сработал, index.html должен быть в CWD (/var/task)
    const filePath = path.join(process.cwd(), '/dist/index.html'); 
    
    console.log(`Attempting to read (with includeFiles): ${filePath}`);
    console.log(`Current CWD: ${process.cwd()}`);
    try {
        const filesInCWD = fs.readdirSync(process.cwd());
        console.log(`Files in CWD (${process.cwd()}):`, filesInCWD);
    } catch(e) { console.error("Error reading CWD:", e); }

    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.status(200).send(fileContents);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      response.status(500).send('Error loading application content. Check Vercel function logs (includeFiles attempt).');
    }
  } else {
    response.status(405).send('Method Not Allowed by Function');
  }
}
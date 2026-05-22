const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Map file extensions to correct MIME types for binary downloads
const MIME_TYPES = {
  '.exe': 'application/octet-stream',
  '.zip': 'application/zip',
  '.deb': 'application/vnd.debian.binary-package',
  '.AppImage': 'application/octet-stream',
  '.dmg': 'application/octet-stream',
};

// Serve binary downloads with correct headers so browsers download instead of trying to open them
app.get('/downloads/:filename', (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const filePath = path.join(__dirname, 'public', 'downloads', filename);

  // Block path traversal attempts
  const safeRoot = path.resolve(__dirname, 'public', 'downloads');
  const safeFile = path.resolve(filePath);
  if (!safeFile.startsWith(safeRoot)) {
    return res.status(403).send('Forbidden');
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const ext = path.extname(filename);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache');

  res.sendFile(filePath);
});

// Serve all other static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[TS-66] Download site running on port ${PORT}`);
});

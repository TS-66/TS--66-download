const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.exe': 'application/octet-stream',
  '.zip': 'application/zip',
  '.deb': 'application/vnd.debian.binary-package',
  '.AppImage': 'application/octet-stream',
  '.dmg': 'application/octet-stream',
};

app.get('/downloads/:filename', (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const filePath = path.join(__dirname, 'downloads', filename);

  const safeRoot = path.resolve(__dirname, 'downloads');
  const safeFile = path.resolve(filePath);
  if (!safeFile.startsWith(safeRoot)) return res.status(403).send('Forbidden');
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');

  const ext = path.extname(filename);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(filePath);
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[TS-66] Download site running on port ${PORT}`);
});

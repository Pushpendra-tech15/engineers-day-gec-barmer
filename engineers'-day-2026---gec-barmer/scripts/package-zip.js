import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function buildZip() {
  const zip = new JSZip();
  const rootDir = process.cwd();

  const includeDirs = ['src', 'public'];
  const includeFiles = [
    'package.json',
    'index.html',
    'vite.config.ts',
    'tsconfig.json',
    '.env.example',
    'metadata.json',
    'README.md'
  ];

  function addDir(dirPath, zipFolder) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules and .git
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
          continue;
        }
        addDir(fullPath, zipFolder.folder(entry.name));
      } else {
        // Don't include the zip file itself if in public
        if (entry.name.endsWith('.zip')) continue;
        const fileData = fs.readFileSync(fullPath);
        zipFolder.file(entry.name, fileData);
      }
    }
  }

  // Add individual files
  for (const file of includeFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      zip.file(file, fs.readFileSync(fullPath));
    }
  }

  // Add directories
  for (const dir of includeDirs) {
    const fullPath = path.join(rootDir, dir);
    if (fs.existsSync(fullPath)) {
      addDir(fullPath, zip.folder(dir));
    }
  }

  const outDir = path.join(rootDir, 'public');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outZipPath = path.join(outDir, 'engineers-day-2026-gec-barmer.zip');
  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(outZipPath, buffer);
  console.log(`Generated zip at: ${outZipPath} (${buffer.length} bytes)`);
}

buildZip().catch(console.error);

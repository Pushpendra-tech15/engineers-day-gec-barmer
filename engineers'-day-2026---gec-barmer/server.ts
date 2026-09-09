import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support base64 payload up to 25MB
  app.use(express.json({ limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ImageKit Secure Upload Proxy API
  app.post('/api/upload-image', async (req, res) => {
    try {
      const { file, fileName, folder } = req.body || {};
      const privateKey =
        process.env.IMAGEKIT_PRIVATE_KEY ||
        process.env.VITE_IMAGEKIT_PRIVATE_KEY ||
        '';

      if (!privateKey) {
        return res.status(400).json({
          success: false,
          error: 'IMAGEKIT_PRIVATE_KEY or VITE_IMAGEKIT_PRIVATE_KEY is missing in .env',
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Missing file data in request body',
        });
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName || `photo_${Date.now()}.jpg`);
      formData.append('folder', folder || '/engineers_day_2026/general');
      formData.append('useUniqueFileName', 'true');

      const ikRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(privateKey + ':').toString('base64'),
        },
        body: formData,
      });

      const data = await ikRes.json();
      if (ikRes.ok && data.url) {
        return res.json({
          success: true,
          url: data.url,
          fileId: data.fileId,
          name: data.name,
          filePath: data.filePath,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: data.message || 'ImageKit upload failed',
        });
      }
    } catch (err: any) {
      console.error('[Server ImageKit Upload Error]:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Server error processing image upload',
      });
    }
  });

  // Vite middleware for development vs static dist for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

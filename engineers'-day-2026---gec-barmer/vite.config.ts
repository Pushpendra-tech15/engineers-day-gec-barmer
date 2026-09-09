import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function imageKitDevPlugin(): Plugin {
  return {
    name: 'imagekit-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/upload-image', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
          return;
        }

        let rawBody = '';
        req.on('data', (chunk) => {
          rawBody += chunk;
        });

        req.on('end', async () => {
          try {
            const { file, fileName, folder } = JSON.parse(rawBody || '{}');
            const privateKey =
              process.env.IMAGEKIT_PRIVATE_KEY ||
              process.env.VITE_IMAGEKIT_PRIVATE_KEY ||
              '';

            if (!privateKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: 'IMAGEKIT_PRIVATE_KEY is missing in .env',
                })
              );
              return;
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
            res.statusCode = ikRes.ok ? 200 : (ikRes.status || 400);
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: ikRes.ok,
                url: data.url,
                fileId: data.fileId,
                name: data.name,
                error: ikRes.ok ? undefined : data.message || 'ImageKit upload failed',
              })
            );
          } catch (err: any) {
            console.error('[Vite ImageKit API Error]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                error: err?.message || 'Server error processing image upload',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), imageKitDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

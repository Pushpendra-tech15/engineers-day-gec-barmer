export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // use as is
      }
    }

    const { file, fileName, folder } = body || {};
    const privateKey =
      process.env.IMAGEKIT_PRIVATE_KEY ||
      process.env.VITE_IMAGEKIT_PRIVATE_KEY ||
      '';

    if (!privateKey) {
      return res.status(400).json({
        success: false,
        error: 'IMAGEKIT_PRIVATE_KEY or VITE_IMAGEKIT_PRIVATE_KEY is missing in Vercel Environment Variables',
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

    const data: any = await ikRes.json();
    if (ikRes.ok && data.url) {
      return res.status(200).json({
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
    console.error('[Vercel API Upload Error]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error processing image upload',
    });
  }
}

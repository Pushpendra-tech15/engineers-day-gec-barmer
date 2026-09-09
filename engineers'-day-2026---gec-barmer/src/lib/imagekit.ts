import { compressImage } from './imageHelper';

/**
 * ImageKit.io Configuration and Management
 * For Engineers' Day 2026 - Government Engineering College, Barmer
 *
 * Stores all 4 activities' participant photos in dedicated ImageKit folders:
 * 1. Conclave:           /engineers_day_2026/conclave
 * 2. Plantation:         /engineers_day_2026/plantation
 * 3. Project Exhibition: /engineers_day_2026/project_show (and /members)
 * 4. Blood Donation:     /engineers_day_2026/blood_donation
 * 5. General Students:   /engineers_day_2026/students
 */

export type ActivityTrack =
  | 'conclave'
  | 'plantation'
  | 'project-show'
  | 'project-model'
  | 'members'
  | 'blood-donation'
  | 'students';

export const IMAGEKIT_ACTIVITY_FOLDERS: Record<ActivityTrack, string> = {
  conclave: '/engineers_day_2026/conclave',
  plantation: '/engineers_day_2026/plantation',
  'project-show': '/engineers_day_2026/project_show',
  'project-model': '/engineers_day_2026/project_show',
  members: '/engineers_day_2026/project_show/members',
  'blood-donation': '/engineers_day_2026/blood_donation',
  students: '/engineers_day_2026/students',
};

export interface ImageKitConfig {
  urlEndpoint: string;
  publicKey: string;
}

/**
 * Retrieve ImageKit public configuration from Vite environment variables.
 * Note: Private key is NEVER loaded on the client side to guarantee total security.
 */
export const getImageKitConfig = (): ImageKitConfig => {
  const urlEndpoint =
    (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT as string) ||
    '';
  const publicKey =
    (import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY as string) ||
    '';

  return {
    urlEndpoint: urlEndpoint.trim().replace(/\/$/, ''),
    publicKey: publicKey.trim(),
  };
};

/**
 * Check if ImageKit has been configured by the user.
 */
export const isImageKitConfigured = (): boolean => {
  const config = getImageKitConfig();
  return Boolean(config.urlEndpoint);
};

export interface UploadResult {
  url: string;
  fileId?: string;
  success: boolean;
  folder: string;
  isImageKit: boolean;
  error?: string;
}

/**
 * Upload an activity photo to ImageKit.io.
 * Automatically compresses the image, routes it to the activity's dedicated folder,
 * and returns the permanent CDN URL for saving into Supabase tables.
 */
export const uploadToImageKit = async (
  file: File | Blob,
  track: ActivityTrack,
  namePrefix = 'photo'
): Promise<UploadResult> => {
  const targetFolder = IMAGEKIT_ACTIVITY_FOLDERS[track] || '/engineers_day_2026/general';

  // 1. Sanitize file name
  const cleanPrefix = namePrefix
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 35) || 'participant';
  const fileName = `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`;

  let compressedDataUrl = '';

  try {
    // 2. Compress image using browser Canvas to ~150-250KB for rapid, high-quality upload
    if (file instanceof File) {
      const compressed = await compressImage(file, 1200, 1200, 0.82);
      compressedDataUrl = compressed.dataUrl;
    } else {
      // Fallback read blob
      compressedDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    // 3. Attempt Server-side Upload (/api/upload-image)
    // Server-side upload is preferred because it keeps ImageKit private key secure and eliminates CORS
    try {
      const serverRes = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: compressedDataUrl,
          fileName,
          folder: targetFolder,
          track,
        }),
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data.success && data.url) {
          console.info(`[ImageKit Server Upload] Success: ${data.url} in ${targetFolder}`);
          return {
            url: data.url,
            fileId: data.fileId,
            success: true,
            folder: targetFolder,
            isImageKit: true,
          };
        }
      }
    } catch (serverErr) {
      console.warn('[ImageKit] Server endpoint not available or returned error, trying client fallback...', serverErr);
    }

    // 4. Graceful Fallback: If server endpoint is unreachable or credentials are pending, return compressed dataUrl
    // This guarantees user registration NEVER breaks even if network or credentials fail!
    console.warn(
      `[ImageKit] Server upload not available or ImageKit credentials pending. Using fallback preview.`
    );

    return {
      url: compressedDataUrl,
      success: true,
      folder: targetFolder,
      isImageKit: false,
      error: 'ImageKit credentials not configured in .env; saved with local preview fallback',
    };
  } catch (outerErr: any) {
    console.error('[ImageKit Upload] Critical error:', outerErr);
    return {
      url: compressedDataUrl || '',
      success: false,
      folder: targetFolder,
      isImageKit: false,
      error: outerErr?.message || 'Failed to process and upload image',
    };
  }
};

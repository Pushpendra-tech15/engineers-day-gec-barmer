import { uploadToImageKit, ActivityTrack } from './imagekit';

/**
 * Compresses an image file using browser Canvas API to keep upload sizes
 * lightweight (~100KB-300KB) and preserve aspect ratio.
 */
export const compressImage = (
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82
): Promise<{ file: File; dataUrl: string }> => {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ file, dataUrl: e.target?.result as string });
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({ file, dataUrl });
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], cleanName, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve({ file: compressedFile, dataUrl });
          },
          mimeType,
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an activity photo (Conclave, Plantation, Blood Donation, Project Leader/Member)
 * to ImageKit.io in its dedicated activity folder.
 * Returns the ImageKit public CDN URL to be saved into Supabase tables.
 */
export const uploadActivityPhoto = async (
  file: File,
  folder: 'conclave' | 'plantation' | 'blood-donation' | 'project-show' | 'members',
  namePrefix: string
): Promise<{ url: string; isCloud: boolean; error?: string }> => {
  try {
    const res = await uploadToImageKit(file, folder as ActivityTrack, namePrefix);
    return {
      url: res.url,
      isCloud: res.isImageKit,
      error: res.error,
    };
  } catch (err: any) {
    console.warn('Error during ImageKit activity photo upload:', err);
    return { url: '', isCloud: false, error: err?.message || 'Photo upload error' };
  }
};

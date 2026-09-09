import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, UploadCloud, CheckCircle2 } from 'lucide-react';

interface PhotoUploadFieldProps {
  id?: string;
  label: string;
  description?: string;
  photoPreview: string | null;
  onPhotoSelected: (file: File) => void;
  onPhotoCleared: () => void;
  required?: boolean;
  accentColor?: 'blue' | 'emerald' | 'indigo' | 'rose' | 'amber';
  isCompact?: boolean;
  maxSizeMB?: number;
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  id,
  label,
  description = 'Upload a clear passport photo or selfie (JPG, PNG, max 1 MB)',
  photoPreview,
  onPhotoSelected,
  onPhotoCleared,
  required = false,
  accentColor = 'blue',
  isCompact = false,
  maxSizeMB = 1,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const allColorStyles = {
    blue: {
      border: 'border-blue-300 hover:border-blue-500 bg-blue-50/40',
      badge: 'bg-blue-100 text-blue-800',
      icon: 'text-blue-600',
      button: 'text-blue-700 hover:bg-blue-50',
    },
    emerald: {
      border: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/40',
      badge: 'bg-emerald-100 text-emerald-800',
      icon: 'text-emerald-600',
      button: 'text-emerald-700 hover:bg-emerald-50',
    },
    indigo: {
      border: 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/40',
      badge: 'bg-indigo-100 text-indigo-800',
      icon: 'text-indigo-600',
      button: 'text-indigo-700 hover:bg-indigo-50',
    },
    rose: {
      border: 'border-rose-300 hover:border-rose-500 bg-rose-50/40',
      badge: 'bg-rose-100 text-rose-800',
      icon: 'text-rose-600',
      button: 'text-rose-700 hover:bg-rose-50',
    },
    amber: {
      border: 'border-amber-300 hover:border-amber-500 bg-amber-50/40',
      badge: 'bg-amber-100 text-amber-800',
      icon: 'text-amber-600',
      button: 'text-amber-700 hover:bg-amber-50',
    },
  };

  const colorStyles = allColorStyles[accentColor] || allColorStyles.blue;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`Image file exceeds ${maxSizeMB} MB. Please select a photo under ${maxSizeMB} MB.`);
      return;
    }

    setLocalError(null);
    onPhotoSelected(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalError(null);
    onPhotoCleared();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Camera className={`w-3.5 h-3.5 ${colorStyles.icon}`} />
          <span>{label}</span>
          {required ? (
            <span className="text-rose-500 font-bold">*</span>
          ) : (
            <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
          )}
        </label>
        {photoPreview && (
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Photo Attached</span>
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        id={id}
        onChange={handleFileChange}
        className="hidden"
      />

      {photoPreview ? (
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <img
            src={photoPreview}
            alt={label}
            className="w-14 h-14 object-cover rounded-lg border border-slate-300 shadow-2xs shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{label} ready</p>
            <p className="text-[11px] text-slate-500">Image attached for verification</p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`text-[11px] font-bold ${colorStyles.button} px-2 py-0.5 rounded cursor-pointer transition-colors`}
              >
                Change Photo
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl cursor-pointer transition-all ${colorStyles.border} ${
            isCompact ? 'p-2 flex items-center justify-center gap-2' : 'p-3.5 sm:p-4 text-center'
          }`}
        >
          {isCompact ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 py-1">
              <UploadCloud className={`w-4 h-4 ${colorStyles.icon}`} />
              <span>Upload photo for {label} (max 1 MB)</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center">
                <UploadCloud className={`w-4 h-4 ${colorStyles.icon}`} />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Click or tap to upload {label.toLowerCase()}
              </p>
              <p className="text-[10px] text-slate-500">{description}</p>
            </div>
          )}
        </div>
      )}

      {localError && (
        <p className="text-[11px] text-rose-600 font-medium">{localError}</p>
      )}
    </div>
  );
};

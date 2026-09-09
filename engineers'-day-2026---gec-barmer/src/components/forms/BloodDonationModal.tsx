import React, { useState } from 'react';
import {
  X,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  Phone,
  Droplets,
  Calendar,
} from 'lucide-react';
import { submitBloodDonationRegistration } from '../../lib/supabase';
import { BRANCH_OPTIONS, SEMESTER_OPTIONS } from '../../data/eventData';
import { BloodGroup } from '../../types';
import { PhotoUploadField } from './PhotoUploadField';
import { uploadActivityPhoto } from '../../lib/imageHelper';

interface BloodDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  "Don't Know",
];

export const BloodDonationModal: React.FC<BloodDonationModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [age, setAge] = useState<string>('20');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFullName('');
    setMobileNumber('');
    setBranch('');
    setSemester('');
    setGender('');
    setAge('20');
    setBloodGroup('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrorMessage(null);
    setIsSuccess(false);
    setRegistrationId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    if (!branch.trim()) {
      setErrorMessage('Please select your branch / department.');
      return;
    }

    if (!semester.trim()) {
      setErrorMessage('Please select your semester.');
      return;
    }

    if (!gender) {
      setErrorMessage('Please select your gender.');
      return;
    }

    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 17 || numAge > 65) {
      setErrorMessage('Eligible donor age is between 18 and 65 years.');
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedPhotoUrl = '';
      if (photoFile) {
        const uploadRes = await uploadActivityPhoto(photoFile, 'blood-donation', fullName.trim());
        if (uploadRes.url) {
          uploadedPhotoUrl = uploadRes.url;
        }
      }

      const res = await submitBloodDonationRegistration({
        fullName: fullName.trim(),
        mobileNumber: cleanMobile,
        branch: branch.trim(),
        semester: semester.trim(),
        gender,
        age: numAge,
        bloodGroup: bloodGroup || undefined,
        photoUrl: uploadedPhotoUrl,
      });

      if (res.success) {
        setIsSuccess(true);
        setRegistrationId(res.id || `BLOD-${Date.now().toString().slice(-6)}`);
      } else {
        setErrorMessage(res.error || 'Failed to submit registration. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200/90 relative max-h-[85vh] sm:max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 to-red-800 text-white px-4 py-3 sm:px-5 sm:py-3.5 relative shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 pr-8">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-400/30 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-rose-300 uppercase tracking-wider block leading-tight">
                Engineers' Day 2026 • Registration
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                Blood Donation Camp Registration
              </h3>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {isSuccess ? (
            /* Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">
                  Donor Registration Successful!
                </h4>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  Thank you, <strong>{fullName}</strong>! You are registered as a life-saver for the Blood Donation Camp.
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
                {photoPreview && (
                  <div className="flex items-center gap-3 pb-2.5 mb-1 border-b border-rose-200/60">
                    <img
                      src={photoPreview}
                      alt="Donor"
                      className="w-14 h-14 rounded-full object-cover border-2 border-rose-500 shadow-sm"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Donor Photo</span>
                      <span className="font-bold text-slate-800 text-sm">{fullName}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-rose-200/60">
                  <span className="text-slate-500 font-medium">Donor Name:</span>
                  <span className="font-bold text-slate-900">{fullName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-rose-200/60">
                  <span className="text-slate-500 font-medium">Mobile Number:</span>
                  <span className="font-bold text-slate-900">+91 {mobileNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-rose-200/60">
                  <span className="text-slate-500 font-medium">Branch & Semester:</span>
                  <span className="font-bold text-slate-900">{branch} ({semester})</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-rose-200/60">
                  <span className="text-slate-500 font-medium">Age & Gender:</span>
                  <span className="font-bold text-slate-900">{age} Yrs • {gender}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-rose-200/60">
                  <span className="text-slate-500 font-medium">Blood Group:</span>
                  <span className="font-bold text-rose-700">{bloodGroup || 'Will be tested at camp'}</span>
                </div>
                {registrationId && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 font-medium">Donor Ref ID:</span>
                    <span className="font-mono font-bold text-rose-800">{registrationId.slice(0, 18)}...</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500">
                🏥 Camp Location: Health Center & Seminar Hall • 10:00 AM to 3:00 PM. Includes Free Medical Checkup, Refreshment, and Govt. Recognized Donor Certificate.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your complete name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Mobile Number (WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number (e.g. 9876543210)"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Branch & Semester Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Branch / Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium text-slate-900 bg-white"
                  >
                    <option value="">-- Select Branch --</option>
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Semester <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium text-slate-900 bg-white"
                  >
                    <option value="">-- Select Semester --</option>
                    {SEMESTER_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender & Age Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium text-slate-900 bg-white"
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Age (Years) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min={17}
                      max={65}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Blood Group */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Blood Group <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium text-slate-900 bg-white"
                  >
                    <option value="">-- Select Blood Group (if known) --</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Don't worry if you don't know your blood group. Our medical team will test and verify it free of cost!
                </p>
              </div>

              {/* Donor Photo Upload */}
              <PhotoUploadField
                id="blood-donation-photo-upload"
                isCompact={true}
                label="Donor Photo / Selfie"
                description="Upload a photo or selfie (max 5 MB)"
                photoPreview={photoPreview}
                onPhotoSelected={(f) => {
                  setPhotoFile(f);
                  const previewUrl = URL.createObjectURL(f);
                  setPhotoPreview(previewUrl);
                }}
                onPhotoCleared={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                accentColor="rose"
              />

              {/* Submit Button */}
              <div className="pt-1 flex items-center gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="w-4 h-4 text-rose-200" />
                      <span>Confirm Blood Donation Registration</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

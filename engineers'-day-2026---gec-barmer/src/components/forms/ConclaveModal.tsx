import React, { useState } from 'react';
import {
  X,
  MessageSquareShare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  Phone,
  GraduationCap,
  Briefcase,
  Building2,
  Award,
  Crown,
} from 'lucide-react';
import { submitConclaveRegistration } from '../../lib/supabase';
import { BRANCH_OPTIONS, SEMESTER_OPTIONS } from '../../data/eventData';
import { PhotoUploadField } from './PhotoUploadField';
import { uploadActivityPhoto } from '../../lib/imageHelper';
import { ConclaveAttendeeType, ConclaveGuestCategory } from '../../types';

interface ConclaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GUEST_CATEGORIES: ConclaveGuestCategory[] = [
  'Chief Guest',
  'Guest Speaker',
  'Industry Expert',
  'Corporate Delegate',
  'Special Guest',
];

export const ConclaveModal: React.FC<ConclaveModalProps> = ({ isOpen, onClose }) => {
  const [attendeeType, setAttendeeType] = useState<ConclaveAttendeeType>('student');

  // Common fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Student fields
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [guestQuestion, setGuestQuestion] = useState('');

  // Guest fields
  const [designation, setDesignation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [guestCategory, setGuestCategory] = useState<ConclaveGuestCategory>('Guest Speaker');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setAttendeeType('student');
    setFullName('');
    setMobileNumber('');
    setBranch('');
    setSemester('');
    setGuestQuestion('');
    setDesignation('');
    setCompanyName('');
    setGuestCategory('Guest Speaker');
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

    // Common validations
    if (!fullName.trim()) {
      setErrorMessage(
        attendeeType === 'student'
          ? 'Please enter your full name.'
          : 'Please enter the guest / speaker name.'
      );
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    // Role-specific validations
    if (attendeeType === 'student') {
      if (!branch.trim()) {
        setErrorMessage('Please select your branch / department.');
        return;
      }
      if (!semester.trim()) {
        setErrorMessage('Please select your semester.');
        return;
      }
      if (!guestQuestion.trim()) {
        setErrorMessage('Please write your question for the guest speaker.');
        return;
      }
    } else {
      // Guest validations
      if (!designation.trim()) {
        setErrorMessage('Please enter the designation / title of the guest.');
        return;
      }
      if (!companyName.trim()) {
        setErrorMessage('Please enter the company / institution / organization name.');
        return;
      }
      if (!guestCategory) {
        setErrorMessage('Please select the guest category.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let uploadedPhotoUrl = '';
      if (photoFile) {
        const uploadRes = await uploadActivityPhoto(
          photoFile,
          'conclave',
          `${attendeeType}_${fullName.trim()}`
        );
        if (uploadRes.url) {
          uploadedPhotoUrl = uploadRes.url;
        }
      }

      const res = await submitConclaveRegistration({
        attendeeType,
        fullName: fullName.trim(),
        mobileNumber: cleanMobile,
        photoUrl: uploadedPhotoUrl,
        branch: attendeeType === 'student' ? branch.trim() : undefined,
        semester: attendeeType === 'student' ? semester.trim() : undefined,
        guestQuestion: attendeeType === 'student' ? guestQuestion.trim() : undefined,
        designation: attendeeType === 'guest' ? designation.trim() : undefined,
        companyName: attendeeType === 'guest' ? companyName.trim() : undefined,
        guestCategory: attendeeType === 'guest' ? guestCategory : undefined,
      });

      if (res.success) {
        setIsSuccess(true);
        setRegistrationId(
          res.id ||
            `${attendeeType === 'guest' ? 'GST' : 'CNCL'}-${Date.now().toString().slice(-6)}`
        );
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
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 relative shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 pr-8">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0">
              <MessageSquareShare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider block leading-tight">
                Engineers' Day 2026 • Registration
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                Technical Conclave Registration
              </h3>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {isSuccess ? (
            /* Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 bg-blue-100 text-blue-800">
                  {attendeeType === 'guest' ? `🌟 ${guestCategory} Registration` : '🎓 Student Participant'}
                </span>
                <h4 className="text-2xl font-black text-slate-900">
                  Registration Confirmed!
                </h4>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  {attendeeType === 'guest'
                    ? `Hon'ble ${fullName} has been registered as ${guestCategory} for the Technical Conclave.`
                    : `Your registration has been submitted successfully for the Technical Conclave.`}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
                {photoPreview && (
                  <div className="flex items-center gap-3 pb-2.5 mb-1 border-b border-blue-200/60">
                    <img
                      src={photoPreview}
                      alt={fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                        {attendeeType === 'guest' ? 'Guest Official Photo' : 'Participant Photo'}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">{fullName}</span>
                      {attendeeType === 'guest' && (
                        <p className="text-[11px] text-slate-600">{designation} • {companyName}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-blue-200/60">
                  <span className="text-slate-500 font-medium">Name:</span>
                  <span className="font-bold text-slate-900">{fullName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-blue-200/60">
                  <span className="text-slate-500 font-medium">Mobile Number:</span>
                  <span className="font-bold text-slate-900">+91 {mobileNumber}</span>
                </div>
                {attendeeType === 'guest' ? (
                  <>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200/60">
                      <span className="text-slate-500 font-medium">Category:</span>
                      <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                        {guestCategory}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200/60">
                      <span className="text-slate-500 font-medium">Designation:</span>
                      <span className="font-bold text-slate-900">{designation}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200/60">
                      <span className="text-slate-500 font-medium">Company / Org:</span>
                      <span className="font-bold text-slate-900">{companyName}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center pb-2 border-b border-blue-200/60">
                    <span className="text-slate-500 font-medium">Branch & Semester:</span>
                    <span className="font-bold text-slate-900">{branch} ({semester})</span>
                  </div>
                )}
                {registrationId && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 font-medium">Ref / Record ID:</span>
                    <span className="font-mono font-bold text-blue-700">{registrationId.slice(0, 18)}...</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500">
                📅 Date: 15 Sept 2026 • 🏛️ Venue: Main Auditorium, GEC Barmer
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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

              {/* Attendee Type Switcher (Student vs Guest) */}
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setAttendeeType('student');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    attendeeType === 'student'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Participant</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAttendeeType('guest');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    attendeeType === 'guest'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>Distinguished Guest / Speaker</span>
                </button>
              </div>

              {/* Guest Category Selector (Only for Guest) */}
              {attendeeType === 'guest' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Guest Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={guestCategory}
                      onChange={(e) => setGuestCategory(e.target.value as ConclaveGuestCategory)}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 outline-none transition-all font-bold text-slate-900 bg-amber-50/50"
                    >
                      {GUEST_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  {attendeeType === 'guest' ? 'Guest Full Name' : 'Full Name'} <span className="text-rose-500">*</span>
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
                    placeholder={
                      attendeeType === 'guest'
                        ? 'e.g. Dr. Rajesh Sharma / Er. Priya Verma'
                        : 'Enter your complete name'
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900"
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
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Guest Specific Fields: Designation & Company Name */}
              {attendeeType === 'guest' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Designation / Position <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. VP Engineering / Scientist"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Company / Organization <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. TCS / L&T / ISRO / PSU"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Student Specific Fields: Branch & Semester Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Branch / Department <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900 bg-white"
                      >
                        <option value="">-- Select Branch --</option>
                        {BRANCH_OPTIONS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Semester <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900 bg-white"
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
                </div>
              )}

              {/* Photo Upload */}
              <PhotoUploadField
                id="conclave-photo-upload"
                isCompact={true}
                label={
                  attendeeType === 'guest'
                    ? 'Guest Official Photo / Portrait'
                    : 'Participant Photo / Selfie'
                }
                description={
                  attendeeType === 'guest'
                    ? 'Upload photo for event credentials (max 1 MB)'
                    : 'Upload selfie/photo for registration (max 1 MB)'
                }
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
                accentColor={attendeeType === 'guest' ? 'amber' : 'blue'}
              />

              {/* Question for Guest Speaker (Student Only) */}
              {attendeeType === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Any Question for Guest Speaker <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      rows={2}
                      value={guestQuestion}
                      onChange={(e) => setGuestQuestion(e.target.value)}
                      placeholder="Write a technical question or topic for the speaker..."
                      className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                    Selected questions will be answered live during the Q&A session.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-1 flex items-center gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 px-4 rounded-xl active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    attendeeType === 'guest'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-700 hover:bg-blue-800'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>
                        {attendeeType === 'guest'
                          ? 'Confirm Guest Registration'
                          : 'Confirm Conclave Registration'}
                      </span>
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

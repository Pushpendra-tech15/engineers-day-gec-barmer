import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Sparkles, 
  Printer, 
  Download, 
  X,
  FileCheck,
  Upload,
  Camera,
  Trash2,
  Image as ImageIcon,
  Database,
  Cloud,
  Check
} from 'lucide-react';
import { BRANCH_LIST, SEMESTER_LIST, GENDER_LIST } from '../data/eventData';
import { RegistrationFormData, RegistrationSubmission } from '../types';
import { saveRegistrationToSupabase, isSupabaseConfigured } from '../lib/supabase';
import { SupabaseGuideModal } from './SupabaseGuideModal';

interface RegistrationFormProps {
  preselectedActivity?: 'Conclave' | 'Plantation' | 'Project Exhibition' | 'Project Show' | 'Blood Donation' | '';
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ preselectedActivity }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    mobile: '',
    branch: '',
    semester: '',
    gender: '',
    interestedActivity: '',
    photo: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<RegistrationSubmission | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{ synced: boolean; error?: string } | null>(null);
  const [showSupabaseGuide, setShowSupabaseGuide] = useState(false);

  const isCloudDbActive = isSupabaseConfigured();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preselected activity from parent/card clicks
  useEffect(() => {
    if (preselectedActivity) {
      setFormData((prev) => ({
        ...prev,
        interestedActivity: preselectedActivity,
      }));
    }
  }, [preselectedActivity]);

  const handlePhotoFile = (file: File) => {
    setPhotoError(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    // Validate size (max 1 MB = 1048576 bytes)
    const MAX_SIZE_BYTES = 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setPhotoError(
        `Photo size is ${sizeMb} MB. Maximum allowed size is 1 MB (अधिकतम 1 MB साइज़ अनुमति है). Please select a smaller photo.`
      );
      return;
    }

    // Keep raw file for Supabase Storage upload
    setSelectedPhotoFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        photo: result,
      }));
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      photo: '',
    }));
    setSelectedPhotoFile(null);
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {};

    // Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email ID is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com)';
    }

    // Mobile Number validation (Indian 10-digit mobile)
    const mobileDigits = formData.mobile.replace(/\D/g, '');
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (mobileDigits.length !== 10) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    // Branch / Department
    if (!formData.branch) {
      newErrors.branch = 'Please select your Branch / Department';
    }

    // Semester
    if (!formData.semester) {
      newErrors.semester = 'Please select your Semester';
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = 'Please select your Gender';
    }

    // Interested Activity (must be one of the 4 only!)
    if (!formData.interestedActivity) {
      newErrors.interestedActivity = 'Please select an Interested Activity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegistrationFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Smooth scroll to top of form to see errors
      const formEl = document.getElementById('registration-form-element');
      formEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    const regId = `GECB-ED26-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSubmission: RegistrationSubmission = {
      ...formData,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      registrationNumber: regId,
      registeredAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    // 1. Always save to localStorage for offline access / instant backup
    try {
      const existing = JSON.parse(localStorage.getItem('gecb_ed2026_registrations') || '[]');
      existing.push(newSubmission);
      localStorage.setItem('gecb_ed2026_registrations', JSON.stringify(existing));
    } catch (err) {
      console.error('Storage error', err);
    }

    // 2. Save directly to Supabase cloud database if configured (uploading photo to Supabase storage)
    const cloudRes = await saveRegistrationToSupabase(newSubmission, selectedPhotoFile);
    if (cloudRes.photoUrl) {
      newSubmission.photo = cloudRes.photoUrl;
    }
    setCloudSyncStatus({
      synced: cloudRes.inCloud,
      error: cloudRes.error,
    });

    setIsSubmitting(false);
    setSubmissionSuccess(newSubmission);

    // Reset form
    setFormData({
      fullName: '',
      email: '',
      mobile: '',
      branch: '',
      semester: '',
      gender: '',
      interestedActivity: '',
      photo: '',
      message: '',
    });
    setSelectedPhotoFile(null);
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors({});
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="registration" className="py-16 sm:py-24 bg-blue-50/40 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
            <span>Official Portal • GEC Barmer</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Student Registration Form
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Register for Engineers' Day 2026. Entry is completely free for all eligible engineering students of Government Engineering College, Barmer.
          </p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-md">
          
          <div className="pb-6 mb-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Participant Information
            </h3>
            <p className="text-xs text-slate-500">
              All fields marked with <span className="text-red-500 font-bold">*</span> are required.
            </p>
          </div>

          <form id="registration-form-element" onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* Row 1: Full Name & Email ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.fullName
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100 bg-white'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Email ID (Replacing old Enrollment Number!) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  Email ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100 bg-white'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Mobile Number & Branch / Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mobile Number */}
              <div>
                <label
                  htmlFor="mobile"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.mobile
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100 bg-white'
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.mobile}</span>
                  </p>
                )}
              </div>

              {/* Branch / Department */}
              <div>
                <label
                  htmlFor="branch"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  Branch / Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all bg-white ${
                    errors.branch
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                  }`}
                >
                  <option value="">-- Select Engineering Branch --</option>
                  {BRANCH_LIST.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {errors.branch && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.branch}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Semester & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Semester */}
              <div>
                <label
                  htmlFor="semester"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all bg-white ${
                    errors.semester
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                  }`}
                >
                  <option value="">-- Select Semester --</option>
                  {SEMESTER_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.semester}</span>
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all bg-white ${
                    errors.gender
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                  }`}
                >
                  <option value="">-- Select Gender --</option>
                  {GENDER_LIST.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.gender}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Interested Activity (EXACTLY & ONLY the 4 activities!) */}
            <div>
              <label
                htmlFor="interestedActivity"
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                Interested Activity <span className="text-red-500">*</span>
              </label>
              <select
                id="interestedActivity"
                name="interestedActivity"
                value={formData.interestedActivity}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all bg-white ${
                  errors.interestedActivity
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              >
                <option value="">-- Select Activity Track --</option>
                <option value="Conclave">1. Conclave (Technical & Visionary Symposium)</option>
                <option value="Plantation">2. Plantation (Eco-Campus Tree Planting Drive)</option>
                <option value="Project Exhibition">3. Project Exhibition (Student Innovation & Model Expo)</option>
                <option value="Blood Donation">4. Blood Donation (Voluntary Red Cross Camp)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Choose the primary track you wish to attend or compete in.
              </p>
              {errors.interestedActivity && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.interestedActivity}</span>
                </p>
              )}
            </div>

            {/* Row 5: Student Passport / ID Photo Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Upload Student Photo / Passport Photo <span className="text-slate-400 font-normal">(Optional for Event Pass & ID)</span>
              </label>

              {formData.photo ? (
                <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <img
                    src={formData.photo}
                    alt="Student Preview"
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg border-2 border-blue-200 shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Photo Attached Successfully</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      This photo will appear on your official Engineers' Day entry pass.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/60'
                      : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/80 bg-slate-50/40'
                  }`}
                  id="student-photo-upload-dropzone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    id="student-photo-file-input"
                  />
                  <div className="w-11 h-11 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-2 shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Click to browse or drag and drop your photo here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports JPG, PNG or WEBP (Passport size recommended, max 1 MB • अधिकतम 1 MB)
                  </p>
                </div>
              )}

              {photoError && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{photoError}</span>
                </p>
              )}
            </div>

            {/* Row 6: Additional Message or Suggestions (Optional) */}
            <div>
              <label
                htmlFor="message"
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                Additional Message or Suggestions <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                placeholder="Share any project details, team member names, blood group, or specific requirements..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                id="submit-registration-form-btn"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-blue-800 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Registration...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SUBMIT REGISTRATION FOR ENGINEERS' DAY 2026</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              By registering, you confirm participation under the rules of Government Engineering College, Barmer.
            </p>

          </form>
        </div>

      </div>

      {/* Registration Confirmation Receipt Modal */}
      {submissionSuccess && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          id="registration-success-modal"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setSubmissionSuccess(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Registration Confirmed!
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Engineers' Day 2026 Pass
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Government Engineering College, Barmer
              </p>

              {/* Cloud Sync Status Badge */}
              <div className="mt-2.5 flex flex-col items-center gap-1.5">
                {cloudSyncStatus?.synced ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved to Supabase Cloud Database ✓</span>
                  </span>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 w-full max-w-sm">
                    <button
                      type="button"
                      onClick={() => setShowSupabaseGuide(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-amber-600" />
                      <span>Saved Locally • Click to diagnose Supabase sync</span>
                    </button>
                    {cloudSyncStatus?.error && (
                      <p className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 text-center leading-relaxed font-medium">
                        ⚠️ {cloudSyncStatus.error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pass Card Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-xs sm:text-sm space-y-3">
              {/* Photo & Pass Header */}
              <div className="flex items-center gap-4 pb-3 border-b border-slate-200">
                {submissionSuccess.photo ? (
                  <img
                    src={submissionSuccess.photo}
                    alt={submissionSuccess.fullName}
                    className="w-16 h-20 sm:w-18 sm:h-22 object-cover rounded-lg border-2 border-blue-300 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-16 h-20 rounded-lg bg-slate-200 text-slate-400 flex flex-col items-center justify-center border border-slate-300 shrink-0 text-[10px] text-center p-1">
                    <User className="w-6 h-6 text-slate-400 mb-1" />
                    <span>No Photo</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-500 font-medium">Official Participant Pass</div>
                  <div className="font-extrabold text-slate-900 text-base sm:text-lg truncate">
                    {submissionSuccess.fullName}
                  </div>
                  <div className="font-mono font-bold text-blue-700 text-xs sm:text-sm mt-0.5">
                    {submissionSuccess.registrationNumber}
                  </div>
                  <div className="inline-block mt-1 text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                    Track: {submissionSuccess.interestedActivity}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Email ID:</span>
                <span className="font-semibold text-slate-800">{submissionSuccess.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Mobile:</span>
                <span className="font-semibold text-slate-800">{submissionSuccess.mobile}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Department:</span>
                <span className="font-semibold text-slate-800">{submissionSuccess.branch}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Semester / Gender:</span>
                <span className="font-semibold text-slate-800">
                  {submissionSuccess.semester} ({submissionSuccess.gender})
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Registered Track:</span>
                <span className="font-extrabold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md">
                  {submissionSuccess.interestedActivity}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Date of Event:</span>
                <span>September 15, 2026 (09:00 AM)</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handlePrint}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Pass</span>
              </button>

              <button
                onClick={() => setSubmissionSuccess(null)}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Connection Setup Guide Modal */}
      <SupabaseGuideModal
        isOpen={showSupabaseGuide}
        onClose={() => setShowSupabaseGuide(false)}
      />
    </section>
  );
};

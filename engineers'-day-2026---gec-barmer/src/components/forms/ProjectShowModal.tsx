import React, { useState, useRef } from 'react';
import {
  X,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  Phone,
  UploadCloud,
  FileText,
  Users,
  Image as ImageIcon,
  Trash2,
  Layers,
} from 'lucide-react';
import { submitProjectShowRegistration } from '../../lib/supabase';
import { BRANCH_OPTIONS } from '../../data/eventData';
import { ProjectCategory, TeamMember } from '../../types';
import { PhotoUploadField } from './PhotoUploadField';
import { uploadActivityPhoto } from '../../lib/imageHelper';

interface ProjectShowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: ProjectCategory[] = [
  'Software',
  'Hardware',
  'AI/ML',
  'IoT',
  'Civil/Mechanical Model',
  'Other',
];

export const ProjectShowModal: React.FC<ProjectShowModalProps> = ({ isOpen, onClose }) => {
  // Project Info
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState<ProjectCategory>('Software');
  const [projectDescription, setProjectDescription] = useState('');

  // Team Leader
  const [teamLeaderName, setTeamLeaderName] = useState('');
  const [teamLeaderMobile, setTeamLeaderMobile] = useState('');
  const [branch, setBranch] = useState('');
  const [leaderPhotoFile, setLeaderPhotoFile] = useState<File | null>(null);
  const [leaderPhotoPreview, setLeaderPhotoPreview] = useState<string | null>(null);

  // Team Members (1 leader + up to 4 additional members = 5 total max)
  const [additionalMemberCount, setAdditionalMemberCount] = useState<number>(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [memberPhotoFiles, setMemberPhotoFiles] = useState<(File | null)[]>([]);
  const [memberPhotoPreviews, setMemberPhotoPreviews] = useState<(string | null)[]>([]);

  // Project Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setProjectTitle('');
    setProjectCategory('Software');
    setProjectDescription('');
    setTeamLeaderName('');
    setTeamLeaderMobile('');
    setBranch('');
    setLeaderPhotoFile(null);
    setLeaderPhotoPreview(null);
    setAdditionalMemberCount(0);
    setTeamMembers([]);
    setMemberPhotoFiles([]);
    setMemberPhotoPreviews([]);
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

  // Adjust team members array when count selector changes
  const handleMemberCountChange = (count: number) => {
    setAdditionalMemberCount(count);
    const newMembers: TeamMember[] = [];
    const newPhotoFiles: (File | null)[] = [];
    const newPhotoPreviews: (string | null)[] = [];

    for (let i = 0; i < count; i++) {
      newMembers.push(teamMembers[i] || { name: '', mobile: '' });
      newPhotoFiles.push(memberPhotoFiles[i] || null);
      newPhotoPreviews.push(memberPhotoPreviews[i] || null);
    }
    setTeamMembers(newMembers);
    setMemberPhotoFiles(newPhotoFiles);
    setMemberPhotoPreviews(newPhotoPreviews);
  };

  const updateTeamMember = (index: number, field: 'name' | 'mobile', value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const updateMemberPhoto = (index: number, file: File) => {
    const updatedFiles = [...memberPhotoFiles];
    updatedFiles[index] = file;
    setMemberPhotoFiles(updatedFiles);

    const updatedPreviews = [...memberPhotoPreviews];
    updatedPreviews[index] = URL.createObjectURL(file);
    setMemberPhotoPreviews(updatedPreviews);
  };

  const removeMemberPhoto = (index: number) => {
    const updatedFiles = [...memberPhotoFiles];
    updatedFiles[index] = null;
    setMemberPhotoFiles(updatedFiles);

    const updatedPreviews = [...memberPhotoPreviews];
    updatedPreviews[index] = null;
    setMemberPhotoPreviews(updatedPreviews);
  };

  // Handle Photo File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Invalid image format. Only JPG, PNG, and WEBP are supported.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Photo size exceeds 5 MB. Please select a smaller image.');
      return;
    }

    setErrorMessage(null);
    setPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate Project Details
    if (!projectTitle.trim()) {
      setErrorMessage('Please enter the project title.');
      return;
    }

    if (!projectCategory) {
      setErrorMessage('Please select a project category.');
      return;
    }

    // 2. Validate Team Leader
    if (!teamLeaderName.trim()) {
      setErrorMessage('Please enter the Team Leader full name.');
      return;
    }

    const cleanLeaderMobile = teamLeaderMobile.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanLeaderMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number for Team Leader.');
      return;
    }

    if (!branch.trim()) {
      setErrorMessage('Please select the engineering branch.');
      return;
    }

    // 3. Validate Team Members
    for (let i = 0; i < teamMembers.length; i++) {
      const member = teamMembers[i];
      if (!member.name.trim()) {
        setErrorMessage(`Please enter the name for Team Member #${i + 1}.`);
        return;
      }
      const cleanMemberMobile = member.mobile.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanMemberMobile)) {
        setErrorMessage(
          `Please enter a valid 10-digit mobile number for Team Member #${i + 1} (${member.name}).`
        );
        return;
      }
    }

    // 4. Validate Project Description
    if (!projectDescription.trim()) {
      setErrorMessage('Please provide a short description of your project.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload Team Leader Photo
      let leaderPhotoUrl = '';
      if (leaderPhotoFile) {
        const leaderRes = await uploadActivityPhoto(
          leaderPhotoFile,
          'project-show',
          `leader_${teamLeaderName.trim()}`
        );
        if (leaderRes.url) {
          leaderPhotoUrl = leaderRes.url;
        }
      }

      // 2. Upload Individual Photos for each team member
      const cleanedMembers: TeamMember[] = [];
      for (let i = 0; i < teamMembers.length; i++) {
        let mPhotoUrl = '';
        if (memberPhotoFiles[i]) {
          const mRes = await uploadActivityPhoto(
            memberPhotoFiles[i]!,
            'members',
            `member_${i + 1}_${teamMembers[i].name.trim()}`
          );
          if (mRes.url) {
            mPhotoUrl = mRes.url;
          }
        }
        cleanedMembers.push({
          name: teamMembers[i].name.trim(),
          mobile: teamMembers[i].mobile.replace(/\D/g, ''),
          photo_url: mPhotoUrl,
        });
      }

      const res = await submitProjectShowRegistration(
        {
          projectTitle: projectTitle.trim(),
          projectCategory,
          teamLeaderName: teamLeaderName.trim(),
          teamLeaderMobile: cleanLeaderMobile,
          teamLeaderPhotoUrl: leaderPhotoUrl,
          branch: branch.trim(),
          teamMemberCount: cleanedMembers.length,
          teamMembers: cleanedMembers,
          projectDescription: projectDescription.trim(),
        },
        photoFile
      );

      if (res.success) {
        setIsSuccess(true);
        setRegistrationId(res.id || `PROJ-${Date.now().toString().slice(-6)}`);
      } else {
        setErrorMessage(res.error || 'Failed to submit project registration. Please try again.');
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
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200/90 relative max-h-[85vh] sm:max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 relative shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 pr-8">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-indigo-300 uppercase tracking-wider block leading-tight">
                Engineers' Day 2026 • Innovation Expo
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                Project Exhibition Registration
              </h3>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {isSuccess ? (
            /* Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-indigo-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">
                  Project Registration Successful!
                </h4>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  Your project <strong>"{projectTitle}"</strong> has been registered successfully for the Engineers' Day 2026 Innovation Showcase.
                </p>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-200/60">
                  <span className="text-slate-500 font-medium">Project Category:</span>
                  <span className="font-bold text-indigo-900 bg-indigo-100/70 px-2 py-0.5 rounded">
                    {projectCategory}
                  </span>
                </div>

                {/* Team Leader Badge with Photo */}
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60">
                  <div className="flex items-center gap-2.5">
                    {leaderPhotoPreview ? (
                      <img
                        src={leaderPhotoPreview}
                        alt="Leader"
                        className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {teamLeaderName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Team Leader</span>
                      <span className="font-bold text-slate-900">{teamLeaderName}</span>
                      <span className="text-[11px] text-slate-500 block">+91 {teamLeaderMobile}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-700 text-right">{branch}</span>
                </div>

                {/* Team Members List with Photos */}
                {teamMembers.length > 0 && (
                  <div className="pb-2 border-b border-indigo-200/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Team Members ({teamMembers.length})
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {teamMembers.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-indigo-100">
                          {memberPhotoPreviews[idx] ? (
                            <img
                              src={memberPhotoPreviews[idx]!}
                              alt={m.name}
                              className="w-7 h-7 rounded-full object-cover border border-indigo-400 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {idx + 1}
                            </div>
                          )}
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <span className="font-semibold text-slate-800 truncate">{m.name}</span>
                            <span className="font-mono text-[10px] text-slate-500">+91 {m.mobile}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {photoPreview && (
                  <div className="flex items-center gap-2.5 pb-2 border-b border-indigo-200/60 pt-1">
                    <img
                      src={photoPreview}
                      alt="Project Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-300 shadow-2xs shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Project Prototype / Model</span>
                      <span className="font-semibold text-emerald-700">Photo Uploaded Successfully</span>
                    </div>
                  </div>
                )}
                {registrationId && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 font-medium">Ref / Project ID:</span>
                    <span className="font-mono font-bold text-indigo-800">{registrationId.slice(0, 18)}...</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500">
                Stall allocation and project demonstration booth numbers will be issued at 1:30 PM in the Central Workshop Block.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* SECTION A: PROJECT DETAILS */}
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Project Information
                  </h4>
                </div>

                {/* Project Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Smart IoT Soil Moisture & Solar Tracking System"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-900"
                  />
                </div>

                {/* Project Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={projectCategory}
                      onChange={(e) => setProjectCategory(e.target.value as ProjectCategory)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-900 bg-white"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION B: TEAM LEADER DETAILS */}
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Team Leader Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Leader Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={teamLeaderName}
                        onChange={(e) => setTeamLeaderName(e.target.value)}
                        placeholder="Team leader's full name"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Leader Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={teamLeaderMobile}
                        onChange={(e) => setTeamLeaderMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none font-mono text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch / Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-900 bg-white"
                  >
                    <option value="">-- Select Branch --</option>
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team Leader Photo */}
                <PhotoUploadField
                  id="project-leader-photo"
                  isCompact={true}
                  label="Team Leader Photo / Selfie"
                  description="Upload photo or selfie of team leader (max 1 MB)"
                  photoPreview={leaderPhotoPreview}
                  onPhotoSelected={(f) => {
                    setLeaderPhotoFile(f);
                    setLeaderPhotoPreview(URL.createObjectURL(f));
                  }}
                  onPhotoCleared={() => {
                    setLeaderPhotoFile(null);
                    setLeaderPhotoPreview(null);
                  }}
                  accentColor="indigo"
                />
              </div>

              {/* SECTION C: TEAM MEMBERS (1 Leader + up to 4 Members = Max 5) */}
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Additional Team Members
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Max 5 Total (1 Leader + 4 Members)
                  </span>
                </div>

                {/* Team Members Count Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Number of Additional Team Members (excluding Leader):
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[0, 1, 2, 3, 4].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handleMemberCountChange(cnt)}
                        className={`flex-1 min-w-[60px] py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center ${
                          additionalMemberCount === cnt
                            ? 'bg-indigo-700 text-white border-indigo-800 shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        {cnt === 0 ? 'None (Solo)' : `${cnt} ${cnt === 1 ? 'Member' : 'Members'}`}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Total Team Size: <strong>{additionalMemberCount + 1}</strong> (Leader + {additionalMemberCount} additional)
                  </p>
                </div>

                {/* Dynamic Inputs for Team Members */}
                {teamMembers.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {teamMembers.map((member, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-fadeIn"
                      >
                        <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Team Member #{idx + 1}</span>
                          </div>
                          {member.name && (
                            <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[140px]">
                              {member.name}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            value={member.name}
                            onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                            placeholder={`Member #${idx + 1} Full Name`}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 outline-none text-slate-900 bg-white"
                          />
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={member.mobile}
                            onChange={(e) =>
                              updateTeamMember(idx, 'mobile', e.target.value.replace(/\D/g, ''))
                            }
                            placeholder="10-digit mobile number"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 outline-none font-mono text-slate-900 bg-white"
                          />
                        </div>

                        {/* Member Photo Field */}
                        <PhotoUploadField
                          id={`member-photo-${idx}`}
                          label={`Member #${idx + 1} (${member.name || 'Member'}) Photo`}
                          description="Individual photo of this team member (JPG, PNG, max 1 MB)"
                          photoPreview={memberPhotoPreviews[idx] || null}
                          onPhotoSelected={(f) => updateMemberPhoto(idx, f)}
                          onPhotoCleared={() => removeMemberPhoto(idx)}
                          accentColor="indigo"
                          isCompact
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION D: PROJECT DESCRIPTION & PHOTO */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-xs flex items-center justify-center">
                    4
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Description & Project Photo
                  </h4>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Project Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Summarize the core problem statement, working mechanism, and real-world application of your project..."
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-900"
                  />
                </div>

                {/* Project Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Photo (Prototype / Diagram / Model)
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="project-photo-input"
                  />

                  {photoPreview ? (
                    <div className="relative border border-indigo-200 rounded-xl p-3 bg-indigo-50/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={photoPreview}
                          alt="Project Preview"
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                            {photoFile?.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB` : ''} • Ready to upload to project-photos bucket
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer hover:bg-indigo-50/30 transition-colors"
                    >
                      <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-800">
                        Click to upload project photo or prototype picture
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Supports JPG, PNG, WEBP (Max 5 MB) • Uploads to Supabase Storage
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 flex items-center gap-2.5 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading & Registering...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Confirm Project Exhibition Registration</span>
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

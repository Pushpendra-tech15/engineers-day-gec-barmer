import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Search,
  X,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Phone,
  GraduationCap,
  Layers,
  LogOut,
  Image as ImageIcon,
  MessageSquareShare,
  Sprout,
  Cpu,
  HeartPulse,
  Users,
  ExternalLink,
  Copy,
  Check,
  Database,
} from 'lucide-react';
import {
  fetchAllActivityRegistrations,
  isSupabaseConfigured,
} from '../lib/supabase';
import {
  ConclaveRegistrationRow,
  PlantationRegistrationRow,
  ProjectShowRegistrationRow,
  BloodDonationRegistrationRow,
} from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'conclave' | 'plantation' | 'project-show' | 'blood-donation';

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('gec_admin_auth') === 'true';
  });
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('conclave');

  // Registrations Data
  const [conclaveData, setConclaveData] = useState<ConclaveRegistrationRow[]>([]);
  const [conclaveFilter, setConclaveFilter] = useState<'all' | 'student' | 'guest'>('all');
  const [plantationData, setPlantationData] = useState<PlantationRegistrationRow[]>([]);
  const [projectShowData, setProjectShowData] = useState<ProjectShowRegistrationRow[]>([]);
  const [bloodDonationData, setBloodDonationData] = useState<BloodDonationRegistrationRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => {
      setCopiedPhone(null);
    }, 2000);
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return 'Recent';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  // Fetch all 4 tables
  const loadAllData = async () => {
    setLoading(true);
    try {
      try {
        localStorage.removeItem('gec_conclave_registrations');
        localStorage.removeItem('gec_plantation_registrations');
        localStorage.removeItem('gec_project_show_registrations');
        localStorage.removeItem('gec_blood_donation_registrations');
      } catch (e) {
        // ignore
      }

      const data = await fetchAllActivityRegistrations();
      setConclaveData(data.conclave || []);
      setPlantationData(data.plantation || []);
      setProjectShowData(data.projectShow || []);
      setBloodDonationData(data.bloodDonation || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAllData();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  // Handle Login Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = adminId.trim();
    const cleanPass = password.trim();

    // Verification check: ID 'Pushpendra', Password '1506'
    if (cleanId.toLowerCase() === 'pushpendra' && cleanPass === '1506') {
      setIsAuthenticated(true);
      sessionStorage.setItem('gec_admin_auth', 'true');
      setLoginError(null);
    } else {
      setLoginError('Invalid Admin ID or Password. Please verify your credentials.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('gec_admin_auth');
    setAdminId('');
    setPassword('');
  };

  // Export specific activity to CSV
  const handleDownloadCsv = (tab: AdminTab) => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `gec_barmer_${tab.replace('-', '_')}_registrations.csv`;
    let activityName = 'Activity';

    if (tab === 'conclave') {
      activityName = 'Conclave';
      filename = `gec_barmer_conclave_registrations.csv`;
      if (conclaveData.length === 0) {
        alert('No Conclave registrations found to download.');
        return;
      }
      headers = [
        'S.No.',
        'Attendee Type',
        'Full Name',
        'Mobile Number',
        'Guest Category / Role',
        'Designation',
        'Company / Org',
        'Branch',
        'Semester',
        'Question for Speaker',
        'Photo URL',
        'Registered At',
      ];
      rows = conclaveData.map((r, i) => [
        i + 1,
        `"${r.attendee_type === 'guest' ? 'Distinguished Guest' : 'Student Participant'}"`,
        `"${(r.full_name || '').replace(/"/g, '""')}"`,
        `"${r.mobile_number || ''}"`,
        `"${r.guest_category || ''}"`,
        `"${(r.designation || '').replace(/"/g, '""')}"`,
        `"${(r.company_name || '').replace(/"/g, '""')}"`,
        `"${(r.branch || '').replace(/"/g, '""')}"`,
        `"${r.semester || ''}"`,
        `"${(r.guest_question || '').replace(/"/g, '""')}"`,
        `"${r.photo_url || ''}"`,
        `"${r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : ''}"`,
      ]);
    } else if (tab === 'plantation') {
      activityName = 'Plantation Drive';
      filename = `gec_barmer_plantation_registrations.csv`;
      if (plantationData.length === 0) {
        alert('No Plantation Drive registrations found to download.');
        return;
      }
      headers = ['S.No.', 'Participant Name', 'Mobile Number', 'Branch', 'Semester', 'Photo URL', 'Registered At'];
      rows = plantationData.map((r, i) => [
        i + 1,
        `"${(r.full_name || '').replace(/"/g, '""')}"`,
        `"${r.mobile_number || ''}"`,
        `"${(r.branch || '').replace(/"/g, '""')}"`,
        `"${r.semester || ''}"`,
        `"${r.photo_url || ''}"`,
        `"${r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : ''}"`,
      ]);
    } else if (tab === 'project-show') {
      activityName = 'Project Exhibition';
      filename = `gec_barmer_project_exhibition_registrations.csv`;
      if (projectShowData.length === 0) {
        alert('No Project Exhibition registrations found to download.');
        return;
      }
      headers = [
        'S.No.',
        'Project Title',
        'Category',
        'Team Leader Name',
        'Leader Mobile',
        'Leader Photo URL',
        'Branch',
        'Total Team Size',
        'Team Members (Name, Mobile, Photo)',
        'Project Description',
        'Project Model Photo URL',
        'Registered At',
      ];
      rows = projectShowData.map((r, i) => {
        const membersList = (r.team_members || [])
          .map((m) => `${m.name} (${m.mobile}${m.photo_url ? ` - Photo: ${m.photo_url}` : ''})`)
          .join('; ');
        return [
          i + 1,
          `"${(r.project_title || '').replace(/"/g, '""')}"`,
          `"${r.project_category || ''}"`,
          `"${(r.team_leader_name || '').replace(/"/g, '""')}"`,
          `"${r.team_leader_mobile || ''}"`,
          `"${r.team_leader_photo_url || ''}"`,
          `"${(r.branch || '').replace(/"/g, '""')}"`,
          (r.team_member_count || 0) + 1,
          `"${membersList.replace(/"/g, '""')}"`,
          `"${(r.project_description || '').replace(/"/g, '""')}"`,
          `"${r.project_photo_url || ''}"`,
          `"${r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : ''}"`,
        ];
      });
    } else if (tab === 'blood-donation') {
      activityName = 'Blood Donation Camp';
      filename = `gec_barmer_blood_donation_registrations.csv`;
      if (bloodDonationData.length === 0) {
        alert('No Blood Donation registrations found to download.');
        return;
      }
      headers = ['S.No.', 'Donor Name', 'Mobile Number', 'Blood Group', 'Branch', 'Semester', 'Gender', 'Age', 'Photo URL', 'Registered At'];
      rows = bloodDonationData.map((r, i) => [
        i + 1,
        `"${(r.full_name || '').replace(/"/g, '""')}"`,
        `"${r.mobile_number || ''}"`,
        `"${r.blood_group || 'Unknown'}"`,
        `"${(r.branch || '').replace(/"/g, '""')}"`,
        `"${r.semester || ''}"`,
        `"${r.gender || ''}"`,
        r.age || '',
        `"${r.photo_url || ''}"`,
        `"${r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : ''}"`,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl border border-slate-200 relative my-4 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Admin Portal • GEC Barmer
                </span>
                {isSupabaseConfigured() ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" /> Supabase
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-medium">
                    Local Cache
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Engineers' Day 2026 Admin Dashboard
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close admin modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Login View */
          <div className="p-6 sm:p-12 max-w-md mx-auto w-full my-auto">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-200">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Admin Authorization</h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials to access registrations for all 4 activities.
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin ID
                </label>
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter Admin ID"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                Sign In to Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs & Actions Bar */}
            <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Activity Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('conclave');
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'conclave'
                      ? 'bg-blue-700 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquareShare className="w-3.5 h-3.5" />
                  <span>1. Conclave</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'conclave' ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {conclaveData.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('plantation');
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'plantation'
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>2. Plantation</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'plantation' ? 'bg-emerald-900 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {plantationData.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('project-show');
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'project-show'
                      ? 'bg-indigo-700 text-white shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>3. Exhibition</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'project-show' ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {projectShowData.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('blood-donation');
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'blood-donation'
                      ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>4. Blood Donation</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'blood-donation' ? 'bg-rose-900 text-white' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {bloodDonationData.length}
                  </span>
                </button>
              </div>

              {/* Action Buttons: Refresh & CSV Download */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={loadAllData}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  title="Refresh registration data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                  <span className="hidden sm:inline">Refresh Data</span>
                </button>

                {/* Direct activity download button */}
                <button
                  type="button"
                  onClick={() => handleDownloadCsv(activeTab)}
                  className={`px-3.5 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                    activeTab === 'conclave'
                      ? 'bg-blue-700 hover:bg-blue-800'
                      : activeTab === 'plantation'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : activeTab === 'project-show'
                      ? 'bg-indigo-700 hover:bg-indigo-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                  title={`Download only ${
                    activeTab === 'conclave'
                      ? 'Conclave'
                      : activeTab === 'plantation'
                      ? 'Plantation'
                      : activeTab === 'project-show'
                      ? 'Project Exhibition'
                      : 'Blood Donation'
                  } data CSV`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {activeTab === 'conclave' && `Download Conclave CSV (${conclaveData.length})`}
                    {activeTab === 'plantation' && `Download Plantation CSV (${plantationData.length})`}
                    {activeTab === 'project-show' && `Download Exhibition CSV (${projectShowData.length})`}
                    {activeTab === 'blood-donation' && `Download Blood Donors CSV (${bloodDonationData.length})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-header Filter Search */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${
                    activeTab === 'conclave'
                      ? 'Conclave (name, phone, branch, company)...'
                      : activeTab === 'plantation'
                      ? 'Plantation (volunteer name, mobile, branch)...'
                      : activeTab === 'project-show'
                      ? 'Exhibition (title, leader, mobile, branch)...'
                      : 'Blood Donors (name, phone, blood group)...'
                  }`}
                  className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-slate-800 transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  Track:{' '}
                  <strong className="text-slate-700 font-semibold">
                    {activeTab === 'conclave' && 'Technical Conclave'}
                    {activeTab === 'plantation' && 'Plantation Drive'}
                    {activeTab === 'project-show' && 'Project Exhibition'}
                    {activeTab === 'blood-donation' && 'Blood Donation Camp'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 bg-slate-50/60">
              {/* 1. CONCLAVE TAB */}
              {activeTab === 'conclave' && (
                <div className="space-y-3">
                  {/* Dedicated Activity Header Card & Download Trigger */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/40 border border-blue-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <MessageSquareShare className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>Conclave & Technical Symposium</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {conclaveData.length} Registered
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Student delegates and distinguished guest attendees
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Sub-filters */}
                      <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => setConclaveFilter('all')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            conclaveFilter === 'all'
                              ? 'bg-blue-700 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          All ({conclaveData.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setConclaveFilter('student')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            conclaveFilter === 'student'
                              ? 'bg-blue-700 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Students ({conclaveData.filter((r) => r.attendee_type !== 'guest').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setConclaveFilter('guest')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            conclaveFilter === 'guest'
                              ? 'bg-amber-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Guests ({conclaveData.filter((r) => r.attendee_type === 'guest').length})
                        </button>
                      </div>

                      {/* Dedicated Conclave Download Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadCsv('conclave')}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Conclave CSV ({conclaveData.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Conclave Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="p-3 w-12 text-center">#</th>
                            <th className="p-3">Attendee</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Academic / Organization</th>
                            <th className="p-3">Question / Topic</th>
                            <th className="p-3 text-center">Photo</th>
                            <th className="p-3">Registered At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {conclaveData
                            .filter((r) => {
                              if (conclaveFilter === 'student' && r.attendee_type === 'guest') return false;
                              if (conclaveFilter === 'guest' && r.attendee_type !== 'guest') return false;
                              if (!searchQuery) return true;
                              const q = searchQuery.toLowerCase();
                              return (
                                r.full_name?.toLowerCase().includes(q) ||
                                r.mobile_number?.includes(q) ||
                                r.branch?.toLowerCase().includes(q) ||
                                r.designation?.toLowerCase().includes(q) ||
                                r.company_name?.toLowerCase().includes(q) ||
                                r.guest_category?.toLowerCase().includes(q) ||
                                r.guest_question?.toLowerCase().includes(q)
                              );
                            })
                            .map((row, idx) => (
                              <tr key={row.id || idx} className="hover:bg-blue-50/40 transition-colors">
                                <td className="p-3 text-center font-mono font-bold text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2.5">
                                    {row.photo_url ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewPhoto(row.photo_url)}
                                        className="w-8 h-8 rounded-full overflow-hidden border border-blue-300 shrink-0 cursor-pointer group hover:ring-2 hover:ring-blue-500 transition-all"
                                        title="Click to view attendee photo"
                                      >
                                        <img
                                          src={row.photo_url}
                                          alt={row.full_name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                        />
                                      </button>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                                        {(row.full_name || 'U').slice(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                        {row.full_name}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => handleCopyPhone(row.mobile_number || '', e)}
                                        className="font-mono text-[11px] text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer font-semibold mt-0.5"
                                        title="Click to copy phone number"
                                      >
                                        <Phone className="w-3 h-3" />
                                        <span>+91 {row.mobile_number}</span>
                                        {copiedPhone === row.mobile_number ? (
                                          <span className="text-[10px] text-emerald-600 font-bold ml-1">
                                            Copied!
                                          </span>
                                        ) : (
                                          <Copy className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  {row.attendee_type === 'guest' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                      <span>👑</span>
                                      <span>{row.guest_category || 'Distinguished Guest'}</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                      <span>🎓</span>
                                      <span>Student Participant</span>
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {row.attendee_type === 'guest' ? (
                                    <div>
                                      <div className="font-bold text-slate-800">
                                        {row.designation || 'Dignitary'}
                                      </div>
                                      <div className="text-slate-500 text-[11px]">
                                        {row.company_name || 'Organization'}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-800 border border-slate-200 text-[11px]">
                                        {row.branch || 'Engg'}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md font-medium bg-blue-50 text-blue-700 text-[11px]">
                                        {row.semester || 'Semester'}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 max-w-xs text-slate-700">
                                  {row.guest_question ? (
                                    <div className="bg-slate-50 border border-slate-200/80 p-1.5 rounded-lg text-[11px] italic text-slate-700 line-clamp-2">
                                      "{row.guest_question}"
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-[11px] italic">
                                      General attendance
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-center whitespace-nowrap">
                                  {row.photo_url ? (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewPhoto(row.photo_url)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] cursor-pointer"
                                    >
                                      <ImageIcon className="w-3.5 h-3.5" />
                                      <span>View</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-[11px]">—</span>
                                  )}
                                </td>
                                <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                                  {formatDateTime(row.created_at)}
                                </td>
                              </tr>
                            ))}
                          {conclaveData.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-10 text-center text-slate-400">
                                <MessageSquareShare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-semibold text-slate-600">
                                  No Conclave registrations found yet.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PLANTATION TAB */}
              {activeTab === 'plantation' && (
                <div className="space-y-3">
                  {/* Dedicated Activity Header Card & Download Trigger */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50/40 border border-emerald-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Sprout className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>Eco-Campus Plantation Drive</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {plantationData.length} Volunteers
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Green initiative tree plantation participants and volunteers
                        </p>
                      </div>
                    </div>

                    {/* Dedicated Plantation Download Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadCsv('plantation')}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Plantation CSV ({plantationData.length})</span>
                    </button>
                  </div>

                  {/* Plantation Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="p-3 w-12 text-center">#</th>
                            <th className="p-3">Volunteer Participant</th>
                            <th className="p-3">Branch & Semester</th>
                            <th className="p-3 text-center">Photo</th>
                            <th className="p-3">Registered At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {plantationData
                            .filter(
                              (r) =>
                                !searchQuery ||
                                r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.mobile_number?.includes(searchQuery) ||
                                r.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.semester?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((row, idx) => (
                              <tr key={row.id || idx} className="hover:bg-emerald-50/40 transition-colors">
                                <td className="p-3 text-center font-mono font-bold text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2.5">
                                    {row.photo_url ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewPhoto(row.photo_url)}
                                        className="w-8 h-8 rounded-full overflow-hidden border border-emerald-300 shrink-0 cursor-pointer group hover:ring-2 hover:ring-emerald-500 transition-all"
                                        title="Click to view volunteer photo"
                                      >
                                        <img
                                          src={row.photo_url}
                                          alt={row.full_name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                        />
                                      </button>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                                        {(row.full_name || 'V').slice(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                        {row.full_name}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => handleCopyPhone(row.mobile_number || '', e)}
                                        className="font-mono text-[11px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer font-semibold mt-0.5"
                                        title="Click to copy phone number"
                                      >
                                        <Phone className="w-3 h-3" />
                                        <span>+91 {row.mobile_number}</span>
                                        {copiedPhone === row.mobile_number ? (
                                          <span className="text-[10px] text-emerald-600 font-bold ml-1">
                                            Copied!
                                          </span>
                                        ) : (
                                          <Copy className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-800 border border-slate-200 text-[11px]">
                                      {row.branch || 'Engineering'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md font-medium bg-emerald-50 text-emerald-800 text-[11px]">
                                      {row.semester || 'Semester'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 text-center whitespace-nowrap">
                                  {row.photo_url ? (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewPhoto(row.photo_url)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] cursor-pointer"
                                    >
                                      <ImageIcon className="w-3.5 h-3.5" />
                                      <span>View</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-[11px]">—</span>
                                  )}
                                </td>
                                <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                                  {formatDateTime(row.created_at)}
                                </td>
                              </tr>
                            ))}
                          {plantationData.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-10 text-center text-slate-400">
                                <Sprout className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-semibold text-slate-600">
                                  No Plantation Drive registrations found yet.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PROJECT EXHIBITION TAB */}
              {activeTab === 'project-show' && (
                <div className="space-y-3">
                  {/* Dedicated Activity Header Card & Download Trigger */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50/40 border border-indigo-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>Project Exhibition & Innovation Expo</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            {projectShowData.length} Teams Registered
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Hardware prototypes, IoT inventions & technical projects
                        </p>
                      </div>
                    </div>

                    {/* Dedicated Project Exhibition Download Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadCsv('project-show')}
                      className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Exhibition CSV ({projectShowData.length})</span>
                    </button>
                  </div>

                  {/* Project Exhibition Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="p-3 w-12 text-center">#</th>
                            <th className="p-3">Project Title & Category</th>
                            <th className="p-3">Team Leader</th>
                            <th className="p-3">Branch</th>
                            <th className="p-3">Team Members</th>
                            <th className="p-3">Description</th>
                            <th className="p-3 text-center">Model Photo</th>
                            <th className="p-3">Registered At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {projectShowData
                            .filter(
                              (r) =>
                                !searchQuery ||
                                r.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.project_category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.team_leader_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.team_leader_mobile?.includes(searchQuery) ||
                                r.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.team_members?.some((m) =>
                                  m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  m.mobile?.includes(searchQuery)
                                )
                            )
                            .map((row, idx) => (
                              <tr key={row.id || idx} className="hover:bg-indigo-50/40 transition-colors">
                                <td className="p-3 text-center font-mono font-bold text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="p-3 max-w-xs">
                                  <p className="font-bold text-slate-900 text-xs sm:text-sm">
                                    {row.project_title}
                                  </p>
                                  <span className="inline-block mt-1 text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md font-bold">
                                    {row.project_category}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2.5">
                                    {row.team_leader_photo_url ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewPhoto(row.team_leader_photo_url)}
                                        className="w-8 h-8 rounded-full overflow-hidden border border-indigo-300 shrink-0 cursor-pointer group hover:ring-2 hover:ring-indigo-500 transition-all"
                                        title="Click to view leader photo"
                                      >
                                        <img
                                          src={row.team_leader_photo_url}
                                          alt={row.team_leader_name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                        />
                                      </button>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                        {(row.team_leader_name || 'L').slice(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-bold text-slate-900 text-xs">
                                        {row.team_leader_name}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={(e) => handleCopyPhone(row.team_leader_mobile || '', e)}
                                        className="font-mono text-[11px] text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer font-semibold mt-0.5"
                                        title="Click to copy leader phone number"
                                      >
                                        <Phone className="w-3 h-3" />
                                        <span>+91 {row.team_leader_mobile}</span>
                                        {copiedPhone === row.team_leader_mobile ? (
                                          <span className="text-[10px] text-emerald-600 font-bold ml-1">
                                            Copied!
                                          </span>
                                        ) : (
                                          <Copy className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-800 border border-slate-200 text-[11px]">
                                    {row.branch || 'Engineering'}
                                  </span>
                                </td>
                                <td className="p-3 max-w-xs">
                                  <div className="flex items-center gap-1 font-bold text-slate-800 text-[11px] mb-1">
                                    <Users className="w-3 h-3 text-indigo-600" />
                                    <span>{(row.team_members?.length || 0) + 1} Total Members</span>
                                  </div>
                                  {row.team_members && row.team_members.length > 0 ? (
                                    <div className="space-y-1">
                                      {row.team_members.map((m, mIdx) => (
                                        <div
                                          key={mIdx}
                                          className="flex items-center justify-between gap-1.5 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-md text-[11px]"
                                        >
                                          <span className="font-medium text-slate-700 truncate">
                                            {m.name} ({m.mobile})
                                          </span>
                                          {m.photo_url && (
                                            <button
                                              type="button"
                                              onClick={() => setPreviewPhoto(m.photo_url!)}
                                              className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer shrink-0"
                                            >
                                              Photo
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-[11px] italic">Solo Project</span>
                                  )}
                                </td>
                                <td className="p-3 max-w-xs text-slate-600">
                                  <p className="line-clamp-2 text-[11px] leading-relaxed">
                                    {row.project_description || '—'}
                                  </p>
                                </td>
                                <td className="p-3 text-center whitespace-nowrap">
                                  {row.project_photo_url ? (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewPhoto(row.project_photo_url)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] cursor-pointer"
                                    >
                                      <ImageIcon className="w-3.5 h-3.5" />
                                      <span>Model</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-[11px]">—</span>
                                  )}
                                </td>
                                <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                                  {formatDateTime(row.created_at)}
                                </td>
                              </tr>
                            ))}
                          {projectShowData.length === 0 && (
                            <tr>
                              <td colSpan={8} className="p-10 text-center text-slate-400">
                                <Cpu className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-semibold text-slate-600">
                                  No Project Exhibition registrations found yet.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. BLOOD DONATION TAB */}
              {activeTab === 'blood-donation' && (
                <div className="space-y-3">
                  {/* Dedicated Activity Header Card & Download Trigger */}
                  <div className="bg-gradient-to-r from-rose-50 to-red-50/40 border border-rose-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-rose-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>Blood Donation Camp</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            {bloodDonationData.length} Voluntary Donors
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Life-saving voluntary blood donor registrations and details
                        </p>
                      </div>
                    </div>

                    {/* Dedicated Blood Donation Download Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadCsv('blood-donation')}
                      className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Blood Donors CSV ({bloodDonationData.length})</span>
                    </button>
                  </div>

                  {/* Blood Donation Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="p-3 w-12 text-center">#</th>
                            <th className="p-3">Voluntary Donor</th>
                            <th className="p-3">Blood Group</th>
                            <th className="p-3">Branch & Semester</th>
                            <th className="p-3">Gender & Age</th>
                            <th className="p-3 text-center">Photo</th>
                            <th className="p-3">Registered At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bloodDonationData
                            .filter(
                              (r) =>
                                !searchQuery ||
                                r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.mobile_number?.includes(searchQuery) ||
                                r.blood_group?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.gender?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((row, idx) => (
                              <tr key={row.id || idx} className="hover:bg-rose-50/40 transition-colors">
                                <td className="p-3 text-center font-mono font-bold text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2.5">
                                    {row.photo_url ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewPhoto(row.photo_url)}
                                        className="w-8 h-8 rounded-full overflow-hidden border border-rose-300 shrink-0 cursor-pointer group hover:ring-2 hover:ring-rose-500 transition-all"
                                        title="Click to view donor photo"
                                      >
                                        <img
                                          src={row.photo_url}
                                          alt={row.full_name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                        />
                                      </button>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                                        {(row.full_name || 'D').slice(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                        {row.full_name}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => handleCopyPhone(row.mobile_number || '', e)}
                                        className="font-mono text-[11px] text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer font-semibold mt-0.5"
                                        title="Click to copy donor phone number"
                                      >
                                        <Phone className="w-3 h-3" />
                                        <span>+91 {row.mobile_number}</span>
                                        {copiedPhone === row.mobile_number ? (
                                          <span className="text-[10px] text-emerald-600 font-bold ml-1">
                                            Copied!
                                          </span>
                                        ) : (
                                          <Copy className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-black text-xs bg-rose-600 text-white shadow-xs">
                                    <span>🩸</span>
                                    <span>{row.blood_group || 'Unknown'}</span>
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-800 border border-slate-200 text-[11px]">
                                      {row.branch || 'Engineering'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md font-medium bg-rose-50 text-rose-800 text-[11px]">
                                      {row.semester || 'Semester'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-700 whitespace-nowrap font-medium text-[11px]">
                                  {row.gender || '—'} {row.age ? `• ${row.age} Yrs` : ''}
                                </td>
                                <td className="p-3 text-center whitespace-nowrap">
                                  {row.photo_url ? (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewPhoto(row.photo_url)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] cursor-pointer"
                                    >
                                      <ImageIcon className="w-3.5 h-3.5" />
                                      <span>View</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-[11px]">—</span>
                                  )}
                                </td>
                                <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                                  {formatDateTime(row.created_at)}
                                </td>
                              </tr>
                            ))}
                          {bloodDonationData.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-10 text-center text-slate-400">
                                <HeartPulse className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-semibold text-slate-600">
                                  No Blood Donation registrations found yet.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo Modal Preview */}
        {previewPhoto && (
          <div
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setPreviewPhoto(null)}
          >
            <div
              className="bg-white rounded-2xl p-4 max-w-xl w-full relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Participant Photo / Prototype Attachment</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={previewPhoto}
                alt="Registration Preview"
                className="w-full max-h-[70vh] object-contain rounded-xl bg-slate-50 border border-slate-100"
              />
              <div className="pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px]">Click outside or close to dismiss</span>
                <a
                  href={previewPhoto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-bold flex items-center gap-1"
                >
                  <span>Open Full Resolution in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

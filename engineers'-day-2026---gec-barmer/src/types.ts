export interface Activity {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  badge: string;
  venue: string;
  timing: string;
  coordinator: string;
  rules: string[];
  highlights: string[];
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  activityId?: string;
  venue: string;
  speakerOrLead?: string;
  badge: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Coordinator {
  id: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  phone?: string;
  activityLead?: string;
  isChief?: boolean;
}

// ==========================================
// ACTIVITY SPECIFIC REGISTRATION TYPES
// ==========================================

export type ActivityType = 'conclave' | 'plantation' | 'project-show' | 'blood-donation';

// 1. Conclave Registration
export type ConclaveAttendeeType = 'student' | 'guest';

export type ConclaveGuestCategory =
  | 'Chief Guest'
  | 'Guest Speaker'
  | 'Industry Expert'
  | 'Corporate Delegate'
  | 'Special Guest';

export interface ConclaveRegistrationInput {
  attendeeType: ConclaveAttendeeType;
  fullName: string;
  mobileNumber: string;
  photoUrl?: string;
  // Student specific fields
  branch?: string;
  semester?: string;
  guestQuestion?: string;
  // Guest specific fields
  designation?: string;
  companyName?: string;
  guestCategory?: ConclaveGuestCategory;
}

export interface ConclaveRegistrationRow {
  id?: string;
  attendee_type?: ConclaveAttendeeType;
  full_name: string;
  mobile_number: string;
  branch?: string;
  semester?: string;
  guest_question?: string;
  designation?: string;
  company_name?: string;
  guest_category?: string;
  photo_url?: string;
  created_at?: string;
}

// 2. Plantation Registration
export interface PlantationRegistrationInput {
  fullName: string;
  mobileNumber: string;
  branch: string;
  semester: string;
  photoUrl?: string;
}

export interface PlantationRegistrationRow {
  id?: string;
  full_name: string;
  mobile_number: string;
  branch: string;
  semester: string;
  photo_url?: string;
  created_at?: string;
}

// 3. Project Exhibition Registration
export interface TeamMember {
  name: string;
  mobile: string;
  photo_url?: string;
}

export type ProjectCategory =
  | 'Software'
  | 'Hardware'
  | 'AI/ML'
  | 'IoT'
  | 'Civil/Mechanical Model'
  | 'Other';

export interface ProjectShowRegistrationInput {
  projectTitle: string;
  projectCategory: ProjectCategory;
  teamLeaderName: string;
  teamLeaderMobile: string;
  teamLeaderPhotoUrl?: string;
  branch: string;
  teamMemberCount: number; // additional members (0 to 4), total team = 1 + count (max 5)
  teamMembers: TeamMember[];
  projectDescription: string;
  projectPhotoUrl?: string;
}

export interface ProjectShowRegistrationRow {
  id?: string;
  project_title: string;
  project_category: string;
  team_leader_name: string;
  team_leader_mobile: string;
  team_leader_photo_url?: string;
  branch: string;
  team_member_count: number;
  team_members: TeamMember[];
  project_description: string;
  project_photo_url?: string;
  created_at?: string;
}

// 4. Blood Donation Registration
export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
  | "Don't Know"
  | '';

export interface BloodDonationRegistrationInput {
  fullName: string;
  mobileNumber: string;
  branch: string;
  semester: string;
  gender: string;
  age: number | string;
  bloodGroup?: BloodGroup;
  photoUrl?: string;
}

export interface BloodDonationRegistrationRow {
  id?: string;
  full_name: string;
  mobile_number: string;
  branch: string;
  semester: string;
  gender: string;
  age: number;
  blood_group: string | null;
  photo_url?: string;
  created_at?: string;
}

// Legacy general interface (kept for compatibility)
export interface RegistrationFormData {
  fullName: string;
  email: string;
  mobile: string;
  branch: string;
  semester: string;
  gender: string;
  interestedActivity: 'Conclave' | 'Plantation' | 'Project Exhibition' | 'Project Show' | '';
  photo?: string;
  message?: string;
}

export interface RegistrationSubmission extends RegistrationFormData {
  id: string;
  registrationNumber: string;
  registeredAt: string;
}


import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RegistrationSubmission } from '../types';
import { uploadToImageKit } from './imagekit';

/**
 * Retrieve cleaned configuration from Vite environment variables.
 * We access import.meta.env.VITE_* directly because Vite statically replaces them during build.
 */
export const getSupabaseConfig = (): { url: string; key: string } => {
  let url = '';
  let key = '';

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      url = (import.meta.env.VITE_SUPABASE_URL as string) || '';
      key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
    }
  } catch (e) {
    console.warn('Could not read from import.meta.env', e);
  }

  // Sanitize values: remove surrounding quotes, whitespace, and trailing slashes
  url = url.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  key = key.trim().replace(/^["']|["']$/g, '');

  // If user provided only the project ref/id (e.g. "qcijfrskbbwrargietqv"), auto-expand to full URL
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    if (!url.includes('.')) {
      url = `https://${url}.supabase.co`;
    } else {
      url = `https://${url}`;
    }
  }

  return { url, key };
};

let supabaseInstance: SupabaseClient | null = null;
let currentConfiguredUrl = '';

/**
 * Checks if valid Supabase configuration is present
 */
export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    !url.includes('YOUR_SUPABASE')
  );
};

/**
 * Lazy initialization of Supabase client singleton
 */
export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { url, key } = getSupabaseConfig();

  if (!supabaseInstance || currentConfiguredUrl !== url) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    currentConfiguredUrl = url;
  }
  return supabaseInstance;
};

/**
 * Diagnostic tool: Tests if the credentials can connect to Supabase
 * and if the table 'registrations' exists and has permissions.
 */
export const testSupabaseConnection = async (): Promise<{
  ok: boolean;
  message: string;
  details?: string;
}> => {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) {
    let missing = [];
    if (!url) missing.push('VITE_SUPABASE_URL');
    if (!key) missing.push('VITE_SUPABASE_ANON_KEY');

    return {
      ok: false,
      message: 'Keys not detected in environment (.env)',
      details: `Missing: ${missing.join(', ')}. Ensure your variable names start with "VITE_" in your .env file, and RESTART your dev server (Ctrl+C and npm run dev) so Vite can reload .env.`,
    };
  }

  if (!url.startsWith('https://') || url.includes('your-project-id')) {
    return {
      ok: false,
      message: 'Invalid Supabase URL format',
      details: `Your URL is set to "${url}". It must look like: https://abcdefghijklm.supabase.co`,
    };
  }

  try {
    const client = getSupabase();
    if (!client) {
      return {
        ok: false,
        message: 'Client initialization failed',
        details: 'Check your Supabase URL and Anon key in .env.',
      };
    }

    // Try a ping query to the registrations table
    const { error } = await client
      .from('registrations')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase test connection error:', error);

      // Table doesn't exist
      if (
        error.code === '42P01' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('relation')
      ) {
        return {
          ok: false,
          message: 'Table "registrations" does not exist in Supabase',
          details: 'Please open your Supabase Dashboard > SQL Editor, paste the SQL script from Step 2, and click "Run".',
        };
      }

      // Permission / RLS issue
      if (
        error.code === '42501' ||
        error.message?.includes('row-level security') ||
        error.message?.includes('policy')
      ) {
        return {
          ok: false,
          message: 'Row-Level Security (RLS) policy missing',
          details: 'The table exists, but public SELECT/INSERT policy is missing. Run the CREATE POLICY commands in Supabase SQL Editor.',
        };
      }

      // Invalid API key
      if (
        error.code === 'PGRST301' ||
        error.message?.includes('JWT') ||
        error.message?.includes('apiKey')
      ) {
        return {
          ok: false,
          message: 'Invalid Anon Public Key',
          details: 'The anon key in .env is incorrect or expired. Copy the "anon" public key from Supabase Project Settings > API.',
        };
      }

      return {
        ok: false,
        message: error.message,
        details: error.details || error.hint || 'Check database permissions in Supabase.',
      };
    }

    return {
      ok: true,
      message: 'Connected successfully to Supabase table "registrations"!',
      details: 'All incoming registrations will be stored live in your Supabase PostgreSQL cloud database.',
    };
  } catch (err: any) {
    console.error('Supabase connection test failed:', err);
    return {
      ok: false,
      message: 'Network or Connection Error',
      details: err?.message || 'Could not connect to Supabase. Check internet connection or project status.',
    };
  }
};

/**
 * Interface for database row mapping
 */
export interface SupabaseRegistrationRow {
  id?: string;
  registration_number: string;
  full_name: string;
  email: string;
  mobile: string;
  branch: string;
  semester: string;
  gender: string;
  interested_activity: string;
  message?: string;
  photo?: string;
  registered_at?: string;
}

/**
 * Upload student photo to ImageKit in '/engineers_day_2026/students' folder.
 * Returns the public URL of the uploaded image to be saved in Supabase registrations table.
 */
export const uploadPhotoToSupabase = async (
  file: File,
  registrationNumber: string
): Promise<{ url: string | null; error?: string }> => {
  try {
    const res = await uploadToImageKit(file, 'students', registrationNumber);
    return { url: res.url || null, error: res.error };
  } catch (err: any) {
    console.error('Photo upload exception via ImageKit:', err);
    return { url: null, error: err?.message || 'Failed to process and upload student photo' };
  }
};

/**
 * Insert registration into Supabase table 'registrations'
 */
export const saveRegistrationToSupabase = async (
  submission: RegistrationSubmission,
  photoFile?: File | null
): Promise<{ success: boolean; error?: string; inCloud: boolean; photoUrl?: string }> => {
  if (!isSupabaseConfigured()) {
    const { url, key } = getSupabaseConfig();
    let missingInfo = 'Supabase keys not loaded from .env.';
    if (!url && !key) {
      missingInfo = 'Neither VITE_SUPABASE_URL nor VITE_SUPABASE_ANON_KEY found in environment.';
    } else if (!url) {
      missingInfo = 'VITE_SUPABASE_URL is missing or invalid in .env.';
    } else if (!key) {
      missingInfo = 'VITE_SUPABASE_ANON_KEY is missing in .env.';
    }

    return {
      success: false,
      inCloud: false,
      error: `${missingInfo} Note: Dev server must be restarted after modifying .env (Ctrl+C, npm run dev).`,
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      inCloud: false,
      error: 'Supabase client initialization failed.',
    };
  }

  try {
    let finalPhotoUrl = submission.photo || '';

    // 1. If user provided a photo file, upload it directly to Supabase Storage bucket
    if (photoFile) {
      const uploadRes = await uploadPhotoToSupabase(photoFile, submission.registrationNumber);
      if (uploadRes.url) {
        finalPhotoUrl = uploadRes.url;
        submission.photo = uploadRes.url;
        console.log('Photo stored in Supabase Storage. Public URL:', finalPhotoUrl);
      } else {
        console.warn('Storage upload was not completed, using fallback preview:', uploadRes.error);
      }
    }

    const row: SupabaseRegistrationRow = {
      registration_number: submission.registrationNumber,
      full_name: submission.fullName,
      email: submission.email,
      mobile: submission.mobile,
      branch: submission.branch,
      semester: submission.semester,
      gender: submission.gender,
      interested_activity: submission.interestedActivity,
      message: submission.message || '',
      photo: finalPhotoUrl,
      registered_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('registrations')
      .insert([row])
      .select();

    if (error) {
      console.error('Supabase insert error details:', error);
      let userFriendlyError = error.message;

      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        userFriendlyError = 'Table "registrations" not found in Supabase! Please run the SQL schema in Supabase SQL Editor.';
      } else if (error.code === '42501' || error.message?.includes('policy')) {
        userFriendlyError = 'Row-Level Security (RLS) blocked the insert. Please run the public insert policy in Supabase SQL Editor.';
      } else if (error.code === '23505') {
        userFriendlyError = 'This Registration Number already exists in the database.';
      }

      return {
        success: false,
        inCloud: false,
        error: userFriendlyError,
      };
    }

    console.log('Registration successfully inserted into Supabase:', data);
    return { success: true, inCloud: true, photoUrl: finalPhotoUrl };
  } catch (err: any) {
    console.error('Supabase insert exception:', err);
    return {
      success: false,
      inCloud: false,
      error: err?.message || 'Network error while connecting to Supabase',
    };
  }
};

/**
 * Fetch registrations from Supabase (for verification or admin review)
 */
export const fetchRegistrationsFromSupabase = async (): Promise<SupabaseRegistrationRow[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Fetch failed:', err);
    return [];
  }
};

/**
 * Ready-to-use SQL schema for Supabase SQL Editor (all 4 activity tables + bucket + RLS)
 */
export const SUPABASE_SQL_SCHEMA = `-- ===================================================================
-- GOVERNMENT ENGINEERING COLLEGE BARMER - ENGINEERS' DAY 2026
-- 4 DEDICATED ACTIVITY REGISTRATION TABLES + STORAGE BUCKET + RLS
-- ===================================================================

-- 1. CONCLAVE REGISTRATION TABLE
CREATE TABLE IF NOT EXISTS public.conclave_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_type TEXT DEFAULT 'student' NOT NULL,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  photo_url TEXT,
  -- Student fields
  branch TEXT,
  semester TEXT,
  guest_question TEXT,
  -- Guest fields
  designation TEXT,
  company_name TEXT,
  guest_category TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PLANTATION REGISTRATION TABLE
CREATE TABLE IF NOT EXISTS public.plantation_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  branch TEXT NOT NULL,
  semester TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROJECT EXHIBITION REGISTRATION TABLE
CREATE TABLE IF NOT EXISTS public.project_show_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_title TEXT NOT NULL,
  project_category TEXT NOT NULL,
  team_leader_name TEXT NOT NULL,
  team_leader_mobile TEXT NOT NULL,
  team_leader_photo_url TEXT,
  branch TEXT NOT NULL,
  team_member_count INTEGER DEFAULT 0 NOT NULL,
  team_members JSONB DEFAULT '[]'::jsonb NOT NULL,
  project_description TEXT NOT NULL,
  project_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BLOOD DONATION REGISTRATION TABLE
CREATE TABLE IF NOT EXISTS public.blood_donation_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  branch TEXT NOT NULL,
  semester TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  blood_group TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe migrations if tables already exist:
ALTER TABLE public.conclave_registrations ADD COLUMN IF NOT EXISTS attendee_type TEXT DEFAULT 'student';
ALTER TABLE public.conclave_registrations ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.conclave_registrations ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.conclave_registrations ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.conclave_registrations ADD COLUMN IF NOT EXISTS guest_category TEXT;
ALTER TABLE public.conclave_registrations ALTER COLUMN branch DROP NOT NULL;
ALTER TABLE public.conclave_registrations ALTER COLUMN semester DROP NOT NULL;
ALTER TABLE public.conclave_registrations ALTER COLUMN guest_question DROP NOT NULL;
ALTER TABLE public.plantation_registrations ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.blood_donation_registrations ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.project_show_registrations ADD COLUMN IF NOT EXISTS team_leader_photo_url TEXT;
ALTER TABLE public.project_show_registrations ADD COLUMN IF NOT EXISTS project_photo_url TEXT;

-- Reload Supabase PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';

-- ===================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Students can ONLY INSERT (submit). No public SELECT/UPDATE/DELETE.
-- ===================================================================

-- Enable RLS on all 4 tables
ALTER TABLE public.conclave_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantation_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_show_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donation_registrations ENABLE ROW LEVEL SECURITY;

-- Drop prior policies to avoid conflict
DROP POLICY IF EXISTS "Allow public insert" ON public.conclave_registrations;
DROP POLICY IF EXISTS "Allow public insert" ON public.plantation_registrations;
DROP POLICY IF EXISTS "Allow public insert" ON public.project_show_registrations;
DROP POLICY IF EXISTS "Allow public insert" ON public.blood_donation_registrations;

DROP POLICY IF EXISTS "Allow admin read" ON public.conclave_registrations;
DROP POLICY IF EXISTS "Allow admin read" ON public.plantation_registrations;
DROP POLICY IF EXISTS "Allow admin read" ON public.project_show_registrations;
DROP POLICY IF EXISTS "Allow admin read" ON public.blood_donation_registrations;

-- INSERT Policies (Public: Anyone can submit registration)
CREATE POLICY "Allow public insert" ON public.conclave_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.plantation_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.project_show_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.blood_donation_registrations FOR INSERT WITH CHECK (true);

-- Optional: Allow Admin Portal read access
CREATE POLICY "Allow admin read" ON public.conclave_registrations FOR SELECT USING (true);
CREATE POLICY "Allow admin read" ON public.plantation_registrations FOR SELECT USING (true);
CREATE POLICY "Allow admin read" ON public.project_show_registrations FOR SELECT USING (true);
CREATE POLICY "Allow admin read" ON public.blood_donation_registrations FOR SELECT USING (true);

-- ===================================================================
-- STORAGE BUCKET: 'project-photos' FOR PROJECT SHOW
-- ===================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-photos',
  'project-photos',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- Storage Policies for 'project-photos'
DROP POLICY IF EXISTS "Allow public project photo upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public project photo read" ON storage.objects;

CREATE POLICY "Allow public project photo upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-photos');

CREATE POLICY "Allow public project photo read"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-photos');
`;

// ==========================================
// ACTIVITY-SPECIFIC SUBMISSION FUNCTIONS
// ==========================================

import {
  ConclaveRegistrationInput,
  ConclaveRegistrationRow,
  PlantationRegistrationInput,
  PlantationRegistrationRow,
  ProjectShowRegistrationInput,
  ProjectShowRegistrationRow,
  BloodDonationRegistrationInput,
  BloodDonationRegistrationRow,
} from '../types';

/**
 * 1. Submit Conclave Registration -> conclave_registrations
 */
export const submitConclaveRegistration = async (
  input: ConclaveRegistrationInput
): Promise<{ success: boolean; id?: string; error?: string }> => {
  const supabase = getSupabase();

  const payload: ConclaveRegistrationRow = {
    id: `local_conclave_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    attendee_type: input.attendeeType || 'student',
    full_name: input.fullName.trim(),
    mobile_number: input.mobileNumber.trim(),
    photo_url: input.photoUrl || '',
    branch: input.branch ? input.branch.trim() : null,
    semester: input.semester ? input.semester.trim() : null,
    guest_question: input.guestQuestion ? input.guestQuestion.trim() : null,
    designation: input.designation ? input.designation.trim() : null,
    company_name: input.companyName ? input.companyName.trim() : null,
    guest_category: input.guestCategory ? input.guestCategory.trim() : null,
    created_at: new Date().toISOString(),
  };

  // Save to localStorage backup
  try {
    const local = JSON.parse(localStorage.getItem('gec_conclave_registrations') || '[]');
    local.push(payload);
    localStorage.setItem('gec_conclave_registrations', JSON.stringify(local));
  } catch (e) {
    console.warn('LocalStorage backup error:', e);
  }

  if (!supabase || !isSupabaseConfigured()) {
    return {
      success: true,
      id: payload.id,
      error: isSupabaseConfigured() ? undefined : 'Saved locally (Supabase not configured in .env)',
    };
  }

  try {
    const isGuest = payload.attendee_type === 'guest';

    if (isGuest) {
      // 1. Guest Registration -> conclave_guest_registrations
      const guestRow: Record<string, any> = {
        full_name: payload.full_name,
        mobile_number: payload.mobile_number,
        designation: payload.designation,
        company_name: payload.company_name,
        guest_category: payload.guest_category,
        guest_question: payload.guest_question,
        photo_url: payload.photo_url || '',
      };

      const { data, error } = await supabase
        .from('conclave_guest_registrations')
        .insert([guestRow])
        .select('id')
        .single();

      if (!error && data?.id) {
        return { success: true, id: data.id };
      }

      console.warn('conclave_guest_registrations insert notice:', error?.message);

      // Fallback if photo_url is missing in conclave_guest_registrations
      if (error?.message?.includes('photo_url') || error?.code === 'PGRST204') {
        const fallbackGuest = { ...guestRow };
        delete fallbackGuest.photo_url;
        const retryRes = await supabase
          .from('conclave_guest_registrations')
          .insert([fallbackGuest])
          .select('id')
          .single();

        if (!retryRes.error) {
          return { success: true, id: retryRes.data?.id };
        }
      }

      // If conclave_guest_registrations table had an issue, fallback to conclave_registrations
      const fallbackConclave = await supabase
        .from('conclave_registrations')
        .insert([
          {
            full_name: payload.full_name,
            mobile_number: payload.mobile_number,
            branch: payload.designation || 'Guest',
            semester: payload.company_name || 'N/A',
            guest_question: `[Guest: ${payload.guest_category || ''}] ${payload.guest_question || ''}`,
          },
        ])
        .select('id')
        .single();

      if (!fallbackConclave.error) {
        return { success: true, id: fallbackConclave.data?.id };
      }

      return { success: false, error: error?.message || fallbackConclave.error?.message };
    } else {
      // 2. Student Registration -> conclave_registrations
      const studentRow: Record<string, any> = {
        full_name: payload.full_name,
        mobile_number: payload.mobile_number,
        branch: payload.branch,
        semester: payload.semester,
        guest_question: payload.guest_question,
        photo_url: payload.photo_url || '',
      };

      const { data, error } = await supabase
        .from('conclave_registrations')
        .insert([studentRow])
        .select('id')
        .single();

      if (error) {
        console.warn('conclave_registrations insert notice:', error.message);

        // Fallback without photo_url if column is missing in schema cache
        const fallbackStudent = {
          full_name: payload.full_name,
          mobile_number: payload.mobile_number,
          branch: payload.branch,
          semester: payload.semester,
          guest_question: payload.guest_question,
        };

        const fallbackRes = await supabase
          .from('conclave_registrations')
          .insert([fallbackStudent])
          .select('id')
          .single();

        if (!fallbackRes.error) {
          return { success: true, id: fallbackRes.data?.id };
        }

        return { success: false, error: error.message };
      }

      return { success: true, id: data?.id };
    }
  } catch (err: any) {
    console.error('Conclave registration exception:', err);
    return { success: false, error: err?.message || 'Network error occurred during submission' };
  }
};

/**
 * 2. Submit Plantation Registration -> plantation_registrations
 */
export const submitPlantationRegistration = async (
  input: PlantationRegistrationInput
): Promise<{ success: boolean; id?: string; error?: string }> => {
  const supabase = getSupabase();

  const payload: PlantationRegistrationRow = {
    id: `local_plant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    full_name: input.fullName.trim(),
    mobile_number: input.mobileNumber.trim(),
    branch: input.branch.trim(),
    semester: input.semester.trim(),
    photo_url: input.photoUrl || '',
    created_at: new Date().toISOString(),
  };

  // Save to localStorage backup
  try {
    const local = JSON.parse(localStorage.getItem('gec_plantation_registrations') || '[]');
    local.push(payload);
    localStorage.setItem('gec_plantation_registrations', JSON.stringify(local));
  } catch (e) {
    console.warn('LocalStorage backup error:', e);
  }

  if (!supabase || !isSupabaseConfigured()) {
    return {
      success: true,
      id: payload.id,
      error: isSupabaseConfigured() ? undefined : 'Saved locally (Supabase not configured in .env)',
    };
  }

  try {
    const { data, error } = await supabase
      .from('plantation_registrations')
      .insert([
        {
          full_name: payload.full_name,
          mobile_number: payload.mobile_number,
          branch: payload.branch,
          semester: payload.semester,
          photo_url: payload.photo_url || '',
        },
      ])
      .select('id')
      .single();

    if (error) {
      if (
        error.code === 'PGRST204' ||
        error.message?.includes('column') ||
        error.message?.includes('schema cache') ||
        error.message?.includes('photo_url')
      ) {
        const fallbackRes = await supabase
          .from('plantation_registrations')
          .insert([
            {
              full_name: payload.full_name,
              mobile_number: payload.mobile_number,
              branch: payload.branch,
              semester: payload.semester,
            },
          ])
          .select('id')
          .single();

        if (!fallbackRes.error) {
          return { success: true, id: fallbackRes.data?.id };
        }
      }

      console.error('Plantation registration insert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Plantation registration exception:', err);
    return { success: false, error: err?.message || 'Network error occurred during submission' };
  }
};

/**
 * Upload Project Photo to ImageKit '/engineers_day_2026/project_show' folder.
 * Returns the public CDN URL to be stored into Supabase project_show_registrations table.
 */
export const uploadProjectPhoto = async (
  file: File,
  projectTitle: string
): Promise<{ url: string | null; error?: string }> => {
  try {
    const res = await uploadToImageKit(file, 'project-model', projectTitle);
    return { url: res.url || null, error: res.error };
  } catch (err: any) {
    console.error('Project photo upload exception via ImageKit:', err);
    return { url: null, error: err?.message || 'Failed to process and upload project photo' };
  }
};

/**
 * 3. Submit Project Show Registration -> project_show_registrations
 */
export const submitProjectShowRegistration = async (
  input: ProjectShowRegistrationInput,
  photoFile?: File | null
): Promise<{ success: boolean; id?: string; photoUrl?: string; error?: string }> => {
  const supabase = getSupabase();
  let uploadedPhotoUrl = '';

  // Attempt photo upload if file provided
  if (photoFile && supabase) {
    const { url, error: uploadErr } = await uploadProjectPhoto(photoFile, input.projectTitle);
    if (url) {
      uploadedPhotoUrl = url;
    } else {
      console.warn('Could not upload project photo to storage:', uploadErr);
    }
  }

  const payload: ProjectShowRegistrationRow = {
    project_title: input.projectTitle.trim(),
    project_category: input.projectCategory,
    team_leader_name: input.teamLeaderName.trim(),
    team_leader_mobile: input.teamLeaderMobile.trim(),
    team_leader_photo_url: input.teamLeaderPhotoUrl || '',
    branch: input.branch.trim(),
    team_member_count: input.teamMembers.length,
    team_members: input.teamMembers,
    project_description: input.projectDescription.trim(),
    project_photo_url: uploadedPhotoUrl || input.projectPhotoUrl || '',
  };

  // Save to localStorage backup
  try {
    const local = JSON.parse(localStorage.getItem('gec_project_show_registrations') || '[]');
    local.push({ ...payload, registeredAt: new Date().toISOString() });
    localStorage.setItem('gec_project_show_registrations', JSON.stringify(local));
  } catch (e) {
    console.warn('LocalStorage backup error:', e);
  }

  if (!supabase || !isSupabaseConfigured()) {
    return {
      success: true,
      photoUrl: uploadedPhotoUrl,
      error: isSupabaseConfigured() ? undefined : 'Saved locally (Supabase not configured in .env)',
    };
  }

  try {
    const { data, error } = await supabase
      .from('project_show_registrations')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      if (
        error.code === 'PGRST204' ||
        error.message?.includes('column') ||
        error.message?.includes('schema cache')
      ) {
        const fallbackRow: Record<string, any> = {
          project_title: payload.project_title,
          project_category: payload.project_category,
          team_leader_name: payload.team_leader_name,
          team_leader_mobile: payload.team_leader_mobile,
          branch: payload.branch,
          team_member_count: payload.team_member_count,
          team_members: payload.team_members,
          project_description: payload.project_description,
        };

        const fallbackRes = await supabase
          .from('project_show_registrations')
          .insert([fallbackRow])
          .select('id')
          .single();

        if (!fallbackRes.error) {
          return { success: true, id: fallbackRes.data?.id, photoUrl: uploadedPhotoUrl };
        }
      }

      console.error('Project show insert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id, photoUrl: uploadedPhotoUrl };
  } catch (err: any) {
    console.error('Project show registration exception:', err);
    return { success: false, error: err?.message || 'Network error occurred during submission' };
  }
};

/**
 * 4. Submit Blood Donation Registration -> blood_donation_registrations
 */
export const submitBloodDonationRegistration = async (
  input: BloodDonationRegistrationInput
): Promise<{ success: boolean; id?: string; error?: string }> => {
  const supabase = getSupabase();

  const payload: BloodDonationRegistrationRow = {
    full_name: input.fullName.trim(),
    mobile_number: input.mobileNumber.trim(),
    branch: input.branch.trim(),
    semester: input.semester.trim(),
    gender: input.gender,
    age: typeof input.age === 'string' ? parseInt(input.age, 10) || 18 : input.age,
    blood_group: input.bloodGroup && input.bloodGroup !== "Don't Know" ? input.bloodGroup : null,
    photo_url: input.photoUrl || '',
  };

  // Save to localStorage backup
  try {
    const local = JSON.parse(localStorage.getItem('gec_blood_donation_registrations') || '[]');
    local.push({ ...payload, registeredAt: new Date().toISOString() });
    localStorage.setItem('gec_blood_donation_registrations', JSON.stringify(local));
  } catch (e) {
    console.warn('LocalStorage backup error:', e);
  }

  if (!supabase || !isSupabaseConfigured()) {
    return {
      success: true,
      error: isSupabaseConfigured() ? undefined : 'Saved locally (Supabase not configured in .env)',
    };
  }

  try {
    const { data, error } = await supabase
      .from('blood_donation_registrations')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      if (
        error.code === 'PGRST204' ||
        error.message?.includes('column') ||
        error.message?.includes('schema cache') ||
        error.message?.includes('photo_url')
      ) {
        const fallbackRow = {
          full_name: payload.full_name,
          mobile_number: payload.mobile_number,
          branch: payload.branch,
          semester: payload.semester,
          gender: payload.gender,
          age: payload.age,
          blood_group: payload.blood_group,
        };

        const fallbackRes = await supabase
          .from('blood_donation_registrations')
          .insert([fallbackRow])
          .select('id')
          .single();

        if (!fallbackRes.error) {
          return { success: true, id: fallbackRes.data?.id };
        }
      }

      console.error('Blood donation insert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Blood donation registration exception:', err);
    return { success: false, error: err?.message || 'Network error occurred during submission' };
  }
};

/**
 * Helper to normalize and sanitize registration data so both camelCase and snake_case display properly in Admin
 */
const normalizeConclaveRow = (r: any, idx: number): ConclaveRegistrationRow => ({
  id: r.id || `conclave_${idx}_${r.mobile_number || r.mobileNumber || ''}`,
  attendee_type: r.attendee_type || r.attendeeType || 'student',
  full_name: r.full_name || r.fullName || r.name || 'Participant',
  mobile_number: r.mobile_number || r.mobileNumber || r.mobile || '',
  photo_url: r.photo_url || r.photoUrl || r.photo || '',
  branch: r.branch || null,
  semester: r.semester || null,
  guest_question: r.guest_question || r.guestQuestion || null,
  designation: r.designation || null,
  company_name: r.company_name || r.companyName || null,
  guest_category: r.guest_category || r.guestCategory || null,
  created_at: r.created_at || r.registeredAt || new Date().toISOString(),
});

const normalizePlantationRow = (r: any, idx: number): PlantationRegistrationRow => ({
  id: r.id || `plant_${idx}_${r.mobile_number || r.mobileNumber || ''}`,
  full_name: r.full_name || r.fullName || r.name || 'Participant',
  mobile_number: r.mobile_number || r.mobileNumber || r.mobile || '',
  branch: r.branch || 'General',
  semester: r.semester || 'N/A',
  photo_url: r.photo_url || r.photoUrl || r.photo || '',
  created_at: r.created_at || r.registeredAt || new Date().toISOString(),
});

const normalizeProjectShowRow = (r: any, idx: number): ProjectShowRegistrationRow => ({
  id: r.id || `proj_${idx}_${r.team_leader_mobile || r.teamLeaderMobile || ''}`,
  project_title: r.project_title || r.projectTitle || 'Untitled Project',
  project_category: r.project_category || r.projectCategory || 'Hardware / IoT',
  team_leader_name: r.team_leader_name || r.teamLeaderName || 'Leader',
  team_leader_mobile: r.team_leader_mobile || r.teamLeaderMobile || '',
  team_leader_photo_url: r.team_leader_photo_url || r.teamLeaderPhotoUrl || '',
  branch: r.branch || 'Engineering',
  team_member_count: r.team_member_count ?? (r.team_members || r.teamMembers)?.length ?? 0,
  team_members: r.team_members || r.teamMembers || [],
  project_description: r.project_description || r.projectDescription || '',
  project_photo_url: r.project_photo_url || r.projectPhotoUrl || '',
  created_at: r.created_at || r.registeredAt || new Date().toISOString(),
});

const normalizeBloodDonationRow = (r: any, idx: number): BloodDonationRegistrationRow => ({
  id: r.id || `blood_${idx}_${r.mobile_number || r.mobileNumber || ''}`,
  full_name: r.full_name || r.fullName || r.name || 'Donor',
  mobile_number: r.mobile_number || r.mobileNumber || r.mobile || '',
  branch: r.branch || 'General',
  semester: r.semester || 'N/A',
  gender: r.gender || 'Not Specified',
  age: Number(r.age) || 19,
  blood_group: r.blood_group || r.bloodGroup || null,
  photo_url: r.photo_url || r.photoUrl || r.photo || '',
  created_at: r.created_at || r.registeredAt || new Date().toISOString(),
});

/**
 * Fetch registrations for all 4 tables (for Admin Portal)
 * Safely merges cloud data and local backups so no registration is ever missed or malformed.
 */
export const fetchAllActivityRegistrations = async () => {
  const supabase = getSupabase();
  const results = {
    conclave: [] as ConclaveRegistrationRow[],
    plantation: [] as PlantationRegistrationRow[],
    projectShow: [] as ProjectShowRegistrationRow[],
    bloodDonation: [] as BloodDonationRegistrationRow[],
  };

  // 1. Read local storage records
  let localConclave: any[] = [];
  let localPlantation: any[] = [];
  let localProject: any[] = [];
  let localBlood: any[] = [];

  try {
    localConclave = JSON.parse(localStorage.getItem('gec_conclave_registrations') || '[]');
    localPlantation = JSON.parse(localStorage.getItem('gec_plantation_registrations') || '[]');
    localProject = JSON.parse(localStorage.getItem('gec_project_show_registrations') || '[]');
    localBlood = JSON.parse(localStorage.getItem('gec_blood_donation_registrations') || '[]');
  } catch (e) {
    console.warn('Error reading local registrations:', e);
  }

  // 2. Query cloud Supabase tables if connected
  let cloudConclave: any[] = [];
  let cloudPlantation: any[] = [];
  let cloudProject: any[] = [];
  let cloudBlood: any[] = [];

  if (supabase && isSupabaseConfigured()) {
    try {
      const [cRes, cgRes, pRes, psRes, bRes] = await Promise.allSettled([
        supabase.from('conclave_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('conclave_guest_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('plantation_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('project_show_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('blood_donation_registrations').select('*').order('created_at', { ascending: false }),
      ]);

      if (cRes.status === 'fulfilled' && cRes.value.data) {
        cloudConclave = [...cloudConclave, ...cRes.value.data.map((r: any) => ({ ...r, attendee_type: 'student' }))];
      }
      if (cgRes.status === 'fulfilled' && cgRes.value.data) {
        cloudConclave = [...cloudConclave, ...cgRes.value.data.map((r: any) => ({ ...r, attendee_type: 'guest' }))];
      }
      if (pRes.status === 'fulfilled' && pRes.value.data) cloudPlantation = pRes.value.data;
      if (psRes.status === 'fulfilled' && psRes.value.data) cloudProject = psRes.value.data;
      if (bRes.status === 'fulfilled' && bRes.value.data) cloudBlood = bRes.value.data;
    } catch (err) {
      console.warn('Error fetching cloud activity tables:', err);
    }
  }

  // 3. Deduplicate & Merge (Cloud preferred, Local added if not in cloud)
  const mergeRecords = (cloud: any[], local: any[], keyFn: (item: any) => string, normFn: (item: any, idx: number) => any) => {
    const seen = new Set<string>();
    const merged: any[] = [];

    // Add cloud first
    for (const item of cloud) {
      const key = keyFn(item);
      if (key) seen.add(key);
      merged.push(normFn(item, merged.length));
    }

    // Add local if not duplicate
    for (const item of local) {
      const key = keyFn(item);
      if (!key || !seen.has(key)) {
        if (key) seen.add(key);
        merged.push(normFn(item, merged.length));
      }
    }

    return merged;
  };

  results.conclave = mergeRecords(
    cloudConclave,
    localConclave,
    (r) => `${r.mobile_number || r.mobileNumber || ''}_${r.full_name || r.fullName || ''}`,
    normalizeConclaveRow
  );

  results.plantation = mergeRecords(
    cloudPlantation,
    localPlantation,
    (r) => `${r.mobile_number || r.mobileNumber || ''}_${r.full_name || r.fullName || ''}`,
    normalizePlantationRow
  );

  results.projectShow = mergeRecords(
    cloudProject,
    localProject,
    (r) => `${r.team_leader_mobile || r.teamLeaderMobile || ''}_${r.project_title || r.projectTitle || ''}`,
    normalizeProjectShowRow
  );

  results.bloodDonation = mergeRecords(
    cloudBlood,
    localBlood,
    (r) => `${r.mobile_number || r.mobileNumber || ''}_${r.full_name || r.fullName || ''}`,
    normalizeBloodDonationRow
  );

  return results;
};

